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
  if (!response.ok) throw new Error("Report card logo could not be loaded");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Report card logo could not be read"));
    reader.readAsDataURL(blob);
  });
};

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
  const logo = await imageDataUrl("/report-card-logo.png");

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

  doc.addImage(logo, "PNG", pageWidth / 2 - 73, 12, 146, 29.25);
  doc.setTextColor(20, 52, 93);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1st Term Exams", pageWidth / 2, 47, { align: "center" });
  doc.setFontSize(11);
  doc.text("MARK SHEET", pageWidth / 2, 54, { align: "center" });
  doc.setFont("helvetica", "normal");

  doc.setFontSize(9);
  doc.text(`NAME: ${student.name}`, margin + 2, 65);
  doc.text(`CLASS: ${className}`, pageWidth - margin - 2, 65, { align: "right" });

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
    startY: 72,
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
      cellPadding: 2,
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
      fontSize: 6.5,
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
  doc.text("Position :", margin, tableEndY + 14);
  doc.setDrawColor(20, 52, 93);
  doc.roundedRect(margin + 24, tableEndY + 7, 28, 11, 1.5, 1.5);
  doc.setFont("helvetica", "normal");
  doc.text(ordinal(position), margin + 38, tableEndY + 14, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Remarks :", margin, tableEndY + 29);
  doc.setDrawColor(20, 52, 93);
  doc.rect(margin, tableEndY + 33, contentWidth, 22);
  doc.setFont("helvetica", "normal");
  doc.text("Teacher's Signature: ____________________", margin, tableEndY + 67);
  doc.text("Principal's Signature: ____________________", pageWidth - margin, tableEndY + 67, { align: "right" });

  doc.save(`${cleanFileName(student.name)}-${cleanFileName(termName)}-report-card.pdf`);
};
