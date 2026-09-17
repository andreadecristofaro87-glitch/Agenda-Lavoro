import React from 'react';
import { DayRecord } from '../types';
import { calculateYearSummary, formatHours, formatCount } from '../utils/calculations';
import { OvertimeProgressBar } from './OvertimeProgressBar';
import { IrpiniambienteLogo } from './IrpiniambienteLogo';
import { RiepilogoPrintTable } from './RiepilogoPrintTable';
import { exportYearSummaryPDF } from '../utils/pdfExport';
import { FileDown, Printer, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface RiepilogoViewProps {
  currentYear: number;
  onSelectYear: (year: number) => void;
  records: Record<string, DayRecord>;
  onSelectMonth?: (year: number, month: number) => void;
}

export const RiepilogoView: React.FC<RiepilogoViewProps> = ({
  currentYear,
  onSelectYear,
  records,
  onSelectMonth,
}) => {
  const yearSummary = calculateYearSummary(currentYear, records);

  // Generate list of available selectable years around current year (e.g. past 5 years and next 5 years)
  // dynamically generated perpetual calendar
  const yearOptions: number[] = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="riepilogo-view" className="w-full pb-24 print:pb-0 max-w-2xl mx-auto px-3.5 sm:px-4 pt-3 print:p-0 print:m-0 print:max-w-none">
      {/* Printable A4 Table (strictly 1 single page) */}
      <RiepilogoPrintTable currentYear={currentYear} yearSummary={yearSummary} />

      {/* Screen-Only Content */}
      <div className="print:hidden">
        {/* Irpiniambiente Logo - strictly white background */}
        <div className="mb-4">
          <IrpiniambienteLogo className="w-full max-w-xs mx-auto" maxHeight={56} showSubtitle={true} />
        </div>

      {/* Header & Year Switcher */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              RIEPILOGO ANNUALE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 tracking-tight">
              Stato dell'Anno {currentYear}
            </h2>
          </div>

          {/* Year selector stepper */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-50 border border-gray-200 p-1 rounded-xl">
            <button
              onClick={() => onSelectYear(currentYear - 1)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white active:scale-95 transition"
              title="Anno precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentYear}
              onChange={(e) => onSelectYear(parseInt(e.target.value, 10))}
              className="bg-transparent font-black text-base text-gray-800 py-1 px-2 focus:outline-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={() => onSelectYear(currentYear + 1)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-white active:scale-95 transition"
              title="Anno successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => exportYearSummaryPDF(currentYear, records)}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs sm:text-sm font-bold border border-emerald-200 transition"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            📄 ESPORTA PDF ANNO
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm font-bold transition"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            🖨️ STAMPA
          </button>
        </div>
      </div>

      {/* 14. Sezione STRAORDINARI & 150 ORE */}
      <div className="mb-4">
        <OvertimeProgressBar year={currentYear} totalHours={yearSummary.totalOvertimeHours} />
      </div>

      {/* KPI Cards Grid (Annual Totals) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {/* 15. Festività Lavorate */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-amber-800 tracking-wide">
            FESTIVITÀ LAVORATE
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {formatCount(yearSummary.totalFestiviLavorati) || '—'}
            </span>
            {yearSummary.totalFestiviLavorati > 0 && (
              <span className="text-xs font-semibold text-gray-500 ml-1">giorni</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Conteggio "SI" festivi</span>
        </div>

        {/* 16. Ferie */}
        <div className="bg-white rounded-2xl border border-teal-200/80 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-teal-800 tracking-wide">
            FERIE UTILIZZATE
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">
              {formatCount(yearSummary.totalFerieDays) || '—'}
            </span>
            {yearSummary.totalFerieDays > 0 && (
              <span className="text-xs font-semibold text-gray-500 ml-1">giorni</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Conteggio "SI" ferie</span>
        </div>

        {/* 19. Ore di Permesso */}
        <div className="bg-white rounded-2xl border border-indigo-200/80 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-indigo-800 tracking-wide">
            ORE DI PERMESSO
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">
              {formatHours(yearSummary.totalPermitHours) || '—'}
            </span>
            {yearSummary.totalPermitHours > 0 && (
              <span className="text-xs font-semibold text-gray-500 ml-1">ore</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Somma ore permesso</span>
        </div>

        {/* 17. Giorni di Malattia */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-rose-800 tracking-wide">
            GIORNI DI MALATTIA
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              {formatCount(yearSummary.totalMalattiaDays) || '—'}
            </span>
            {yearSummary.totalMalattiaDays > 0 && (
              <span className="text-xs font-semibold text-gray-500 ml-1">giorni</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Conteggio "SI" malattia</span>
        </div>

        {/* 18. Altri Giorni di Permesso */}
        <div className="bg-white rounded-2xl border border-purple-200/80 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-purple-800 tracking-wide">
            ALTRI GIORNI PERM.
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">
              {formatCount(yearSummary.totalAltriPermessiDays) || '—'}
            </span>
            {yearSummary.totalAltriPermessiDays > 0 && (
              <span className="text-xs font-semibold text-gray-500 ml-1">giorni</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Conteggio "SI" altri</span>
        </div>

        {/* Total Overtime */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase text-emerald-800 tracking-wide">
            TOT. STRAORDINARIO
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {formatHours(yearSummary.totalOvertimeHours) || '—'}
            </span>
            {yearSummary.totalOvertimeHours > 0 && (
              <span className="text-xs font-semibold text-gray-500 ml-1">ore</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Ripartito il 1 gennaio</span>
        </div>
      </div>

      {/* 20. RIEPILOGO MENSILE (Gennaio - Dicembre + TOTALE) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
            DETTAGLIO MENSILE {currentYear}
          </h3>
          <span className="text-[11px] text-gray-500">Tocca un mese per aprirlo</span>
        </div>

        {/* Responsive Table with soft borders (No harsh Excel grids) */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Mese</th>
                <th className="py-2.5 px-2 text-center text-emerald-800">Straord.</th>
                <th className="py-2.5 px-2 text-center text-amber-800">Fest. Lav.</th>
                <th className="py-2.5 px-2 text-center text-teal-800">Ferie</th>
                <th className="py-2.5 px-2 text-center text-indigo-800">Ore Perm.</th>
                <th className="py-2.5 px-2 text-center text-rose-800">Malattia</th>
                <th className="py-2.5 px-2 text-center text-purple-800">Altri Perm.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {yearSummary.monthlyBreakdown.map((m) => {
                const hasData =
                  m.overtimeHours > 0 ||
                  m.festiviLavorati > 0 ||
                  m.ferieDays > 0 ||
                  m.permitHours > 0 ||
                  m.malattiaDays > 0 ||
                  m.altriPermessiDays > 0;

                return (
                  <tr
                    key={m.month}
                    onClick={() => onSelectMonth && onSelectMonth(currentYear, m.month)}
                    className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-gray-900 flex items-center gap-1.5">
                      {m.monthName}
                      {hasData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-700">
                      {m.overtimeHours > 0 ? formatHours(m.overtimeHours) : ''}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-amber-700">
                      {m.festiviLavorati > 0 ? m.festiviLavorati : ''}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-teal-700">
                      {m.ferieDays > 0 ? m.ferieDays : ''}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-indigo-700">
                      {m.permitHours > 0 ? formatHours(m.permitHours) : ''}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-rose-700">
                      {m.malattiaDays > 0 ? m.malattiaDays : ''}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-purple-700">
                      {m.altriPermessiDays > 0 ? m.altriPermessiDays : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-emerald-600 bg-emerald-50/60 font-black text-gray-900">
                <td className="py-3 px-3 uppercase text-emerald-900 font-extrabold">TOTALE</td>
                <td className="py-3 px-2 text-center text-emerald-800 font-black">
                  {yearSummary.totalOvertimeHours > 0 ? formatHours(yearSummary.totalOvertimeHours, true) : ''}
                </td>
                <td className="py-3 px-2 text-center text-amber-800">
                  {yearSummary.totalFestiviLavorati > 0 ? yearSummary.totalFestiviLavorati : ''}
                </td>
                <td className="py-3 px-2 text-center text-teal-800">
                  {yearSummary.totalFerieDays > 0 ? yearSummary.totalFerieDays : ''}
                </td>
                <td className="py-3 px-2 text-center text-indigo-800">
                  {yearSummary.totalPermitHours > 0 ? formatHours(yearSummary.totalPermitHours, true) : ''}
                </td>
                <td className="py-3 px-2 text-center text-rose-800">
                  {yearSummary.totalMalattiaDays > 0 ? yearSummary.totalMalattiaDays : ''}
                </td>
                <td className="py-3 px-2 text-center text-purple-800">
                  {yearSummary.totalAltriPermessiDays > 0 ? yearSummary.totalAltriPermessiDays : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
