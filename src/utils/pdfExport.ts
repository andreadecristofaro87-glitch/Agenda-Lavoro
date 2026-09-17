import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DayRecord } from '../types';
import { calculateMonthSummary, calculateYearSummary, formatHours, formatSiOrEmpty } from './calculations';
import {
  ITALIAN_MONTHS,
  formatItalianDate,
  formatShortDate,
  getDaysInMonth,
  getHolidayInfo,
  getItalianWeekday,
  isSunday,
  padZero,
} from './holidays';

/**
 * Generates and downloads a clean, professional PDF for a specific month
 */
export function exportMonthPDF(
  year: number,
  month: number,
  records: Record<string, DayRecord>
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthName = ITALIAN_MONTHS[month - 1];
  const daysCount = getDaysInMonth(year, month);
  const summary = calculateMonthSummary(year, month, records);
  const yearSummary = calculateYearSummary(year, records);

  // Header Banner (Green company theme with pure white text & logo box)
  doc.setFillColor(43, 168, 53); // Irpiniambiente green #2BA835
  doc.rect(0, 0, 210, 21, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('IRPINIAMBIENTE S.p.A.', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prospetto Mensile Presenze & Straordinari - ${monthName} ${year}`, 14, 16.5);

  // Print Date
  doc.setFontSize(7.5);
  doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 160, 16.5);

  // KPI Summary Cards block below header
  doc.setFillColor(245, 248, 245);
  doc.roundedRect(12, 24, 186, 17, 2, 2, 'F');
  doc.setDrawColor(210, 230, 212);
  doc.roundedRect(12, 24, 186, 17, 2, 2, 'S');

  doc.setTextColor(40, 50, 45);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  // Col 1: Straordinari
  doc.text('STRAORDINARI', 16, 29);
  doc.setFontSize(10);
  doc.setTextColor(43, 168, 53);
  doc.text(`${formatHours(summary.overtimeHours, true)} ore`, 16, 35);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 110, 105);
  doc.text(`(Prog. Anno: ${formatHours(yearSummary.totalOvertimeHours, true)}/150h)`, 16, 39);

  // Col 2: Festivi Lav.
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 45);
  doc.text('FESTIVI LAV.', 60, 29);
  doc.setFontSize(10);
  doc.setTextColor(190, 80, 20);
  doc.text(`${summary.festiviLavorati > 0 ? summary.festiviLavorati + ' gg' : '-'}`, 60, 36);

  // Col 3: Ferie
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 45);
  doc.text('FERIE', 94, 29);
  doc.setFontSize(10);
  doc.setTextColor(13, 148, 136);
  doc.text(`${summary.ferieDays > 0 ? summary.ferieDays + ' gg' : '-'}`, 94, 36);

  // Col 4: Permessi (Ore)
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 45);
  doc.text('ORE PERMESSO', 124, 29);
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text(`${summary.permitHours > 0 ? formatHours(summary.permitHours) + ' h' : '-'}`, 124, 36);

  // Col 5: Malattia & Altri
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 45);
  doc.text('MALATTIA / ALTRI', 158, 29);
  doc.setFontSize(9);
  doc.setTextColor(180, 40, 40);
  const malTxt = summary.malattiaDays > 0 ? `${summary.malattiaDays} mal.` : '';
  const altTxt = summary.altriPermessiDays > 0 ? `${summary.altriPermessiDays} alt.` : '';
  const combined = [malTxt, altTxt].filter(Boolean).join(' / ') || '-';
  doc.text(combined, 158, 36);

  // Build rows for autoTable
  const tableData: (string | number)[][] = [];

  for (let d = 1; d <= daysCount; d++) {
    const dateStr = `${year}-${padZero(month)}-${padZero(d)}`;
    const rec = records[dateStr];
    const weekday = getItalianWeekday(dateStr);
    const holiday = getHolidayInfo(dateStr);
    const sunday = isSunday(dateStr);

    let infoExtra = '';
    if (holiday) {
      infoExtra = holiday.name;
    } else if (sunday) {
      infoExtra = 'Domenica';
    } else if (rec?.notes) {
      // Truncate long note if needed to prevent multi-line overflow
      infoExtra = rec.notes.length > 40 ? rec.notes.substring(0, 38) + '…' : rec.notes;
    }

    tableData.push([
      formatShortDate(dateStr),
      weekday,
      rec?.overtimeHours ? formatHours(rec.overtimeHours) : '',
      formatSiOrEmpty(rec?.festivoLavorato),
      formatSiOrEmpty(rec?.ferie),
      rec?.permitHours ? formatHours(rec.permitHours) : '',
      formatSiOrEmpty(rec?.malattia),
      formatSiOrEmpty(rec?.altriPermessi),
      infoExtra,
    ]);
  }

  // Add Totals row
  tableData.push([
    'TOTALE',
    `${daysCount} giorni`,
    summary.overtimeHours ? formatHours(summary.overtimeHours, true) : '',
    summary.festiviLavorati > 0 ? `${summary.festiviLavorati}` : '',
    summary.ferieDays > 0 ? `${summary.ferieDays}` : '',
    summary.permitHours > 0 ? formatHours(summary.permitHours, true) : '',
    summary.malattiaDays > 0 ? `${summary.malattiaDays}` : '',
    summary.altriPermessiDays > 0 ? `${summary.altriPermessiDays}` : '',
    '',
  ]);

  autoTable(doc, {
    startY: 44,
    margin: { left: 12, right: 12 },
    head: [[
      'Data',
      'Giorno',
      'Straord.',
      'Fest. Lav.',
      'Ferie',
      'Ore Perm.',
      'Malattia',
      'Altro Perm.',
      'Note / Festività',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.15,
      textColor: [40, 45, 45],
      lineColor: [220, 225, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [235, 243, 235],
      textColor: [30, 70, 35],
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 },
      1: { halign: 'left', cellWidth: 23 },
      2: { halign: 'center', cellWidth: 17, fontStyle: 'bold' },
      3: { halign: 'center', cellWidth: 17 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 17 },
      6: { halign: 'center', cellWidth: 17 },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'left', cellWidth: 44 },
    },
    didParseCell: (data) => {
      // Highlight sundays and holidays in red
      const rowIndex = data.row.index;
      if (rowIndex < daysCount) {
        const d = rowIndex + 1;
        const dateStr = `${year}-${padZero(month)}-${padZero(d)}`;
        const holiday = getHolidayInfo(dateStr);
        const sunday = isSunday(dateStr);

        if (holiday || sunday) {
          if (data.column.index === 0 || data.column.index === 1 || data.column.index === 8) {
            data.cell.styles.textColor = [220, 38, 38]; // Red text
            if (holiday) {
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }

        // Highlight Ferie
        const rec = records[dateStr];
        if (rec?.ferie && data.column.index === 4) {
          data.cell.styles.fillColor = [225, 245, 240];
          data.cell.styles.textColor = [13, 148, 136];
          data.cell.styles.fontStyle = 'bold';
        }
        // Highlight Festivo Lavorato
        if (rec?.festivoLavorato && data.column.index === 3) {
          data.cell.styles.fillColor = [254, 243, 199];
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fontStyle = 'bold';
        }
      }

      // Totals row formatting
      if (rowIndex === daysCount) {
        data.cell.styles.fillColor = [240, 248, 242];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [20, 80, 30];
      }
    },
  });

  // Signatures on single A4 sheet
  doc.setFontSize(8);
  doc.setTextColor(80, 85, 80);
  doc.text('Firma del Lavoratore: _______________________', 14, 274);
  doc.text('Visto Ufficio Personale: _______________________', 122, 274);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(140, 145, 140);
    doc.text(
      `Irpiniambiente S.p.A. - Documento gestionale conforme • Foglio ${i} di ${pageCount}`,
      14,
      286
    );
  }

  doc.save(`irpiniambiente_${year}_${padZero(month)}_${monthName.toLowerCase()}.pdf`);
}

/**
 * Generates and downloads Annual Summary PDF
 */
export function exportYearSummaryPDF(
  year: number,
  records: Record<string, DayRecord>
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const yearSummary = calculateYearSummary(year, records);

  // Header Banner
  doc.setFillColor(43, 168, 53);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('IRPINIAMBIENTE S.p.A.', 14, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Riepilogo Annuale Straordinari e Presenze - Anno ${year}`, 14, 20);

  doc.setFontSize(8);
  doc.text(`Data stampa: ${new Date().toLocaleDateString('it-IT')}`, 155, 20);

  // 150-Hour Overtime Status Card
  const boxY = 32;
  const isLimitReached = yearSummary.limitReached;
  doc.setFillColor(isLimitReached ? 254 : 243, isLimitReached ? 242 : 249, isLimitReached ? 242 : 244);
  doc.roundedRect(14, boxY, 182, 34, 3, 3, 'F');
  doc.setDrawColor(isLimitReached ? 248 : 180, isLimitReached ? 113 : 220, isLimitReached ? 113 : 185);
  doc.roundedRect(14, boxY, 182, 34, 3, 3, 'S');

  doc.setTextColor(30, 40, 35);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATO STRAORDINARI ANNO ${year} (Limite contrattuale: 150 ore)`, 20, boxY + 8);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ore di straordinario effettuate: ${formatHours(yearSummary.totalOvertimeHours, true)} h`, 20, boxY + 16);

  if (isLimitReached) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text(`✓ 150 ORE RAGGIUNTE`, 20, boxY + 23);
    doc.setFontSize(9);
    doc.text(`Superamento: +${formatHours(yearSummary.hoursExceeded150, true)} ore oltre il limite`, 20, boxY + 29);
  } else {
    doc.setTextColor(43, 168, 53);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ore mancanti alle 150: ${formatHours(yearSummary.hoursRemainingTo150, true)} ore`, 20, boxY + 23);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 110, 105);
    doc.text(`Progresso annuale: ${Math.round((yearSummary.totalOvertimeHours / 150) * 100)}%`, 20, boxY + 29);
  }

  // Annual Totals Table (Gennaio to Dicembre + TOTALE)
  const rows = yearSummary.monthlyBreakdown.map((m) => [
    m.monthName,
    m.overtimeHours > 0 ? formatHours(m.overtimeHours) : '',
    m.festiviLavorati > 0 ? `${m.festiviLavorati}` : '',
    m.ferieDays > 0 ? `${m.ferieDays}` : '',
    m.permitHours > 0 ? formatHours(m.permitHours) : '',
    m.malattiaDays > 0 ? `${m.malattiaDays}` : '',
    m.altriPermessiDays > 0 ? `${m.altriPermessiDays}` : '',
  ]);

  // Push final TOTALE row
  rows.push([
    'TOTALE ANNUALE',
    yearSummary.totalOvertimeHours > 0 ? formatHours(yearSummary.totalOvertimeHours, true) : '',
    yearSummary.totalFestiviLavorati > 0 ? `${yearSummary.totalFestiviLavorati}` : '',
    yearSummary.totalFerieDays > 0 ? `${yearSummary.totalFerieDays}` : '',
    yearSummary.totalPermitHours > 0 ? formatHours(yearSummary.totalPermitHours, true) : '',
    yearSummary.totalMalattiaDays > 0 ? `${yearSummary.totalMalattiaDays}` : '',
    yearSummary.totalAltriPermessiDays > 0 ? `${yearSummary.totalAltriPermessiDays}` : '',
  ]);

  autoTable(doc, {
    startY: 72,
    head: [[
      'Mese',
      'Straordinari',
      'Festivi Lav.',
      'Ferie',
      'Ore Permesso',
      'Malattia',
      'Altri Permessi',
    ]],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [40, 45, 45],
      lineColor: [220, 225, 220],
    },
    headStyles: {
      fillColor: [235, 243, 235],
      textColor: [30, 70, 35],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'center', fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
    didParseCell: (data) => {
      // Style final row
      if (data.row.index === 12) {
        data.cell.styles.fillColor = [230, 243, 232];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [20, 70, 25];
      }
    },
  });

  // Signatures on single A4 sheet
  doc.setFontSize(8);
  doc.setTextColor(80, 85, 80);
  doc.text('Firma del Lavoratore: _______________________', 14, 274);
  doc.text('Visto Ufficio Personale: _______________________', 122, 274);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(140, 145, 140);
    doc.text(
      `Irpiniambiente S.p.A. - Riepilogo Annuale ${year} • Foglio ${i} di ${pageCount}`,
      14,
      286
    );
  }

  doc.save(`irpiniambiente_riepilogo_annuale_${year}.pdf`);
}
