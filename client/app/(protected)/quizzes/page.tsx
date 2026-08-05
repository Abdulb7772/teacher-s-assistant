"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BookOpen, FileDown, GraduationCap, Plus, Trash2, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import FAB from "@/components/ui/FAB";
import GradeBadge from "@/components/ui/GradeBadge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import { SkeletonRows } from "@/components/ui/Skeleton";
import useKeyShortcut from "@/hooks/useKeyShortcut";
import { exportPDF, type ExportColumn } from "@/lib/exportUtils";
import type { Quiz, StudentPerformance } from "@/types";
import * as quizService from "@/services/quizService";
import type { QuizColumnPayload, QuizPayload } from "@/services/quizService";
import * as studentService from "@/services/studentService";
import { useSubjectsQuery, useClassesQuery } from "@/features/meta/useMetaQueries";
import { quizColumnSchema, type QuizColumnFormValues } from "@/features/forms/schemas";

// Client-side page size: keeps the marks grid bounded regardless of class size.
const GRID_PAGE_SIZE = 50;

interface EditingCell {
  student: StudentPerformance;
  column: { name: string; total: number };
  value: string;
}

const today = (): string => new Date().toLocaleDateString("en-CA");

export default function QuizzesPage() {
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [gridPage, setGridPage] = useState(1);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<{ name: string; total: number } | null>(null);
  const [editing, setEditing] = useState<EditingCell | null>(null);

  const subjectsQuery = useSubjectsQuery();
  const classesQuery = useClassesQuery();
  const subjects = subjectsQuery.data?.data ?? [];
  const classes = classesQuery.data?.data ?? [];

  const selectionReady = Boolean(selectedSubject && selectedClass);

  const studentsQuery = useQuery({
    queryKey: ["students", selectedClass],
    queryFn: () => studentService.getStudents({ class: selectedClass as string, page: 1, limit: 1000 }),
    enabled: selectionReady,
    staleTime: 60 * 1000,
  });

  const quizzesQuery = useQuery({
    queryKey: ["quizzes", selectedClass, selectedSubject],
    queryFn: () =>
      quizService.getQuizzes({
        class: selectedClass as string,
        subject: selectedSubject as string,
        page: 1,
        limit: 1000,
      }),
    enabled: selectionReady,
    staleTime: 60 * 1000,
  });

  const students = studentsQuery.data?.data ?? [];

  const visibleStudents = students.slice((gridPage - 1) * GRID_PAGE_SIZE, gridPage * GRID_PAGE_SIZE);
  const gridPagination = {
    page: gridPage,
    limit: GRID_PAGE_SIZE,
    total: students.length,
    pages: Math.max(1, Math.ceil(students.length / GRID_PAGE_SIZE)),
  };

  const quizColumns = useMemo(() => {
    const quizzesData = quizzesQuery.data?.data ?? [];
    const byName = new Map<string, Quiz[]>();
    quizzesData.forEach((q) => {
      const arr = byName.get(q.quizName) ?? [];
      arr.push(q);
      byName.set(q.quizName, arr);
    });
    return Array.from(byName.entries())
      .map(([name, records]) => ({
        name,
        total: records[0].totalMarks,
        firstDate: Math.min(...records.map((r) => new Date(r.date).getTime())),
      }))
      .sort((a, b) => a.firstDate - b.firstDate);
  }, [quizzesQuery.data]);

  const quizFor = useCallback(
    (studentId: string, quizName: string): Quiz | undefined =>
      (quizzesQuery.data?.data ?? []).find((q) => q.studentId === studentId && q.quizName === quizName),
    [quizzesQuery.data]
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["students", selectedClass] });
    queryClient.invalidateQueries({ queryKey: ["quizzes", selectedClass, selectedSubject] });
  }, [queryClient, selectedClass, selectedSubject]);

  const [exporting, setExporting] = useState(false);

  // Exports ALL records for the selected subject + class (every student × every quiz column),
  // not just the current grid page.
  const exportPDFAll = useCallback(async (): Promise<void> => {
    const studentsData = studentsQuery.data?.data ?? [];
    if (!selectionReady || studentsData.length === 0) return;
    setExporting(true);
    try {
      const rows = studentsData.map((s) => ({
        name: s.name,
        cells: quizColumns.map((c) => {
          const q = quizFor(s._id, c.name);
          return q ? `${q.obtainedMarks}/${q.totalMarks}` : "";
        }),
        avg: s.quizCount > 0 ? String(s.average) : "",
        grade: s.quizCount > 0 ? s.grade : "",
      }));
      const columns: ExportColumn<(typeof rows)[number]>[] = [
        { header: "Student", accessor: (r) => r.name },
        ...quizColumns.map(
          (c, i): ExportColumn<(typeof rows)[number]> => ({
            header: `${c.name} (${c.total})`,
            accessor: (r) => r.cells[i],
          })
        ),
        { header: "Avg", accessor: (r) => r.avg },
        { header: "Grade", accessor: (r) => r.grade },
      ];
      await exportPDF(
        `Quiz Marks — ${selectedSubject} — ${selectedClass} Class`,
        columns,
        rows,
        `quiz-marks-${selectedSubject}-${selectedClass}-class`
      );
    } finally {
      setExporting(false);
    }
  }, [selectionReady, studentsQuery.data, quizColumns, quizFor, selectedSubject, selectedClass]);

  const openColumnModal = useCallback(() => {
    setColumnModalOpen(true);
  }, []);

  useKeyShortcut("n", openColumnModal, selectionReady);

  const columnMutation = useMutation({
    mutationFn: (payload: QuizColumnPayload) => quizService.createQuizColumn(payload),
    onSuccess: (res) => {
      toast.success(`Quiz added — click cells to enter marks`);
      if (res.data && res.data.created === 0) toast("No new marks rows were needed", { icon: "ℹ️" });
      setColumnModalOpen(false);
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (column: { name: string }) =>
      quizService.deleteQuizColumn({
        quizName: column.name,
        subject: selectedSubject as string,
        class: selectedClass as string,
      }),
    onSuccess: (res) => {
      toast.success(`Deleted "${columnToDelete?.name}" — ${res.data?.deleted ?? 0} marks row(s) removed`);
      setColumnToDelete(null);
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columnForm = useForm<QuizColumnFormValues>({
    resolver: zodResolver(quizColumnSchema),
    defaultValues: { quizName: "", totalMarks: "", date: today() },
  });

  const onColumnSubmit = columnForm.handleSubmit(async (values) => {
    if (!selectionReady) return;
    try {
      await columnMutation.mutateAsync({
        className: selectedClass as string,
        subject: selectedSubject as string,
        quizName: values.quizName.trim(),
        totalMarks: Number(values.totalMarks),
        date: values.date,
      });
      columnForm.reset({ quizName: "", totalMarks: "", date: today() });
    } catch {
      /* toast shown by mutation onError */
    }
  });

  const saveCellMutation = useMutation({
    mutationFn: (payload: QuizPayload) => {
      const quiz = quizFor(payload.studentId, payload.quizName);
      return quiz ? quizService.updateQuiz(quiz._id, payload) : quizService.createQuiz(payload);
    },
    onSuccess: () => {
      toast.success("Marks saved");
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const startEdit = useCallback(
    (student: StudentPerformance, column: { name: string; total: number }) => {
      const quiz = quizFor(student._id, column.name);
      setEditing({ student, column, value: quiz ? String(quiz.obtainedMarks) : "" });
    },
    [quizFor]
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;
    const marks = editing.value.trim();
    const quiz = quizFor(editing.student._id, editing.column.name);
    const obtained = Number(marks);
    if (marks === "" || !Number.isFinite(obtained) || obtained < 0) {
      setEditing(null);
      return;
    }
    if (quiz && Number(quiz.obtainedMarks) === obtained) {
      setEditing(null);
      return;
    }
    saveCellMutation.mutate({
      studentId: editing.student._id,
      subject: selectedSubject ?? undefined,
      class: selectedClass ?? undefined,
      quizName: editing.column.name,
      totalMarks: editing.column.total,
      obtainedMarks: obtained,
      date: quiz?.date.slice(0, 10) ?? today(),
      remarks: quiz?.remarks ?? "",
    });
    setEditing(null);
  }, [editing, quizFor, saveCellMutation, selectedSubject, selectedClass]);

  const loading = studentsQuery.isPending || quizzesQuery.isPending;

  return (
    <>
      <PageHeader
        title="Quiz Marks"
        subtitle="Select a subject and class, then manage every quiz and paper in one grid"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Quiz Marks" }]}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm text-white/50">
          <BookOpen size={16} className="text-gold" /> Subject
        </span>
        {subjects.map((subject) => (
          <button
            key={subject._id}
            onClick={() => setSelectedSubject(subject.name)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              selectedSubject === subject.name
                ? "bg-gold-gradient text-navy shadow-glow"
                : "border border-white/15 text-white/60 hover:border-gold/50 hover:text-gold"
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-white/50">
            <GraduationCap size={16} className="text-gold" /> Class
          </span>
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => {
                setSelectedClass(cls.name);
                setGridPage(1);
              }}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                selectedClass === cls.name
                  ? "bg-gold-gradient text-navy shadow-glow"
                  : "border border-white/15 text-white/60 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {cls.name} Class
            </button>
          ))}
        </div>
      )}

      {selectionReady && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-white/50">
            <BookOpen size={16} className="text-gold" />
            {selectedSubject} · {selectedClass}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileDown}
              onClick={exportPDFAll}
              loading={exporting}
              disabled={students.length === 0}
            >
              Export PDF
            </Button>
            <Button variant="outline" size="sm" icon={Plus} onClick={openColumnModal}>
              Add Quiz / Paper
            </Button>
          </div>
        </div>
      )}

      {subjectsQuery.isPending ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="An admin can add subjects from the Subjects & Classes page."
          />
        </Card>
      ) : !selectedSubject ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Select a subject"
            description="Choose a subject to see its students and quiz marks."
          />
        </Card>
      ) : !selectedClass ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Select a class"
            description="Choose a class to see all students and their quiz marks."
          />
        </Card>
      ) : loading ? (
        <Card>
          <SkeletonRows rows={8} />
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                  <th className="sticky left-0 z-10 bg-navy-deep px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                    Student
                  </th>
                  {quizColumns.map((col) => (
                    <th
                      key={col.name}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gold/80"
                    >
                      {col.name}
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-normal normal-case text-white/35">out of {col.total}</span>
                        <button
                          onClick={() => setColumnToDelete({ name: col.name, total: col.total })}
                          className="rounded-md p-1 text-white/25 transition-colors hover:bg-danger/15 hover:text-red-400"
                          title={`Delete ${col.name} column`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Avg</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Grade</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s) => (
                  <tr key={s._id} className="border-b border-white/5 transition-colors hover:bg-white/[0.04]">
                    <td className="sticky left-0 z-10 bg-navy-deep px-4 py-2.5">
                      <p className="font-medium text-white">{s.name}</p>
                    </td>
                    {quizColumns.map((col) => {
                      const quiz = quizFor(s._id, col.name);
                      const isEditing = editing?.student._id === s._id && editing?.column.name === col.name;
                      return (
                        <td key={col.name} className="px-4 py-2.5 text-center">
                          {isEditing ? (
                            <input
                              autoFocus
                              type="number"
                              min={0}
                              value={editing.value}
                              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                                if (e.key === "Escape") setEditing(null);
                              }}
                              className="w-20 rounded-lg border border-gold/50 bg-navy px-2 py-1.5 text-center text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-gold/30"
                            />
                          ) : (
                            <button
                              onClick={() => startEdit(s, col)}
                              className={`min-w-[56px] rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors ${
                                quiz
                                  ? "text-white hover:bg-gold/15"
                                  : "text-white/25 hover:bg-gold/10 hover:text-gold"
                              }`}
                              title={quiz ? "Edit marks" : "Add marks"}
                            >
                              {quiz ? `${quiz.obtainedMarks}/${quiz.totalMarks}` : "—"}
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-center font-semibold text-gold">
                      {s.quizCount > 0 ? s.average : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {s.quizCount > 0 ? <GradeBadge grade={s.grade} /> : <span className="text-white/25">—</span>}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={quizColumns.length + 3} className="px-4 py-10 text-center text-sm text-white/40">
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

      <ConfirmDialog
        open={Boolean(columnToDelete)}
        onClose={() => setColumnToDelete(null)}
        onConfirm={() => columnToDelete && deleteColumnMutation.mutate(columnToDelete)}
        loading={deleteColumnMutation.isPending}
        title="Delete quiz column?"
        message={`This permanently deletes "${columnToDelete?.name}" and all marks entered for every student in ${selectedClass} · ${selectedSubject}. This cannot be undone.`}
        confirmText="Delete Column"
      />

      <Modal
        open={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        title="Add Quiz / Paper"
        subtitle={`Create a new marks column for ${selectedSubject ?? ""} · ${selectedClass ?? ""}`}
        size="md"
      >
        <form noValidate onSubmit={onColumnSubmit} className="space-y-4">
          <Input
            label="Quiz / Paper Name"
            placeholder="e.g. Quiz 1 - Algebra"
            error={columnForm.formState.errors.quizName?.message}
            {...columnForm.register("quizName")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Total Marks"
              type="number"
              min={1}
              placeholder="10"
              error={columnForm.formState.errors.totalMarks?.message}
              {...columnForm.register("totalMarks")}
            />
            <Input
              label="Date"
              type="date"
              error={columnForm.formState.errors.date?.message}
              {...columnForm.register("date")}
            />
          </div>
          <p className="text-xs text-white/40">
            A column is added for every student in {selectedClass ?? ""}. Click a cell afterwards to enter marks directly.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setColumnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={columnMutation.isPending}>
              Add Column
            </Button>
          </div>
        </form>
      </Modal>

      {selectionReady && <FAB icon={Plus} label="Add Quiz / Paper" onClick={openColumnModal} shortcut="n" />}
    </>
  );
}
