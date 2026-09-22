import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
  width?: number;
}

export function exportToExcel<T>({
  filename,
  sheetName = 'Reporte',
  title,
  data,
  columns,
}: {
  filename: string;
  sheetName?: string;
  title: string;
  data: T[];
  columns: ExportColumn<T>[];
}) {
  const currentDate = new Date().toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // 1. Build rows
  const wsData: (string | number | boolean | null | undefined)[][] = [];

  // Title block
  wsData.push(['PANADERÍA & PASTELERÍA CLAUDIPAN']);
  wsData.push([title.toUpperCase()]);
  wsData.push([`Generado el: ${currentDate}`]);
  wsData.push([`Total Registros: ${data.length}`]);
  wsData.push([]); // blank line

  // Column Headers
  const headers = columns.map(c => c.header);
  wsData.push(headers);

  // Data rows
  data.forEach((item) => {
    const row = columns.map(c => {
      const val = c.accessor(item);
      return val ?? '';
    });
    wsData.push(row);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Calculate auto column widths
  const colWidths = columns.map((c) => {
    if (c.width) return { wch: c.width };
    let maxLen = c.header.length;
    data.forEach(item => {
      const val = String(c.accessor(item) ?? '');
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
  });

  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  // Write file
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}
