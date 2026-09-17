import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Test Month PDF with 31 days (e.g. Gennaio, Ottobre, Dicembre)
function testMonth(daysCount = 31) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(43, 168, 53);
  doc.rect(0, 0, 210, 26, 'F');
  doc.text('TEST', 14, 12);

  const tableData = [];
  for (let d = 1; d <= daysCount; d++) {
    tableData.push([`${d}/01`, 'Lunedì', '2,5h', '', 'SI', '', '', '', '']);
  }
  tableData.push(['TOTALE', '31 giorni', '25h', '1', '2', '0', '0', '0', '']);

  autoTable(doc, {
    startY: 56,
    head: [['Data', 'Giorno', 'Straord.', 'Fest. Lav.', 'Ferie', 'Ore Perm.', 'Malattia', 'Altro Perm.', 'Note / Festività']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.6,
    },
  });

  console.log(`Month PDF (${daysCount} days) - Pages:`, doc.getNumberOfPages());
}

testMonth(31);
