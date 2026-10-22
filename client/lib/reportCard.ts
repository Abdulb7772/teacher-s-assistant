import JSZip from "jszip";
import type { ExamMark, Student } from "@/types";
import { gradeFor, percentageOf } from "@/lib/grades";

const TEMPLATE_URL = "/templates/7_marks_sheet_updated.docx";
const SUBJECT_ROW_COUNT = 8;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const setCellText = (cell: string, value: string): string => {
  const escaped = escapeXml(value);
  let replaced = false;
  return cell.replace(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g, (textTag) => {
    if (replaced) return textTag.replace(/>[\s\S]*?</, "></");
    replaced = true;
    return textTag.replace(/>[\s\S]*?</, `>${escaped}<`);
  });
};

const fillTableRows = (xml: string, marks: ExamMark[]): string => {
  const rows = [...xml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g)];
  const subjectRows = rows.slice(1, SUBJECT_ROW_COUNT + 1);
  const totalMarks = marks.reduce((sum, mark) => sum + Number(mark.totalMarks), 0);
  const obtainedMarks = marks.reduce(
    (sum, mark) => sum + (mark.obtainedMarks === null ? 0 : Number(mark.obtainedMarks)),
    0
  );

  const values = subjectRows.map((row, index) => {
    const mark = marks[index];
    if (!mark) return null;
    const obtained = mark.obtainedMarks === null ? "" : String(mark.obtainedMarks);
    const percentage = mark.obtainedMarks === null ? "" : `${percentageOf(Number(mark.obtainedMarks), mark.totalMarks)}%`;
    const grade = mark.obtainedMarks === null ? "" : gradeFor(Number(percentage.replace("%", ""))).grade;
    const status = mark.obtainedMarks === null ? "Pending" : Number(mark.obtainedMarks) >= mark.totalMarks * 0.4 ? "Pass" : "Fail";
    return [mark.subject, String(mark.totalMarks), obtained, grade, percentage, mark.obtainedMarks === null ? "" : gradeFor(Number(percentage.replace("%", ""))).gpa.toFixed(1), status];
  });

  const replacements = new Map<number, string[]>();
  values.forEach((value, index) => {
    if (value) replacements.set(index + 1, value);
  });
  replacements.set(SUBJECT_ROW_COUNT + 1, ["TOTAL", String(totalMarks), String(obtainedMarks), "", totalMarks ? `${percentageOf(obtainedMarks, totalMarks)}%` : "", "", ""]);

  return xml.replace(/<w:tr[\s\S]*?<\/w:tr>/g, (row, index) => {
    const replacement = replacements.get(index);
    if (!replacement) return row;
    let cellIndex = 0;
    return row.replace(/<w:tc[\s\S]*?<\/w:tc>/g, (cell) => setCellText(cell, replacement[cellIndex++] ?? ""));
  });
};

const replaceText = (xml: string, pattern: RegExp, value: string): string =>
  xml.replace(pattern, () => escapeXml(value));

export const downloadReportCard = async (
  student: Student,
  className: string,
  termName: string,
  marks: ExamMark[]
): Promise<void> => {
  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) throw new Error("Report card template could not be loaded");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  let documentXml = await zip.file("word/document.xml")?.async("string");
  if (!documentXml) throw new Error("Report card template is invalid");

  documentXml = replaceText(documentXml, /(NAME:\s*)[^<]*/, `NAME: ${student.name}`);
  documentXml = replaceText(documentXml, /(CLASS:\s*)[^<]*/, `CLASS: ${className}`);
  documentXml = replaceText(documentXml, /(Session:\s*)[^<]*/, `Session: ${termName}`);
  documentXml = fillTableRows(documentXml, marks);

  zip.file("word/document.xml", documentXml);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${student.name.replace(/[^\w-]+/g, "-")}-${termName.replace(/[^\w-]+/g, "-")}-report-card.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
};
