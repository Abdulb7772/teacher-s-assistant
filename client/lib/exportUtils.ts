export interface ExportColumn<T = Record<string, unknown>> {
  header: string;
  accessor: (row: T) => string | number | Date | null | undefined;
}

const cleanValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
};

const toRows = <T>(data: T[], columns: ExportColumn<T>[]): string[][] =>
  data.map((row) => columns.map((col) => cleanValue(col.accessor(row))));

export const exportPDF = async <T>(title: string, columns: ExportColumn<T>[], data: T[], filename: string): Promise<void> => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFillColor(7, 26, 47);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 14, 19);

  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: toRows(data, columns),
    startY: 36,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [212, 175, 55], textColor: [7, 26, 47], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${filename}.pdf`);
};
