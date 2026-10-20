"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, Download, FileText, Plus, Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/formatters";
import type { Paper, Term } from "@/types";
import * as paperService from "@/services/paperService";
import { useSubjectsQuery, useClassesQuery } from "@/features/meta/useMetaQueries";

const today = (): string => new Date().toLocaleDateString("en-CA");

export default function PapersPage() {
  const queryClient = useQueryClient();
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [termModalOpen, setTermModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<Term | null>(null);
  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);

  const [termName, setTermName] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const subjectsQuery = useSubjectsQuery();
  const classesQuery = useClassesQuery();
  const subjects = subjectsQuery.data?.data ?? [];
  const classes = classesQuery.data?.data ?? [];

  const termsQuery = useQuery({ queryKey: ["terms"], queryFn: paperService.getTerms });
  const terms = useMemo(() => termsQuery.data?.data ?? [], [termsQuery.data]);
  const activeTermId = selectedTermId ?? terms[0]?._id ?? null;
  const activeTerm = useMemo(() => terms.find((term) => term._id === activeTermId), [terms, activeTermId]);

  const papersQuery = useQuery({
    queryKey: ["papers", activeTermId],
    queryFn: () => paperService.getPapers({ termId: activeTermId as string }),
    enabled: Boolean(activeTermId),
  });
  const papers = papersQuery.data?.data ?? [];

  const createTermMutation = useMutation({
    mutationFn: () => paperService.createTerm({ name: termName.trim(), startDate: startDate || undefined, endDate: endDate || undefined }),
    onSuccess: (res) => {
      toast.success("Term created");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      setSelectedTermId(res.data._id);
      setTermModalOpen(false);
      setTermName("");
      setStartDate(today());
      setEndDate("");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTermMutation = useMutation({
    mutationFn: (id: string) => paperService.deleteTerm(id),
    onSuccess: (_res, id) => {
      toast.success("Term deleted");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      queryClient.invalidateQueries({ queryKey: ["papers"] });
      if (selectedTermId === id) setSelectedTermId(null);
      setTermToDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!activeTermId || !file) throw new Error("Choose a file to upload");
      return paperService.uploadPaper({
        termId: activeTermId,
        title: title.trim(),
        subject: subject || undefined,
        class: className || undefined,
        file,
      });
    },
    onSuccess: () => {
      toast.success("Paper uploaded");
      queryClient.invalidateQueries({ queryKey: ["papers", activeTermId] });
      setUploadModalOpen(false);
      setTitle("");
      setSubject("");
      setClassName("");
      setFile(null);
      setFileInputKey((key) => key + 1);
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePaperMutation = useMutation({
    mutationFn: (id: string) => paperService.deletePaper(id),
    onSuccess: () => {
      toast.success("Paper deleted");
      queryClient.invalidateQueries({ queryKey: ["papers", activeTermId] });
      setPaperToDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <PageHeader
        title="Papers"
        subtitle="Create terms and keep every question paper filed under the right one"
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Papers" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setTermModalOpen(true)}>
              New Term
            </Button>
            <Button
              size="sm"
              icon={Upload}
              disabled={!activeTermId}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Paper
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 text-sm text-white/50">
          <CalendarDays size={16} className="text-gold" /> Terms
        </span>
        {termsQuery.isPending && <span className="text-sm text-white/40">Loading terms…</span>}
        {!termsQuery.isPending && terms.length === 0 && (
          <span className="text-sm text-white/40">No terms yet — create your first term.</span>
        )}
        {terms.map((term) => (
          <div
            key={term._id}
            className={`flex items-center rounded-xl border transition-colors ${
              activeTermId === term._id ? "border-gold bg-gold/15" : "border-white/15"
            }`}
          >
            <button
              onClick={() => setSelectedTermId(term._id)}
              className={`rounded-l-xl px-4 py-2 text-sm font-semibold ${
                activeTermId === term._id ? "text-gold" : "text-white/60 hover:text-gold"
              }`}
            >
              {term.name}
            </button>
            <button
              onClick={() => setTermToDelete(term)}
              className="rounded-r-xl px-2 py-2 text-white/30 transition-colors hover:bg-danger/15 hover:text-red-400"
              title={`Delete ${term.name}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {termsQuery.isPending ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : !activeTerm ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Create a term first"
            description="Papers are filed under a term. Create one, then upload its papers."
            action={
              <Button icon={Plus} onClick={() => setTermModalOpen(true)}>
                New Term
              </Button>
            }
          />
        </Card>
      ) : papersQuery.isPending ? (
        <Card>
          <SkeletonRows rows={6} />
        </Card>
      ) : (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">{activeTerm.name}</h2>
              <p className="text-xs text-white/45">
                {activeTerm.startDate ? `${formatDate(activeTerm.startDate)} — ${formatDate(activeTerm.endDate)}` : "No dates set"}
                {" · "}
                {papers.length} paper{papers.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button variant="outline" size="sm" icon={Upload} onClick={() => setUploadModalOpen(true)}>
              Upload Paper
            </Button>
          </div>

          {papers.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No papers in this term"
              description="Upload a question paper and it will appear here."
              action={
                <Button icon={Upload} onClick={() => setUploadModalOpen(true)}>
                  Upload Paper
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Paper</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Subject</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Class</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/50">Uploaded</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((paper) => (
                    <tr key={paper._id} className="border-b border-white/5 transition-colors hover:bg-white/[0.04]">
                      <td className="px-5 py-3">
                        <p className="font-medium text-white">{paper.title}</p>
                        <p className="truncate text-xs text-white/35">{paper.originalName}</p>
                      </td>
                      <td className="px-4 py-3 text-white/60">{paper.subject || "—"}</td>
                      <td className="px-4 py-3 text-white/60">{paper.class || "—"}</td>
                      <td className="px-4 py-3 text-white/60">{formatDate(paper.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={paper.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
                          >
                            <Download size={14} /> Open
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => setPaperToDelete(paper)}
                            className="text-red-400 hover:bg-danger/15"
                            title={`Delete ${paper.title}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={termModalOpen}
        onClose={() => setTermModalOpen(false)}
        title="New Term"
        subtitle="Terms group papers and exam marks together"
        size="sm"
      >
        <form
          noValidate
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!termName.trim()) return toast.error("Term name is required");
            createTermMutation.mutate();
          }}
        >
          <Input label="Term Name" placeholder="e.g. First Term 2026" value={termName} onChange={(e) => setTermName(e.target.value)} autoFocus />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date (optional)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setTermModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createTermMutation.isPending}>
              Create Term
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Paper"
        subtitle={activeTerm ? `Filing under ${activeTerm.name}` : undefined}
        size="md"
      >
        <form
          noValidate
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return toast.error("Paper title is required");
            if (!file) return toast.error("Choose a file to upload");
            uploadMutation.mutate();
          }}
        >
          <Input label="Paper Title" placeholder="e.g. Mid Term — Mathematics" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[{ value: "", label: "All subjects" }, ...subjects.map((s) => ({ value: s.name, label: s.name }))]}
            />
            <Select
              label="Class (optional)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              options={[{ value: "", label: "All classes" }, ...classes.map((c) => ({ value: c.name, label: `${c.name} Class` }))]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">File</label>
            <input
              key={fileInputKey}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="input-field py-2 text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gold"
            />
            <p className="mt-1.5 text-xs text-white/35">PDF, Word, PowerPoint or image · up to 20 MB</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Upload} loading={uploadMutation.isPending}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(termToDelete)}
        onClose={() => setTermToDelete(null)}
        onConfirm={() => termToDelete && deleteTermMutation.mutate(termToDelete._id)}
        loading={deleteTermMutation.isPending}
        title="Delete term?"
        message={`Deleting "${termToDelete?.name}" also deletes every paper and exam mark filed under it. This cannot be undone.`}
        confirmText="Delete Term"
      />

      <ConfirmDialog
        open={Boolean(paperToDelete)}
        onClose={() => setPaperToDelete(null)}
        onConfirm={() => paperToDelete && deletePaperMutation.mutate(paperToDelete._id)}
        loading={deletePaperMutation.isPending}
        title="Delete paper?"
        message={`"${paperToDelete?.title}" will be permanently deleted. This cannot be undone.`}
        confirmText="Delete Paper"
      />
    </>
  );
}
