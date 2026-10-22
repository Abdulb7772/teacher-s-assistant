import type { ExamMark, Student } from "@/types";
import { gradeFor, percentageOf, PASS_PERCENT } from "@/lib/grades";

const cleanFileName = (value: string): string => value.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "");

export const downloadReportCard = async (
  student: Student,
  className: string,
  termName: string,
  marks: ExamMark[]
): Promise<void> => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const totalMarks = marks.reduce((sum, mark) => sum + Number(mark.totalMarks), 0);
  const obtainedMarks = marks.reduce(
    (sum, mark) => sum + (mark.obtainedMarks === null ? 0 : Number(mark.obtainedMarks)),
    0
  );
  const overallPercentage = percentageOf(obtainedMarks, totalMarks);
  const overallGrade = gradeFor(overallPercentage);

  doc.setFillColor(35, 35, 35);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  doc.setLineWidth(0.2);
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("PENKEEN EDUCATION SYSTEM", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("1st Term Exams", pageWidth / 2, 29, { align: "center" });
  doc.setFontSize(11);
  doc.text("Mark sheet", pageWidth / 2, 36, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Session: ${termName}`, pageWidth / 2, 43, { align: "center" });

  doc.setFontSize(9);
  doc.text(`NAME: ${student.name}`, margin, 54);
  doc.text(`CLASS: ${className}`, pageWidth - margin, 54, { align: "right" });

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
      percentage === null ? "Pending" : percentage >= PASS_PERCENT ? "Pass" : "Fail",
    ];
  });

  autoTable(doc, {
    startY: 60,
    margin: { left: margin, right: margin },
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
        overallPercentage >= PASS_PERCENT ? "Pass" : "Fail",
      ],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      textColor: [255, 255, 255],
      fillColor: [35, 35, 35],
      lineColor: [255, 255, 255],
      lineWidth: 0.15,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [35, 35, 35],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 29 },
      1: { cellWidth: 19 },
      2: { cellWidth: 22 },
      3: { cellWidth: 14 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
      6: { cellWidth: 35 },
    },
  });

  const tableEndY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 150;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Remarks :", margin, tableEndY + 17);
  doc.setDrawColor(255, 255, 255);
  doc.rect(margin, tableEndY + 21, pageWidth - margin * 2, 25);
  doc.setFont("helvetica", "normal");
  doc.text("Teacher's Signature: ____________________", margin, tableEndY + 65);
  doc.text("Principal's Signature: ____________________", pageWidth - margin, tableEndY + 65, { align: "right" });

  doc.save(`${cleanFileName(student.name)}-${cleanFileName(termName)}-report-card.pdf`);
};
