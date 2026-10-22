"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, FileDown, GraduationCap, ListChecks, Pencil, Plus, Trash2, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import GradeBadge from "@/components/ui/GradeBadge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { gradeFor, percentageOf, PASS_PERCENT } from "@/lib/grades";
import { exportPDF, type ExportColumn } from "@/lib/exportUtils";
import { downloadReportCard } from "@/lib/reportCard";
import type { ExamMark, StudentPerformance } from "@/types";
import * as examService from "@/services/examService";
import * as paperService from "@/services/paperService";
import * as studentService from "@/services/studentService";
import { useSubjectsQuery, useClassesQuery } from "@/features/meta/useMetaQueries";

const GRID_PAGE_SIZE = 50;

interface EditingCell {
  student: StudentPerformance;
  column: { subject: string; total: number };
  value: string;
}

interface StudentStats {
  obtained: number;
  total: number;
  average: number;
  percentage: number;
  gpa: number;
  grade: string;
}

export default function ExamMarksPage() {
  const queryClient = useQueryClient();
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [mode, setMode] = useState<"individual" | "all">("individual");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [gridPage, setGridPage] = useState(1);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<{ subject: string; total: number } | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<{ subject: string } | null>(null);
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [totalInput, setTotalInput] = useState("100");
  const [exporting, setExporting] = useState(false);
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);

  const termsQuery = useQuery({ queryKey: ["terms"], queryFn: paperService.getTerms });
  const subjectsQuery = useSubjectsQuery();
  const classesQuery = useClassesQuery();
  const terms = useMemo(() => termsQuery.data?.data ?? [], [termsQuery.data]);
  const subjects = subjectsQuery.data?.data ?? [];
  const classes = classesQuery.data?.data ?? [];

  const activeTermId = selectedTermId ?? terms[0]?._id ?? null;
  const activeTerm = terms.find((term) => term._id === activeTermId);
  const selectionReady = Boolean(activeTermId && selectedClass);

  const studentsQuery = useQuery({
    queryKey: ["students", selectedClass],
    queryFn: () =>
      studentService.getStudents({ class: selectedClass as string, page: 1, limit: 1000 }),
    enabled: Boolean(selectedClass),
    staleTime: 60 * 1000,
  });

  const marksQuery = useQuery({
    queryKey: ["exam-marks", activeTermId, selectedClass],
    queryFn: () => examService.getExamMarks({ termId: activeTermId as string, class: selectedClass as string }),
    enabled: selectionReady,
    staleTime: 60 * 1000,
  });

  const students = useMemo(() => studentsQuery.data?.data ?? [], [studentsQuery.data]);
  const marks = useMemo(() => marksQuery.data?.data ?? [], [marksQuery.data]);

  const visibleStudents = students.slice((gridPage - 1) * GRID_PAGE_SIZE, gridPage * GRID_PAGE_SIZE);
  const gridPagination = {
    page: gridPage,
    limit: GRID_PAGE_SIZE,
    total: students.length,
    pages: Math.max(1, Math.ceil(students.length / GRID_PAGE_SIZE)),
  };

  const subjectColumns = useMemo(() => {
    const bySubject = new Map<string, ExamMark[]>();
    marks.forEach((mark) => {
      const records = bySubject.get(mark.subject) ?? [];
      records.push(mark);
      bySubject.set(mark.subject, records);
    });
    return Array.from(bySubject.entries())
      .map(([subject, records]) => ({
        subject,
        total: records[0].totalMarks,
        firstCreated: Math.min(...records.map((record) => new Date(record.createdAt).getTime())),
      }))
      .sort((a, b) => a.firstCreated - b.firstCreated);
  }, [marks]);

  const activeSubject =
    selectedSubject && subjectColumns.some((column) => column.subject === selectedSubject)
      ? selectedSubject
      : subjectColumns[0]?.subject ?? null;
  const activeSubjectColumn = subjectColumns.find((column) => column.subject === activeSubject) ?? null;
  const selectedColumn = activeSubjectColumn ?? subjectColumns[0];

  const markFor = useCallback(
    (studentId: string, subject: string): ExamMark | undefined =>
      marks.find((mark) => mark.studentId === studentId && mark.subject === subject),
    [marks]
  );

  const statsFor = useCallback(
    (studentId: string): StudentStats | null => {
      const entries = subjectColumns
        .map((column) => markFor(studentId, column.subject))
        .filter((mark): mark is ExamMark => mark !== undefined && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined);
      if (entries.length === 0) return null;
      const obtained = entries.reduce((sum, mark) => sum + Number(mark.obtainedMarks), 0);
      const total = entries.reduce((sum, mark) => sum + Number(mark.totalMarks), 0);
      const percentage = percentageOf(obtained, total);
      const grade = gradeFor(percentage);
      return {
        obtained,
        total,
        average: Math.round((obtained / entries.length) * 10) / 10,
        percentage,
        gpa: grade.gpa,
        grade: grade.grade,
      };
    },
    [subjectColumns, markFor]
  );

  const positionMap = useMemo(() => {
    const ranked = students
      .map((student) => {
        const stats = statsFor(student._id);
        return { id: student._id, percentage: stats ? stats.percentage : -1 };
      })
      .filter((entry) => entry.percentage >= PASS_PERCENT);
    ranked.sort((a, b) => b.percentage - a.percentage);
    const positions = new Map<string, number>();
    let rank = 1;
    ranked.forEach((entry, index) => {
      if (index > 0 && entry.percentage < ranked[index - 1].percentage) rank++;
      positions.set(entry.id, rank);
    });
    return positions;
  }, [students, statsFor]);

  const generateReportCard = useCallback(
    async (student: StudentPerformance): Promise<void> => {
      if (!activeTerm || !selectedClass) return;
      setReportCardStudentId(student._id);
      try {
        const studentMarks = subjectColumns
          .map((column) => markFor(student._id, column.subject))
          .filter((mark): mark is ExamMark => Boolean(mark));
        await downloadReportCard(student, selectedClass, activeTerm.name, studentMarks);
        toast.success(`Report card generated for ${student.name}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Report card could not be generated");
      } finally {
        setReportCardStudentId(null);
      }
    },
    [activeTerm, selectedClass, subjectColumns, markFor]
  );

  const invalidateMarks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["exam-marks", activeTermId, selectedClass] });
  }, [queryClient, activeTermId, selectedClass]);

  const createColumnMutation = useMutation({
    mutationFn: () =>
      examService.createExamColumn({
        termId: activeTermId as string,
        className: selectedClass as string,
        subject: subjectInput.trim(),
        totalMarks: Number(totalInput),
      }),
    onSuccess: () => {
      toast.success("Subject added — click cells to enter marks");
      setSelectedSubject(subjectInput.trim());
      setSubjectModalOpen(false);
      setSubjectInput("");
      setTotalInput("100");
      invalidateMarks();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateColumnMutation = useMutation({
    mutationFn: () => {
      if (!editingColumn) throw new Error("No subject selected");
      return examService.updateExamColumn({
        termId: activeTermId as string,
        className: selectedClass as string,
        subject: editingColumn.subject,
        newSubject: subjectInput.trim(),
        totalMarks: Number(totalInput),
      });
    },
    onSuccess: () => {
      toast.success("Subject updated");
      setSelectedSubject(subjectInput.trim());
      setEditingColumn(null);
      setSubjectModalOpen(false);
      setSubjectInput("");
      setTotalInput("100");
      invalidateMarks();
    },
    onError: (err) => toast.error(err.message),
  });

  const openAddSubject = () => {
    setEditingColumn(null);
    setSubjectInput("");
    setTotalInput("100");
    setSubjectModalOpen(true);
  };

  const openEditSubject = (column: { subject: string; total: number }) => {
    setEditingColumn(column);
    setSubjectInput(column.subject);
    setTotalInput(String(column.total));
    setSubjectModalOpen(true);
  };

  const toggleSubjectModal = (open: boolean) => {
    setSubjectModalOpen(open);
    if (!open) setEditingColumn(null);
  };

  const deleteColumnMutation = useMutation({
    mutationFn: (column: { subject: string }) =>
      examService.deleteExamColumn({
        termId: activeTermId as string,
        className: selectedClass as string,
        subject: column.subject,
      }),
    onSuccess: () => {
      toast.success("Subject column deleted");
      setColumnToDelete(null);
      invalidateMarks();
    },
    onError: (err) => toast.error(err.message),
  });

  const saveCellMutation = useMutation({
    mutationFn: (payload: {
      existingId?: string;
      termId: string;
      studentId: string;
      subject: string;
      totalMarks: number;
      obtainedMarks: number;
    }) => {
      const body = {
        termId: payload.termId,
        studentId: payload.studentId,
        subject: payload.subject,
        totalMarks: payload.totalMarks,
        obtainedMarks: payload.obtainedMarks,
      };
      return payload.existingId
        ? examService.updateExamMark(payload.existingId, body)
        : examService.saveExamMark(body);
    },
    onSuccess: () => {
      toast.success("Marks saved");
      invalidateMarks();
    },
    onError: (err) => toast.error(err.message),
  });

  const startEdit = useCallback(
    (student: StudentPerformance, column: { subject: string; total: number }) => {
      const mark = markFor(student._id, column.subject);
      const initialValue =
        mark && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined ? String(mark.obtainedMarks) : "";
      setEditing({ student, column, value: initialValue });
    },
    [markFor]
  );

  const commitEdit = useCallback(() => {
    if (!editing || !activeTermId) return;
    const raw = editing.value.trim();
    const obtained = Number(raw);
    if (raw === "" || !Number.isFinite(obtained) || obtained < 0) {
      setEditing(null);
      return;
    }
    const existing = markFor(editing.student._id, editing.column.subject);
    if (
      existing &&
      existing.obtainedMarks !== null &&
      Number(existing.obtainedMarks) === obtained &&
      Number(existing.totalMarks) === editing.column.total
    ) {
      setEditing(null);
      return;
    }
    saveCellMutation.mutate({
      existingId: existing?._id,
      termId: activeTermId,
      studentId: editing.student._id,
      subject: editing.column.subject,
      totalMarks: editing.column.total,
      obtainedMarks: obtained,
    });
    setEditing(null);
  }, [editing, activeTermId, markFor, saveCellMutation]);

  const renderMarkCell = (student: StudentPerformance, column: { subject: string; total: number }) => {
    const mark = markFor(student._id, column.subject);
    const isEditing = editing?.student._id === student._id && editing?.column.subject === column.subject;
    const hasMarks = mark && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined;
    return (
      <td key={column.subject} className="px-4 py-2.5 text-center">
        {isEditing ? (
          <input
            autoFocus
            type="number"
            min={0}
            value={editing.value}
            onChange={(event) => setEditing({ ...editing, value: event.target.value })}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") setEditing(null);
            }}
            className="w-20 rounded-lg border border-gold/50 bg-navy px-2 py-1.5 text-center text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-gold/30"
          />
        ) : (
          <button
            onClick={() => startEdit(student, column)}
            className={`min-w-[56px] rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-gold/10 hover:text-gold ${
              hasMarks ? "text-white" : "text-white/25"
            }`}
            title={hasMarks ? "Edit marks" : "Add marks"}
          >
            {hasMarks ? `${mark.obtainedMarks}/${mark.totalMarks}` : "—"}
          </button>
        )}
      </td>
    );
  };

  const exportSubject = useCallback(async (): Promise<void> => {
    const column = activeSubjectColumn;
    if (!selectionReady || !column || students.length === 0) return;
    setExporting(true);
    try {
      const rows = students.map((student, index) => {
        const mark = markFor(student._id, column.subject);
        const hasMarks = mark && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined;
        const percent = hasMarks ? percentageOf(Number(mark.obtainedMarks), Number(mark.totalMarks)) : null;
        return {
          serial: String(index + 1),
          name: student.name,
          marks: hasMarks ? `${mark.obtainedMarks}/${mark.totalMarks}` : "",
          percentage: percent !== null ? `${percent}%` : "",
          grade: percent !== null ? gradeFor(percent).grade : "",
          isFailed: percent !== null && percent < PASS_PERCENT,
        };
      });
      const rowStyles: { [rowIndex: number]: { fillColor: [number, number, number] } } = {};
      rows.forEach((row, index) => {
        if (row.isFailed) rowStyles[index] = { fillColor: [255, 220, 220] };
      });
      const columns: ExportColumn<(typeof rows)[number]>[] = [
        { header: "S.No", accessor: (row) => row.serial },
        { header: "Student", accessor: (row) => row.name },
        { header: `${column.subject} (${column.total})`, accessor: (row) => row.marks },
        { header: "Percentage", accessor: (row) => row.percentage },
        { header: "Grade", accessor: (row) => row.grade },
      ];
      await exportPDF(
        `${column.subject} — ${activeTerm?.name ?? ""} — ${selectedClass} Class`,
        columns,
        rows,
        `${column.subject.replace(/[^\w-]+/g, "-")}-${activeTerm?.name ?? "term"}-${selectedClass}-class`,
        { rowStyles }
      );
    } finally {
      setExporting(false);
    }
  }, [selectionReady, activeSubjectColumn, students, markFor, activeTerm, selectedClass]);

  const exportFinalList = useCallback(async (): Promise<void> => {
    if (!selectionReady || students.length === 0) return;
    setExporting(true);
    try {
      const rows = students.map((student, index) => {
        const stats = statsFor(student._id);
        return {
          serial: String(index + 1),
          name: student.name,
          cells: subjectColumns.map((column) => {
            const mark = markFor(student._id, column.subject);
            return mark && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined
              ? `${mark.obtainedMarks}/${mark.totalMarks}`
              : "";
          }),
          total: stats ? `${stats.obtained}/${stats.total}` : "",
          average: stats ? stats.average : "",
          percentage: stats ? `${stats.percentage}%` : "",
          gpa: stats ? stats.gpa.toFixed(1) : "",
          position: stats ? (stats.percentage < PASS_PERCENT ? "Failed" : (positionMap.get(student._id) ?? "")) : "",
          grade: stats?.grade ?? "",
          isFailed: Boolean(stats && stats.percentage < PASS_PERCENT),
        };
      });
      const rowStyles: { [rowIndex: number]: { fillColor: [number, number, number] } } = {};
      rows.forEach((row, index) => {
        if (row.isFailed) rowStyles[index] = { fillColor: [255, 220, 220] };
      });
      const columns: ExportColumn<(typeof rows)[number]>[] = [
        { header: "S.No", accessor: (row) => row.serial },
        { header: "Student", accessor: (row) => row.name },
        ...subjectColumns.map(
          (column, index): ExportColumn<(typeof rows)[number]> => ({
            header: `${column.subject} (${column.total})`,
            accessor: (row) => row.cells[index],
          })
        ),
        { header: "Total", accessor: (row) => row.total },
        { header: "Average", accessor: (row) => row.average },
        { header: "Percentage", accessor: (row) => row.percentage },
        { header: "GPA", accessor: (row) => row.gpa },
        { header: "Position", accessor: (row) => row.position },
        { header: "Grade", accessor: (row) => row.grade },
      ];
      await exportPDF(
        `Final List — ${activeTerm?.name ?? ""} — ${selectedClass} Class`,
        columns,
        rows,
        `final-list-${activeTerm?.name ?? "term"}-${selectedClass}-class`,
        { rowStyles }
      );
    } finally {
      setExporting(false);
    }
  }, [selectionReady, students, subjectColumns, markFor, statsFor, positionMap, activeTerm, selectedClass]);

  const loading = studentsQuery.isPending || marksQuery.isPending;

  return (
    <>
      <PageHeader
        title="Exam Marks"
        subtitle="Enter each subject's marks once — totals, averages, positions and grades are calculated automatically"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Exam Marks" }]}
      />

      <div className="mb-5 flex rounded-xl border border-white/15 p-1">
        <button
          onClick={() => setMode("individual")}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
            mode === "individual" ? "bg-gold-gradient text-navy" : "text-white/50 hover:text-white"
          }`}
        >
          Individual Subject
        </button>
        <button
          onClick={() => setMode("all")}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
            mode === "all" ? "bg-gold-gradient text-navy" : "text-white/50 hover:text-white"
          }`}
        >
          All Subjects
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 text-sm text-white/50">
          <CalendarDays size={16} className="text-gold" /> Term
        </span>
        {termsQuery.isPending && <span className="text-sm text-white/40">Loading terms…</span>}
        {!termsQuery.isPending && terms.length === 0 && (
          <span className="text-sm text-white/40">
            No terms yet —{" "}
            <Link href="/papers" className="text-gold hover:underline">
              create one in Papers
            </Link>
            .
          </span>
        )}
        {terms.map((term) => (
          <button
            key={term._id}
            onClick={() => {
              setSelectedTermId(term._id);
              setEditing(null);
              setGridPage(1);
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTermId === term._id
                ? "bg-gold-gradient text-navy shadow-glow"
                : "border border-white/15 text-white/60 hover:border-gold/50 hover:text-gold"
            }`}
          >
            {term.name}
          </button>
        ))}
      </div>

      {activeTermId && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 text-sm text-white/50">
            <GraduationCap size={16} className="text-gold" /> Class
          </span>
          {classes.map((schoolClass) => (
            <button
              key={schoolClass._id}
              onClick={() => {
                setSelectedClass(schoolClass.name);
                setEditing(null);
                setGridPage(1);
              }}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                selectedClass === schoolClass.name
                  ? "bg-gold-gradient text-navy shadow-glow"
                  : "border border-white/15 text-white/60 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {schoolClass.name} Class
            </button>
          ))}
        </div>
      )}

      {selectionReady && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-white/50">
            {activeTerm?.name} · {selectedClass}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileDown}
              onClick={mode === "all" ? exportFinalList : exportSubject}
              loading={exporting}
              disabled={students.length === 0 || subjectColumns.length === 0}
            >
              {mode === "all" ? "Download All Subjects PDF" : "Download Subject PDF"}
            </Button>
            <Button variant="outline" size="sm" icon={Plus} onClick={openAddSubject}>
              Add Subject
            </Button>
          </div>
        </div>
      )}

      {termsQuery.isPending ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : terms.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No terms yet"
            description="Exam marks are grouped by term. Create a term in Papers first."
            action={
              <Link
                href="/papers"
                className="inline-flex h-10 items-center rounded-xl border border-gold/60 px-5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
              >
                Go to Papers
              </Link>
            }
          />
        </Card>
      ) : !selectedClass ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Select a class"
            description="Choose the term above, then pick the class whose exam marks you want to manage."
          />
        </Card>
      ) : loading ? (
        <Card>
          <SkeletonRows rows={8} />
        </Card>
      ) : subjectColumns.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="No subjects added"
            description={`Add the first subject to start entering ${selectedClass} exam marks for ${activeTerm?.name ?? "this term"}.`}
            action={
              <Button icon={Plus} onClick={openAddSubject}>
                Add Subject
              </Button>
            }
          />
        </Card>
      ) : mode === "individual" ? (
        <Card className="p-0">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="w-full max-w-xs">
              <Select
                label="Subject"
                value={selectedColumn.subject}
                onChange={(event) => {
                  setSelectedSubject(event.target.value);
                  setEditing(null);
                }}
                options={subjectColumns.map((column) => ({
                  value: column.subject,
                  label: `${column.subject} (out of ${column.total})`,
                }))}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-white/45">
              <span>Click any mark to edit it</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Pencil}
                  onClick={() => openEditSubject(selectedColumn)}
                  title={`Edit ${selectedColumn.subject}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setColumnToDelete({ subject: selectedColumn.subject })}
                  className="text-red-400 hover:bg-danger/15"
                  title={`Delete ${selectedColumn.subject}`}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="sticky left-0 z-20 w-16 bg-navy-deep px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                    S.No
                  </th>
                  <th className="sticky left-16 z-20 bg-navy-deep px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                    Student
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gold/80">
                    {selectedColumn.subject}
                    <span className="mt-1 block text-[10px] font-normal normal-case text-white/35">
                      out of {selectedColumn.total}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Percentage</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Grade</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student, index) => {
                  const mark = markFor(student._id, selectedColumn.subject);
                  const percent =
                    mark && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined
                      ? percentageOf(Number(mark.obtainedMarks), Number(mark.totalMarks))
                      : null;
                  return (
                    <tr key={student._id} className="border-b border-white/5 transition-colors hover:bg-white/[0.04]">
                      <td className="sticky left-0 z-10 w-16 bg-navy-deep px-4 py-2.5 text-center text-sm font-medium text-white/70">
                        {(gridPage - 1) * GRID_PAGE_SIZE + index + 1}
                      </td>
                      <td className="sticky left-16 z-10 bg-navy-deep px-4 py-2.5">
                        <p className="font-medium text-white">{student.name}</p>
                      </td>
                      {renderMarkCell(student, selectedColumn)}
                      <td className="px-4 py-2.5 text-center font-semibold text-gold">
                        {percent !== null ? `${percent}%` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {percent !== null ? (
                          <GradeBadge grade={gradeFor(percent).grade} />
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">
                      <Users size={20} className="mx-auto mb-2 opacity-40" />
                      No students in {selectedClass} class yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10">
            <Pagination pagination={gridPagination} onPageChange={setGridPage} />
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="sticky left-0 z-20 w-16 bg-navy-deep px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                    S.No
                  </th>
                  <th className="sticky left-16 z-20 bg-navy-deep px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                    Student
                  </th>
                  {subjectColumns.map((column) => (
                    <th key={column.subject} className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gold/80">
                      {column.subject}
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-normal normal-case text-white/35">out of {column.total}</span>
                        <span className="flex items-center gap-0.5">
                          <button
                            onClick={() => openEditSubject(column)}
                            className="rounded-md p-1 text-white/25 transition-colors hover:bg-gold/10 hover:text-gold"
                            title={`Edit ${column.subject} column`}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setColumnToDelete({ subject: column.subject })}
                            className="rounded-md p-1 text-white/25 transition-colors hover:bg-danger/15 hover:text-red-400"
                            title={`Delete ${column.subject} column`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </span>
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Average</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Percentage</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">GPA</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Position</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Grade</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Report Card</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student, index) => {
                  const stats = statsFor(student._id);
                  return (
                    <tr key={student._id} className="border-b border-white/5 transition-colors hover:bg-white/[0.04]">
                      <td className="sticky left-0 z-10 w-16 bg-navy-deep px-4 py-2.5 text-center text-sm font-medium text-white/70">
                        {(gridPage - 1) * GRID_PAGE_SIZE + index + 1}
                      </td>
                      <td className="sticky left-16 z-10 bg-navy-deep px-4 py-2.5">
                        <p className="font-medium text-white">{student.name}</p>
                      </td>
                      {subjectColumns.map((column) => renderMarkCell(student, column))}
                      <td className="px-4 py-2.5 text-center font-semibold text-white">
                        {stats ? `${stats.obtained}/${stats.total}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-white/80">{stats ? stats.average : "—"}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-gold">
                        {stats ? `${stats.percentage}%` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-white/80">
                        {stats ? stats.gpa.toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-gold">
                        {stats ? (stats.percentage < PASS_PERCENT ? "Failed" : (positionMap.get(student._id) ?? "—")) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {stats ? <GradeBadge grade={stats.grade} /> : <span className="text-white/25">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={FileDown}
                          onClick={() => void generateReportCard(student)}
                          loading={reportCardStudentId === student._id}
                          disabled={Boolean(reportCardStudentId && reportCardStudentId !== student._id)}
                          title={`Generate report card for ${student.name}`}
                        >
                          PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={subjectColumns.length + 9} className="px-4 py-10 text-center text-sm text-white/40">
                      <Users size={20} className="mx-auto mb-2 opacity-40" />
                      No students in {selectedClass} class yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10">
            <Pagination pagination={gridPagination} onPageChange={setGridPage} />
          </div>
        </Card>
      )}

      <Modal
        open={subjectModalOpen}
        onClose={() => toggleSubjectModal(false)}
        title={editingColumn ? "Edit Subject" : "Add Subject"}
        subtitle={
          editingColumn
            ? `Updates ${editingColumn.subject} for every student in ${selectedClass ?? ""} · ${activeTerm?.name ?? ""}`
            : `Adds a marks column for every student in ${selectedClass ?? ""} · ${activeTerm?.name ?? ""}`
        }
        size="sm"
      >
        <form
          noValidate
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!subjectInput.trim()) return toast.error("Subject is required");
            if (!Number(totalInput) || Number(totalInput) < 1) return toast.error("Total marks must be at least 1");
            const duplicate = subjectColumns.some(
              (column) =>
                column.subject.toLowerCase() === subjectInput.trim().toLowerCase() &&
                column.subject !== editingColumn?.subject
            );
            if (duplicate) return toast.error("This subject already has a column");
            if (editingColumn) updateColumnMutation.mutate();
            else createColumnMutation.mutate();
          }}
        >
          <Input
            label="Subject"
            placeholder="e.g. Mathematics"
            list="exam-subject-options"
            value={subjectInput}
            onChange={(event) => setSubjectInput(event.target.value)}
            autoFocus
          />
          <datalist id="exam-subject-options">
            {subjects.map((subject) => (
              <option key={subject._id} value={subject.name} />
            ))}
          </datalist>
          <Input
            label="Total Marks"
            type="number"
            min={1}
            value={totalInput}
            onChange={(event) => setTotalInput(event.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => toggleSubjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={editingColumn ? updateColumnMutation.isPending : createColumnMutation.isPending}>
              {editingColumn ? "Save Changes" : "Add Subject"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(columnToDelete)}
        onClose={() => setColumnToDelete(null)}
        onConfirm={() => columnToDelete && deleteColumnMutation.mutate(columnToDelete)}
        loading={deleteColumnMutation.isPending}
        title="Delete subject column?"
        message={`This permanently deletes "${columnToDelete?.subject}" marks for every student in ${selectedClass}. This cannot be undone.`}
        confirmText="Delete Column"
      />
    </>
  );
}
