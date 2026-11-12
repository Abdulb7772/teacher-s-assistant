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
  const watermark = await imageDataUrl("/report-card-watermark.jpeg");
  const studentPhoto = student.photoUrl ? await imageDataUrl(student.photoUrl) : null;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [216, 280] });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = 174;
  const margin = (pageWidth - contentWidth) / 2;
  const topReserved = 60;
  const bottomReserved = 20;
  const totalMarks = marks.reduce((sum, mark) => sum + Number(mark.totalMarks), 0);
  const obtainedMarks = marks.reduce(
    (sum, mark) => sum + (mark.obtainedMarks === null ? 0 : Number(mark.obtainedMarks)),
    0
  );
  const overallPercentage = percentageOf(obtainedMarks, totalMarks);
  const overallGrade = gradeFor(overallPercentage);
  const topOffset = topReserved - 8;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.addImage(watermark, "JPEG", pageWidth / 2 - 42, topReserved + 28, 84, 84);
  doc.restoreGraphicsState();

  doc.setTextColor(20, 52, 93);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1st Term Exams", pageWidth / 2, topOffset + 8, { align: "center" });
  doc.setFontSize(11);
  doc.text("MARK SHEET", pageWidth / 2, topOffset + 15, { align: "center" });
  doc.setFont("helvetica", "normal");

  doc.setFontSize(8);
  doc.text(`NAME: ${student.name}`, margin + 2, topOffset + 25);
  doc.text(`CLASS: ${className}`, pageWidth - margin - 2, topOffset + 25, { align: "right" });
  if (studentPhoto) doc.addImage(studentPhoto, "JPEG", pageWidth - margin - 20, topOffset + 9, 20, 18);

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
    startY: topOffset + 31,
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
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.25,
      textColor: [20, 30, 45],
      fillColor: false,
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

  const tableEndY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? topOffset + 47;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(20, 52, 93);
  doc.setDrawColor(20, 52, 93);
  const positionY = tableEndY + 8;
  doc.text("Position :", margin, positionY);
  doc.line(margin + 25, positionY + 1, margin + 55, positionY + 1);
  doc.setFont("helvetica", "normal");
  doc.text(ordinal(position), margin + 40, positionY, { align: "center" });
  doc.setFont("helvetica", "bold");
  const remarksLabelY = tableEndY + 20;
  doc.text("Remarks :", margin, remarksLabelY);
  doc.setDrawColor(100, 110, 125);
  doc.line(margin, remarksLabelY + 4, pageWidth - margin, remarksLabelY + 4);
  doc.line(margin, remarksLabelY + 10, pageWidth - margin, remarksLabelY + 10);

  const gradingStartY = remarksLabelY + 24;
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.32 }));
  autoTable(doc, {
    startY: gradingStartY,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: [["MARKS / GRADE TABLE", "", ""]],
    body: GRADE_SCHEME.map(([grade, percentage, gpa]) => [grade, percentage, `GPA ${gpa}`]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 5.5,
      cellPadding: 0.7,
      textColor: [80, 80, 80],
      fillColor: [255, 255, 255],
      halign: "center",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [80, 80, 80],
      fontStyle: "bold",
      fontSize: 5.5,
    },
    columnStyles: {
      0: { cellWidth: 58 },
      1: { cellWidth: 58 },
      2: { cellWidth: 58 },
    },
  });
  doc.restoreGraphicsState();

  const gradingEndY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? gradingStartY + 55;
  const signatureY = Math.min(gradingEndY + 44, pageHeight - bottomReserved - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Teacher's Signature: ____________________", margin, signatureY + 4);
  doc.text("Principal's Signature: ____________________", pageWidth - margin, signatureY + 4, { align: "right" });

  doc.save(`${cleanFileName(student.name)}-${cleanFileName(termName)}-report-card.pdf`);
};
