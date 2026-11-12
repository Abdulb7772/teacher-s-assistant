import type { ExamMark, Student } from "@/types";
import { gradeFor, percentageOf } from "@/lib/grades";

const cleanFileName = (value: string): string => value.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "");

const ordinal = (value: string): string => {
  const rank = Number(value);
  if (!Number.isInteger(rank) || rank < 1) return value;
  const suffix = rank % 100 >= 11 && rank % 100 <= 13 ? "th" : rank % 10 === 1 ? "st" : rank % 10 === 2 ? "nd" : rank % 10 === 3 ? "rd" : "th";
  return `${rank}${suffix}`;
};

const imageDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Report card image could not be loaded");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Report card image could not be read"));
    reader.readAsDataURL(blob);
  });
};

const GRADE_SCHEME = [
  ["A++", "95-100", "5.0"], ["A+", "90-94", "4.7"], ["A", "85-89", "4.3"],
  ["B++", "80-84", "4.0"], ["B+", "75-79", "3.7"], ["B", "70-74", "3.3"],
  ["C+", "65-69", "3.0"], ["C", "60-64", "3.0"], ["D", "50-59", "2.0"],
  ["E", "40-49", "1.0"], ["U", "0-39", "0.0"],
];

export const downloadReportCard = async (
  student: Student,
  className: string,
  termName: string,
  marks: ExamMark[],
  position: string
): Promise<void> => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const studentPhoto = student.photoUrl ? await imageDataUrl(student.photoUrl) : null;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = 174;
  const margin = (pageWidth - contentWidth) / 2;
  const totalMarks = marks.reduce((sum, mark) => sum + Number(mark.totalMarks), 0);
  const obtainedMarks = marks.reduce(
    (sum, mark) => sum + (mark.obtainedMarks === null ? 0 : Number(mark.obtainedMarks)),
    0
  );
  const overallPercentage = percentageOf(obtainedMarks, totalMarks);
  const overallGrade = gradeFor(overallPercentage);

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setDrawColor(20, 52, 93);
  doc.setLineWidth(0.5);
  doc.rect(10, 8, pageWidth - 20, pageHeight - 16);
  doc.setLineWidth(0.2);
  doc.setDrawColor(191, 145, 35);
  doc.rect(12, 10, pageWidth - 24, pageHeight - 20);

  doc.setTextColor(20, 52, 93);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1st Term Exams", pageWidth / 2, 24, { align: "center" });
  doc.setFontSize(11);
  doc.text("MARK SHEET", pageWidth / 2, 31, { align: "center" });
  doc.setFont("helvetica", "normal");

  doc.setFontSize(8);
  doc.text(`NAME: ${student.name}`, margin + 2, 41);
  doc.text(`CLASS: ${className}`, pageWidth - margin - 2, 41, { align: "right" });
  if (studentPhoto) doc.addImage(studentPhoto, "JPEG", pageWidth - margin - 20, 25, 20, 18);

  const rows = marks.map((mark) => {
    const hasMark = mark.obtainedMarks !== null && mark.obtainedMarks !== undefined;
    const obtained = hasMark ? Number(mark.obtainedMarks) : 0;
    const percentage = hasMark ? percentageOf(obtained, Number(mark.totalMarks)) : null;
    const grade = percentage === null ? "" : gradeFor(percentage);
    return [
      mark.subject,
      String(mark.totalMarks),
      hasMark ? String(mark.obtainedMarks) : "",
      grade ? grade.grade : "",
      percentage === null ? "" : `${percentage}%`,
      grade ? grade.gpa.toFixed(1) : "",
      "",
    ];
  });

  autoTable(doc, {
    startY: 47,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: [["SUBJECT", "TOTAL MARKS", "OBTAINED MARKS", "GRADE", "PERCENTAGE", "GRADE POINT (GPA)", "DESCRIPTION / STATUS"]],
    body: [
      ...rows,
      [
        "TOTAL",
        String(totalMarks),
        String(obtainedMarks),
        overallGrade.grade,
        `${overallPercentage}%`,
        overallGrade.gpa.toFixed(1),
        "",
      ],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.25,
      textColor: [20, 30, 45],
      fillColor: [255, 255, 255],
      lineColor: [20, 52, 93],
      lineWidth: 0.15,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [20, 52, 93],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6,
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) data.cell.styles.fontStyle = "bold";
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 32 },
      1: { cellWidth: 21 },
      2: { cellWidth: 26 },
      3: { cellWidth: 17 },
      4: { cellWidth: 23 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
    },
  });

  const tableEndY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 150;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(20, 52, 93);
  doc.setDrawColor(20, 52, 93);
  doc.text("Position :", margin, tableEndY + 8);
  doc.line(margin + 25, tableEndY + 9, margin + 55, tableEndY + 9);
  doc.setFont("helvetica", "normal");
  doc.text(ordinal(position), margin + 40, tableEndY + 8, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Remarks :", margin, tableEndY + 20);
  doc.setDrawColor(20, 52, 93);
  doc.rect(margin, tableEndY + 23, contentWidth, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Teacher's Signature: ____________________", margin, tableEndY + 44);
  doc.text("Principal's Signature: ____________________", pageWidth - margin, tableEndY + 44, { align: "right" });

  const gradingStartY = tableEndY + 50;
  const gradingGap = 4;
  const gradingTableWidth = (contentWidth - gradingGap) / 2;
  const gradingColumnStyles = {
    0: { cellWidth: 20, fontStyle: "bold" as const },
    1: { cellWidth: 37 },
    2: { cellWidth: gradingTableWidth - 57 },
  };
  const gradingTableOptions = {
    startY: gradingStartY,
    margin: { left: margin, right: margin },
    tableWidth: gradingTableWidth,
    head: [["GRADE", "PERCENTAGE", "GPA"]],
    theme: "grid" as const,
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.8,
      minCellHeight: 11,
      halign: "center" as const,
      valign: "middle" as const,
      textColor: [80, 80, 80] as [number, number, number],
      lineColor: [150, 150, 150] as [number, number, number],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [90, 90, 90] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 7,
    },
    columnStyles: gradingColumnStyles,
  };

  autoTable(doc, {
    ...gradingTableOptions,
    body: GRADE_SCHEME.slice(0, 6),
  });
  autoTable(doc, {
    ...gradingTableOptions,
    margin: { left: margin + gradingTableWidth + gradingGap, right: margin },
    body: GRADE_SCHEME.slice(6),
  });

  doc.save(`${cleanFileName(student.name)}-${cleanFileName(termName)}-report-card.pdf`);
};
