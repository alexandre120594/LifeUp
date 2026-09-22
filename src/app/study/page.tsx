"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { BookOpen, Brain, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, FileText, MoreHorizontal, Pencil, Plus, RotateCcw, Target, Trash2 } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { EmptyState, ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStudyReview, useCreateStudySession, useCreateStudySubject, useCreateStudyTopic, useDeleteStudyReview, useDeleteStudySession, useDeleteStudySubject, useMasterStudyReview, useRescheduleStudyReview, useStudyWorkspace, useUpdateStudyReview, useUpdateStudySession, useUpdateStudySubject } from "@/hooks/useStudyWorkspace";
import { buildStudySubjectAttention, calculateStudyTodaySummary } from "@/lib/study-core";
import type { StudyReview, StudySessionCore, StudySubjectCore, StudyWorkspace } from "@/types/Study";

type DialogMode = "edit-review" | "edit-session" | "edit-subject" | "review" | "session" | "subject" | "topic" | null;
type EditingItem = StudyReview | StudySessionCore | StudySubjectCore | null;
type DeleteTarget = { kind: "review"; item: StudyReview } | { kind: "session"; item: StudySessionCore } | { kind: "subject"; item: StudySubjectCore };
type ReviewDraft = { answer: string; prompt: string };
type StudyAttention = ReturnType<typeof buildStudySubjectAttention>[number];
type StudyTab = "history" | "reviews" | "subjects" | "today";

const studyTabs = [
  { label: "Hoje", value: "today" },
  { label: "Matérias", value: "subjects" },
  { label: "Revisões", value: "reviews" },
  { label: "Histórico", value: "history" },
] as const;

const studyPlanLinks = [
  {
    description: "Perfil 3, FGV, plano alternado ate 21/09.",
    href: "/study/dataprev",
    title: "Dataprev Plan",
  },
  {
    description: "Analista e Tecnico de TI, auditoria 2017-2025.",
    href: "/study/trt",
    title: "TRT em estudos",
  },
];

const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" });
const months = ["Todos os meses", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const today = () => new Date().toISOString().slice(0, 10);
const inDays = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};
const dateInput = (value: string) => new Date(value).toISOString().slice(0, 10);
const dateTimeInput = (value: string) => {
  const parsed = new Date(value);
  const offset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
};

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h${rest ? ` ${rest}min` : ""}` : `${rest}min`;
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}

function ActionMenu({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  return <details className="relative shrink-0">
    <summary className="grid size-8 cursor-pointer list-none place-items-center rounded-md text-text-tertiary hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Abrir acoes"><MoreHorizontal className="size-4" /></summary>
    <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-border bg-panel p-1 shadow-snow-2">
      <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-hover" onClick={onEdit} type="button"><Pencil className="size-4" />Editar</button>
      <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10" onClick={onDelete} type="button"><Trash2 className="size-4" />Apagar</button>
    </div>
  </details>;
}

function StudyDialog({ data, editingItem, initialSubjectId, mode, onClose }: { data: StudyWorkspace; editingItem: EditingItem; initialSubjectId?: string; mode: DialogMode; onClose: () => void }) {
  const createSession = useCreateStudySession();
  const createSubject = useCreateStudySubject();
  const createTopic = useCreateStudyTopic();
  const createReview = useCreateStudyReview();
  const updateSession = useUpdateStudySession();
  const updateSubject = useUpdateStudySubject();
  const updateReview = useUpdateStudyReview();
  const editingSession = mode === "edit-session" ? editingItem as StudySessionCore : null;
  const editingSubject = mode === "edit-subject" ? editingItem as StudySubjectCore : null;
  const editingReview = mode === "edit-review" ? editingItem as StudyReview : null;
  const [subjectId, setSubjectId] = useState(editingSession?.subjectId ?? editingReview?.subjectId ?? initialSubjectId ?? data.recommendation?.subjectId ?? data.subjects[0]?.id ?? "");
  const [topicId, setTopicId] = useState(editingReview?.topicId ?? data.recommendation?.topicId ?? "none");
  const [stage, setStage] = useState<"result" | "setup">("setup");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [duration, setDuration] = useState(editingSession?.durationMinutes ?? data.recommendation?.durationMinutes ?? 25);
  const [reviews, setReviews] = useState<ReviewDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activeSubjects = data.subjects.filter((subject) => subject.isActive);
  const topics = activeSubjects.find((subject) => subject.id === subjectId)?.topics.filter((topic) => topic.isActive) ?? [];
  const pending = createSession.isPending || createSubject.isPending || createTopic.isPending || createReview.isPending || updateSession.isPending || updateSubject.isPending || updateReview.isPending;

  function close() {
    setError(null);
    setStage("setup");
    setStartedAt(null);
    setReviews([]);
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    try {
      setError(null);
      if (mode === "subject" || mode === "edit-subject") {
        const payload = { color: value("color") || null, name: value("name"), notes: value("notes") || null, plannedMinutesPerWeek: Number(value("plannedMinutesPerWeek") || 0) };
        if (editingSubject) await updateSubject.mutateAsync({ data: payload, id: editingSubject.id });
        else await createSubject.mutateAsync(payload);
      } else if (mode === "topic") {
        await createTopic.mutateAsync({ name: value("name"), subjectId });
      } else if (mode === "review" || mode === "edit-review") {
        const payload = { answer: value("answer") || null, dueAt: value("dueAt"), notes: value("notes") || null, prompt: value("prompt"), subjectId, topicId: topicId === "none" ? null : topicId };
        if (editingReview) await updateReview.mutateAsync({ data: payload, id: editingReview.id });
        else await createReview.mutateAsync(payload);
      } else if (mode === "edit-session" && editingSession) {
        await updateSession.mutateAsync({ data: { endedAt: new Date(value("endedAt")).toISOString(), notes: value("notes") || null, startedAt: new Date(value("startedAt")).toISOString(), subjectId }, id: editingSession.id });
      } else if (mode === "session" && stage === "result") {
        const start = startedAt ?? new Date(Date.now() - duration * 60_000);
        await createSession.mutateAsync({
          correctQuestions: value("correctQuestions") ? Number(value("correctQuestions")) : null,
          endedAt: new Date(start.getTime() + duration * 60_000).toISOString(),
          notes: value("notes") || null,
          reviews: reviews.filter((item) => item.prompt.trim()).map((item) => ({ answer: item.answer.trim() || null, dueAt: inDays(1), notes: null, prompt: item.prompt.trim() })),
          startedAt: start.toISOString(),
          subjectId,
          topicId: topicId === "none" ? null : topicId,
          totalQuestions: value("totalQuestions") ? Number(value("totalQuestions")) : null,
        });
      }
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel salvar.");
    }
  }

  if (!mode) return null;
  const title = mode === "session" ? (stage === "setup" ? "Preparar sessao" : "Resultado da sessao") : mode === "edit-session" ? "Editar sessao" : mode === "edit-subject" ? "Editar materia" : mode === "subject" ? "Nova materia" : mode === "topic" ? "Novo topico" : mode === "edit-review" ? "Editar revisao" : "Capturar revisao";
  const description = mode === "session" ? (stage === "setup" ? "Confirme a recomendacao ou escolha outro foco." : "Registre somente o que aconteceu nesta sessao.") : mode === "edit-session" ? "Ajuste a materia, os horarios ou as notas." : mode === "subject" || mode === "edit-subject" ? "A meta semanal ajuda a ordenar a proxima acao." : mode === "topic" ? "Use um topico reutilizavel em sessoes e revisoes." : "Mantenha o ponto de lembranca atualizado.";

  return <Dialog open onOpenChange={(open) => !open && close()}><DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"><form className="grid gap-4" onSubmit={submit}>
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
    {(mode === "subject" || mode === "edit-subject") && <><Field label="Materia"><Input name="name" required autoFocus defaultValue={editingSubject?.name} /></Field><Field label="Meta semanal em minutos"><Input min="0" name="plannedMinutesPerWeek" type="number" defaultValue={editingSubject?.plannedMinutesPerWeek ?? 120} /></Field><Field label="Cor opcional"><Input name="color" type="color" defaultValue={editingSubject?.color ?? "#6366f1"} /></Field><Field label="Notas opcionais"><Textarea name="notes" defaultValue={editingSubject?.notes ?? ""} /></Field></>}
    {(mode === "session" || mode === "edit-session" || mode === "topic" || mode === "review" || mode === "edit-review") && <Field label="Materia"><Select value={subjectId} onValueChange={(value) => { setSubjectId(value); setTopicId("none"); }}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{activeSubjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}</SelectContent></Select></Field>}
    {(mode === "session" || mode === "review" || mode === "edit-review") && <Field label="Topico opcional"><Select value={topicId} onValueChange={setTopicId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem topico</SelectItem>{topics.map((topic) => <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>)}</SelectContent></Select></Field>}
    {mode === "topic" && <Field label="Topico"><Input name="name" required /></Field>}
    {(mode === "review" || mode === "edit-review") && <><Field label="Ponto de lembranca"><Textarea name="prompt" required defaultValue={editingReview?.prompt} /></Field><Field label="Resposta opcional"><Textarea name="answer" defaultValue={editingReview?.answer ?? ""} /></Field><Field label="Revisar em"><Input defaultValue={editingReview ? dateInput(editingReview.dueAt) : today()} name="dueAt" type="date" required /></Field><Field label="Notas opcionais"><Textarea name="notes" defaultValue={editingReview?.notes ?? ""} /></Field></>}
    {mode === "edit-session" && editingSession && <><div className="grid gap-4 sm:grid-cols-2"><Field label="Inicio"><Input defaultValue={dateTimeInput(editingSession.startedAt)} name="startedAt" type="datetime-local" required /></Field><Field label="Fim"><Input defaultValue={dateTimeInput(editingSession.endedAt)} name="endedAt" type="datetime-local" required /></Field></div><Field label="Notas da sessao"><Textarea name="notes" defaultValue={editingSession.notes ?? ""} /></Field></>}
    {mode === "session" && stage === "setup" && <Field label="Duracao sugerida (minutos)"><Input min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} type="number" required /></Field>}
    {mode === "session" && stage === "result" && <><div className="rounded-lg border border-border bg-secondary/35 p-3 text-sm"><span className="font-medium">{formatMinutes(duration)}</span> em {activeSubjects.find((subject) => subject.id === subjectId)?.name}</div><div className="grid gap-4 sm:grid-cols-2"><Field label="Questoes"><Input min="0" name="totalQuestions" type="number" /></Field><Field label="Acertos"><Input min="0" name="correctQuestions" type="number" /></Field></div><Field label="Notas da sessao"><Textarea name="notes" /></Field><div className="grid gap-3 rounded-lg border border-border p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-medium">Itens para revisar</p><p className="text-xs text-text-secondary">Cada item entra para amanha.</p></div><Button size="sm" type="button" variant="outline" onClick={() => setReviews((items) => [...items, { answer: "", prompt: "" }])}><Plus className="size-4" />Adicionar</Button></div>{reviews.map((review, index) => <div className="grid gap-2 rounded-md bg-secondary/35 p-3" key={index}><Input aria-label={`Ponto de lembranca ${index + 1}`} placeholder="O que lembrar?" value={review.prompt} onChange={(event) => setReviews((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, prompt: event.target.value } : item))} /><Textarea aria-label={`Resposta ${index + 1}`} placeholder="Resposta opcional" value={review.answer} onChange={(event) => setReviews((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} /></div>)}</div></>}
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <DialogFooter><Button disabled={pending} type="button" variant="outline" onClick={close}>Cancelar</Button>{mode === "session" && stage === "setup" ? <Button disabled={!subjectId || duration < 1} type="button" onClick={() => { setStartedAt(new Date()); setStage("result"); }}>Iniciar sessao</Button> : <Button disabled={pending || (!subjectId && mode !== "subject" && mode !== "edit-subject")} type="submit">{pending ? "Salvando..." : mode === "session" ? "Concluir sessao" : mode.startsWith("edit-") ? "Salvar alteracoes" : "Salvar"}</Button>}</DialogFooter>
  </form></DialogContent></Dialog>;
}

function TodayMetricStrip({ summary }: { summary: ReturnType<typeof calculateStudyTodaySummary> }) {
  const metrics = [
    { label: "Estudado hoje", value: formatMinutes(summary.studiedMinutes), icon: Clock3 },
    { label: "Revisões vencidas", value: summary.overdueReviews.length, icon: CalendarClock },
    { label: "Taxa de acertos", value: summary.accuracy === null ? "Sem dados" : `${summary.accuracy}%`, icon: Brain },
  ];

  return <section className="grid shrink-0 overflow-hidden rounded-2xl border border-border bg-panel sm:grid-cols-[repeat(3,minmax(0,1fr))_minmax(220px,1.25fr)]">
    {metrics.map((metric) => {
      const Icon = metric.icon;
      return <div className="min-w-0 border-b border-border p-4 sm:border-b-0 sm:border-r" key={metric.label}>
        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
          <Icon className="size-3.5" />
          <span>{metric.label}</span>
        </div>
        <div className="mt-1 truncate text-xl font-bold tracking-[-0.04em] text-foreground md:text-[22px]">{metric.value}</div>
      </div>;
    })}
    <div className="min-w-0 p-4">
      <div className="flex items-center justify-between gap-3 text-[10px] text-text-tertiary">
        <span>Meta diária</span>
        <strong className="text-xs text-foreground">{summary.goalProgress}%</strong>
      </div>
      <Progress className="mt-2" value={summary.goalProgress} />
      <p className="mt-1.5 truncate text-[10px] text-text-tertiary">
        {summary.goalMinutes > 0
          ? `${formatMinutes(summary.studiedMinutes)} de ${formatMinutes(summary.goalMinutes)}`
          : "Defina metas semanais nas matérias"}
      </p>
    </div>
  </section>;
}

function SubjectCard({ item, onAddTopic, onDelete, onEdit, subject }: { item: StudyAttention; onAddTopic: () => void; onDelete: () => void; onEdit: () => void; subject: StudySubjectCore }) {
  const progress = item.goalMinutes > 0 ? Math.min(100, item.studiedMinutes / item.goalMinutes * 100) : 0;

  return <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-panel p-4 shadow-snow-1">
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color ?? "var(--primary)" }} />
          <h3 className="truncate text-sm font-semibold">{item.subjectName}</h3>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] text-text-tertiary">{subject.notes || item.reason}</p>
      </div>
      <ActionMenu onDelete={onDelete} onEdit={onEdit} />
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-secondary/35 p-3 text-center">
      <div><strong className="block text-sm">{formatMinutes(item.studiedMinutes)}</strong><span className="text-[10px] text-text-tertiary">estudado</span></div>
      <div><strong className="block text-sm">{formatMinutes(item.goalMinutes)}</strong><span className="text-[10px] text-text-tertiary">meta</span></div>
      <div><strong className="block text-sm">{item.accuracy}%</strong><span className="text-[10px] text-text-tertiary">acertos</span></div>
    </div>

    <div className="mt-4">
      <div className="flex items-center justify-between gap-3 text-[10px] text-text-tertiary">
        <span>Progresso semanal</span><span>{Math.round(progress)}%</span>
      </div>
      <Progress className="mt-1.5" value={progress} />
      <p className="mt-2 text-[11px] text-text-tertiary">{item.reason}</p>
    </div>

    <div className="mt-4 border-t border-border pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold">Tópicos ({subject.topics.filter((topic) => topic.isActive).length})</span>
        <Button size="sm" type="button" variant="ghost" onClick={onAddTopic}><Plus className="size-3.5" />Adicionar</Button>
      </div>
      <div className="mt-2 flex min-h-7 flex-wrap gap-1.5">
        {subject.topics.filter((topic) => topic.isActive).length
          ? subject.topics.filter((topic) => topic.isActive).map((topic) => <Badge key={topic.id} variant="outline">{topic.name}</Badge>)
          : <span className="text-[11px] text-text-tertiary">Nenhum tópico vinculado.</span>}
      </div>
    </div>
  </article>;
}

function ReviewItem({ onDelete, onEdit, review }: { onDelete: () => void; onEdit: () => void; review: StudyReview }) {
  const master = useMasterStudyReview();
  const reschedule = useRescheduleStudyReview();
  const [revealed, setRevealed] = useState(false);
  const overdue = new Date(review.dueAt) <= new Date();

  return <article className="border-t border-border px-2 py-3 first:border-t-0">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0">
        <strong className="block truncate text-sm">{review.subject?.name}{review.topic ? ` - ${review.topic.name}` : ""}</strong>
        <span className="mt-1 block truncate text-[11px] text-text-tertiary">{review.prompt}</span>
      </div>
      <Badge variant={overdue ? "destructive" : "outline"}>{overdue ? "Hoje" : date.format(new Date(review.dueAt))}</Badge>
    </div>
    {revealed ? <div className="mt-3 rounded-lg bg-secondary/35 p-3 text-sm text-text-secondary">{review.answer || review.notes || "Sem resposta registrada."}</div> : null}
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setRevealed((value) => !value)}><Eye className="size-4" />{revealed ? "Ocultar" : "Resposta"}</Button>
      <Button size="sm" variant="outline" disabled={reschedule.isPending} onClick={() => reschedule.mutate({ dueAt: inDays(7), id: review.id })}><RotateCcw className="size-4" />7 dias</Button>
      <Button size="sm" disabled={master.isPending} onClick={() => master.mutate(review.id)}><CheckCircle2 className="size-4" />Dominei</Button>
      <ActionMenu onDelete={onDelete} onEdit={onEdit} />
    </div>
  </article>;
}

function ReviewFocus({ current, onDelete, onEdit, onNext, onPrevious, position, total }: { current: StudyReview; onDelete: () => void; onEdit: () => void; onNext: () => void; onPrevious: () => void; position: number; total: number }) {
  const master = useMasterStudyReview();
  const reschedule = useRescheduleStudyReview();
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = master.isPending || reschedule.isPending;
  const overdue = new Date(current.dueAt) <= new Date();

  async function record(result: "tomorrow" | "week" | "mastered") {
    try {
      setError(null);
      if (result === "mastered") await master.mutateAsync(current.id);
      else await reschedule.mutateAsync({ dueAt: inDays(result === "tomorrow" ? 1 : 7), id: current.id });
      setRevealed(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível registrar o resultado.");
    }
  }

  return <article className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center py-2 sm:py-6">
    <div className="rounded-2xl border border-border bg-panel p-4 shadow-snow-1 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
            <Badge variant={overdue ? "destructive" : "outline"}>{overdue ? "Vencida" : date.format(new Date(current.dueAt))}</Badge>
            <span>{current.subject?.name}{current.topic ? ` · ${current.topic.name}` : ""}</span>
          </div>
          <p className="mt-5 break-words text-lg font-semibold leading-relaxed sm:text-xl">{current.prompt}</p>
        </div>
        <ActionMenu onDelete={onDelete} onEdit={onEdit} />
      </div>

      <div className="mt-6 min-h-28 rounded-xl border border-dashed border-border bg-secondary/25 p-4 sm:p-5">
        {revealed
          ? <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-tertiary">Resposta</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{current.answer || current.notes || "Sem resposta registrada."}</p></div>
          : <button className="flex min-h-20 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-primary hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" type="button" onClick={() => setRevealed(true)}><Eye className="size-4" />Revelar resposta</button>}
      </div>

      {revealed ? <div className="mt-5">
        <p className="text-xs font-medium text-text-secondary">Como foi esta revisão?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Button variant="outline" disabled={pending} onClick={() => record("tomorrow")}><RotateCcw className="size-4" />Rever amanhã</Button>
          <Button variant="outline" disabled={pending} onClick={() => record("week")}><CalendarClock className="size-4" />Rever em 7 dias</Button>
          <Button disabled={pending} onClick={() => record("mastered")}><CheckCircle2 className="size-4" />Dominei</Button>
        </div>
      </div> : null}
      {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
    </div>

    <div className="mt-3 flex items-center justify-between gap-3 px-1">
      <Button aria-label="Revisão anterior" size="sm" variant="ghost" disabled={position === 0} onClick={onPrevious}><ChevronLeft className="size-4" />Anterior</Button>
      <span className="text-xs text-text-tertiary">{position + 1} de {total}</span>
      <Button aria-label="Próxima revisão" size="sm" variant="ghost" disabled={position >= total - 1} onClick={onNext}>Próxima<ChevronRight className="size-4" /></Button>
    </div>
  </article>;
}

function StudyPlanLinks() {
  return <div className="grid gap-2 border-t border-border px-2 py-3 md:grid-cols-2">
    {studyPlanLinks.map((plan) => <Link className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-secondary/35 p-3 text-sm hover:bg-hover" href={plan.href} key={plan.href}>
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-panel text-text-secondary"><FileText className="size-4" /></span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{plan.title}</span>
          <span className="block truncate text-[11px] text-text-tertiary">{plan.description}</span>
        </span>
      </span>
      <FileText className="size-4 shrink-0 text-text-tertiary" />
    </Link>)}
  </div>;
}

function StudyHistory({ data, onDelete, onEdit }: { data: StudyWorkspace; onDelete: (session: StudySessionCore) => void; onEdit: (session: StudySessionCore) => void }) {
  const [month, setMonth] = useState(() => String(new Date().getMonth() + 1));
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const years = useMemo(() => Array.from(new Set([new Date().getFullYear(), ...data.sessions.map((session) => new Date(session.startedAt).getFullYear())])).sort((a, b) => b - a), [data.sessions]);
  const filtered = useMemo(() => data.sessions.filter((session) => {
    const startedAt = new Date(session.startedAt);
    return startedAt.getFullYear() === Number(year) && (month === "all" || startedAt.getMonth() + 1 === Number(month));
  }), [data.sessions, month, year]);
  const totals = useMemo(() => {
    const minutes = filtered.reduce((sum, session) => sum + session.durationMinutes, 0);
    const questions = filtered.reduce((sum, session) => sum + (session.totalQuestions ?? 0), 0);
    const correct = filtered.reduce((sum, session) => sum + (session.correctQuestions ?? 0), 0);
    const bySubject = Array.from(filtered.reduce((map, session) => {
      const name = session.subject?.name ?? "Matéria removida";
      map.set(name, (map.get(name) ?? 0) + session.durationMinutes);
      return map;
    }, new Map<string, number>())).sort((a, b) => b[1] - a[1]);
    return { accuracy: questions ? Math.round(correct / questions * 100) : null, bySubject, minutes, questions };
  }, [filtered]);

  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto lg:overflow-hidden">
    <section className="grid shrink-0 gap-3 rounded-2xl border border-border bg-panel p-3 sm:grid-cols-[minmax(0,1fr)_180px_150px] sm:items-end">
      <div><h2 className="text-sm font-semibold">Histórico de sessões</h2><p className="mt-1 text-[11px] text-text-tertiary">Consulte tempo, questões e desempenho por período.</p></div>
      <Field label="Mês"><Select value={month} onValueChange={setMonth}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{months.map((label, index) => <SelectItem key={label} value={index === 0 ? "all" : String(index)}>{label}</SelectItem>)}</SelectContent></Select></Field>
      <Field label="Ano"><Select value={year} onValueChange={setYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{years.map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent></Select></Field>
    </section>

    <section className="grid shrink-0 grid-cols-2 overflow-hidden rounded-2xl border border-border bg-panel lg:grid-cols-4">
      {[
        ["Sessões", String(filtered.length)],
        ["Tempo total", formatMinutes(totals.minutes)],
        ["Questões", String(totals.questions)],
        ["Taxa de acertos", totals.accuracy === null ? "Sem dados" : `${totals.accuracy}%`],
      ].map(([label, value]) => <div className="min-w-0 border-b border-r border-border p-3 last:border-r-0 lg:border-b-0" key={label}><span className="text-[10px] text-text-tertiary">{label}</span><strong className="mt-1 block truncate text-lg">{value}</strong></div>)}
    </section>

    <div className="grid min-h-0 gap-3 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.36fr)]">
      <article className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-border bg-panel lg:min-h-0">
        <header className="shrink-0 border-b border-border px-4 py-3"><h3 className="text-sm font-semibold">Sessões no período</h3><p className="mt-1 text-[11px] text-text-tertiary">{filtered.length} registro(s) encontrado(s).</p></header>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {filtered.length ? filtered.map((session) => <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-t border-border first:border-t-0" key={session.id}><div className="min-w-0 px-3 py-3"><p className="truncate text-sm font-medium">{session.subject?.name}{session.topic ? ` · ${session.topic.name}` : ""}</p><p className="mt-1 truncate text-[11px] text-text-tertiary">{dateTime.format(new Date(session.startedAt))}{session.totalQuestions !== null && session.totalQuestions !== undefined ? ` · ${session.correctQuestions ?? 0}/${session.totalQuestions} acertos` : ""}</p>{session.notes ? <p className="mt-1 line-clamp-1 text-[11px] text-text-secondary">{session.notes}</p> : null}</div><div className="flex items-center gap-1 pr-2"><span className="text-xs font-semibold">{formatMinutes(session.durationMinutes)}</span><ActionMenu onEdit={() => onEdit(session)} onDelete={() => onDelete(session)} /></div></div>) : <EmptyState title="Nenhuma sessão no período" description="Altere os filtros ou registre uma nova sessão." />}
        </div>
      </article>

      <aside className="rounded-2xl border border-border bg-panel p-4 lg:min-h-0 lg:overflow-y-auto">
        <h3 className="text-sm font-semibold">Tempo por matéria</h3>
        <div className="mt-3 grid gap-3">
          {totals.bySubject.length ? totals.bySubject.map(([name, minutes]) => <div key={name}><div className="flex items-center justify-between gap-3 text-xs"><span className="truncate text-text-secondary">{name}</span><strong>{formatMinutes(minutes)}</strong></div><Progress className="mt-1.5" value={totals.minutes ? minutes / totals.minutes * 100 : 0} /></div>) : <p className="text-xs text-text-tertiary">Sem tempo registrado neste período.</p>}
        </div>
      </aside>
    </div>
  </div>;
}

export default function StudyPage() {
  const workspace = useStudyWorkspace();
  const deleteSubject = useDeleteStudySubject();
  const deleteSession = useDeleteStudySession();
  const deleteReview = useDeleteStudyReview();
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudyTab>("today");
  const [topicSubjectId, setTopicSubjectId] = useState<string | undefined>();
  const [reviewIndex, setReviewIndex] = useState(0);
  const data = workspace.data;
  const attention = useMemo(() => data ? buildStudySubjectAttention(data.subjects, data.sessions, data.reviews) : [], [data]);
  const pendingReviews = useMemo(() => data?.reviews.filter((review) => review.status === "pending").sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()) ?? [], [data]);
  const currentReviewIndex = Math.min(reviewIndex, Math.max(0, pendingReviews.length - 1));
  const currentReview = pendingReviews[currentReviewIndex];
  const todaySummary = useMemo(() => data ? calculateStudyTodaySummary(data.subjects, data.sessions, data.reviews) : null, [data]);
  const deleting = deleteSubject.isPending || deleteSession.isPending || deleteReview.isPending;

  function edit(mode: DialogMode, item: EditingItem) {
    setEditingItem(item);
    setDialog(mode);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleteError(null);
      if (deleteTarget.kind === "subject") await deleteSubject.mutateAsync(deleteTarget.item.id);
      if (deleteTarget.kind === "session") await deleteSession.mutateAsync(deleteTarget.item.id);
      if (deleteTarget.kind === "review") await deleteReview.mutateAsync(deleteTarget.item.id);
      setDeleteTarget(null);
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Nao foi possivel apagar.");
    }
  }

  const deleteCopy = deleteTarget?.kind === "subject"
    ? { title: "Apagar materia?", description: "Sessoes, revisoes ou topicos vinculados podem ser afetados. Esta acao nao pode ser desfeita." }
    : deleteTarget?.kind === "session"
      ? { title: "Apagar sessao?", description: "O historico e as metricas de estudo serao recalculados. Esta acao nao pode ser desfeita." }
      : { title: "Apagar revisao?", description: "Este item sera removido da fila de revisoes. Esta acao nao pode ser desfeita." };

  const hasActiveSubject = data?.subjects.some((subject) => subject.isActive) ?? false;
  const headerAction = activeTab === "today"
    ? hasActiveSubject
      ? <Button asChild size="sm"><Link href="/pomodoro"><BookOpen className="size-4" />Iniciar foco</Link></Button>
      : <Button disabled size="sm"><BookOpen className="size-4" />Iniciar foco</Button>
    : activeTab === "subjects"
      ? <Button size="sm" onClick={() => setDialog("subject")}><Plus className="size-4" />Nova matéria</Button>
      : activeTab === "reviews"
        ? <Button disabled={!hasActiveSubject} size="sm" onClick={() => setDialog("review")}><Plus className="size-4" />Nova revisão</Button>
        : <Button disabled={!hasActiveSubject} size="sm" onClick={() => setDialog("session")}><Plus className="size-4" />Registrar sessão</Button>;

  return <DashboardViewport className="w-full max-w-none" contentClassName="overflow-hidden pb-4" header={<MenuPageHeader eyebrow="Workspace" title="Estudos" action={headerAction} />}>
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
      <SegmentedControl aria-label="Áreas de Estudos" className="grid w-full shrink-0 grid-cols-4 [&>button]:min-w-0 [&>button]:px-2" options={studyTabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden" role="tabpanel">
        {workspace.isLoading ? <LoadingState title="Preparando seus estudos" /> : workspace.isError || !data || !todaySummary ? <ErrorState title="Não foi possível carregar Estudos" description="Tente novamente para recalcular sua próxima ação." action={<RetryButton onClick={() => workspace.refetch()} />} /> : <>
          {activeTab === "today" ? <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto lg:overflow-hidden">
            <TodayMetricStrip summary={todaySummary} />
            <div className="grid shrink-0 gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
              {data.recommendation ? <section className="flex min-h-0 flex-col justify-between rounded-[20px] border border-primary/30 bg-panel p-5 shadow-snow-1 lg:overflow-y-auto lg:p-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-primary"><Target className="size-4" />Próxima matéria recomendada</div>
                  <h2 className="mt-3 break-words text-2xl font-bold leading-tight tracking-[-0.035em] text-foreground">{data.recommendation.subjectName}{data.recommendation.topicName ? ` · ${data.recommendation.topicName}` : ""}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{data.recommendation.reason}</p>
                  <p className="mt-4 text-xs text-text-tertiary"><strong className="text-foreground">{data.recommendation.durationMinutes} min</strong> sugeridos para a próxima sessão</p>
                </div>
                <Button asChild className="mt-6 w-full sm:w-fit"><Link href="/pomodoro"><BookOpen className="size-4" />Iniciar foco</Link></Button>
              </section> : <EmptyState className="rounded-[20px] border border-border bg-panel" title="Crie sua primeira matéria" description="Uma matéria ativa é suficiente para gerar sua próxima recomendação." action={<Button onClick={() => setDialog("subject")}><Plus className="size-4" />Criar matéria</Button>} />}

              <article className="flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-border bg-panel">
                <header className="shrink-0 border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold">Revisões vencidas</h3>
                  <p className="mt-1 text-[11px] text-text-tertiary">Resolva primeiro o que já passou do prazo.</p>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                  {todaySummary.overdueReviews.length ? todaySummary.overdueReviews.map((review) => <ReviewItem key={review.id} review={review} onEdit={() => edit("edit-review", review)} onDelete={() => { setDeleteError(null); setDeleteTarget({ kind: "review", item: review }); }} />) : <EmptyState title="Tudo em dia" description="Nenhuma revisão vencida por enquanto." />}
                </div>
              </article>
            </div>
          </div> : null}

          {activeTab === "subjects" ? <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
            <section className="grid shrink-0 grid-cols-2 overflow-hidden rounded-2xl border border-border bg-panel sm:grid-cols-4">
              {[
                ["Matérias ativas", String(attention.length)],
                ["Meta semanal", formatMinutes(attention.reduce((sum, item) => sum + item.goalMinutes, 0))],
                ["Estudado", formatMinutes(attention.reduce((sum, item) => sum + item.studiedMinutes, 0))],
                ["Revisões vencidas", String(attention.reduce((sum, item) => sum + item.overdueReviews, 0))],
              ].map(([label, value]) => <div className="min-w-0 border-b border-r border-border p-3 last:border-r-0 sm:border-b-0" key={label}><span className="text-[10px] text-text-tertiary">{label}</span><strong className="mt-1 block truncate text-lg">{value}</strong></div>)}
            </section>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {attention.length === 0 ? <EmptyState className="md:col-span-2 xl:col-span-3" title="Nenhuma matéria ativa" description="Crie uma matéria para começar." /> : attention.map((item) => { const subject = data.subjects.find((value) => value.id === item.subjectId)!; return <SubjectCard item={item} subject={subject} key={item.subjectId} onAddTopic={() => { setTopicSubjectId(subject.id); setDialog("topic"); }} onEdit={() => edit("edit-subject", subject)} onDelete={() => { setDeleteError(null); setDeleteTarget({ kind: "subject", item: subject }); }} />; })}
            </div>
            <section className="shrink-0 overflow-hidden rounded-2xl border border-border bg-panel"><header className="px-4 py-3"><h2 className="text-sm font-semibold">Planos de estudo</h2><p className="mt-1 text-[11px] text-text-tertiary">Acompanhe os roteiros detalhados sem sair do workspace.</p></header><StudyPlanLinks /></section>
          </div> : null}

          {activeTab === "reviews" ? <div className="h-full min-h-0 overflow-y-auto px-0.5">
            {currentReview ? <ReviewFocus key={currentReview.id} current={currentReview} position={currentReviewIndex} total={pendingReviews.length} onPrevious={() => setReviewIndex((value) => Math.max(0, value - 1))} onNext={() => setReviewIndex((value) => Math.min(pendingReviews.length - 1, value + 1))} onEdit={() => edit("edit-review", currentReview)} onDelete={() => { setDeleteError(null); setDeleteTarget({ kind: "review", item: currentReview }); }} /> : <EmptyState className="h-full" title="Nenhuma revisão pendente" description="Capture um ponto importante quando precisar revê-lo." />}
          </div> : null}

          {activeTab === "history" ? <StudyHistory data={data} onEdit={(session) => edit("edit-session", session)} onDelete={(session) => { setDeleteError(null); setDeleteTarget({ kind: "session", item: session }); }} /> : null}
        </>}
      </div>

      {data ? <StudyDialog key={`${dialog}-${editingItem?.id ?? topicSubjectId ?? "new"}`} data={data} editingItem={editingItem} initialSubjectId={topicSubjectId} mode={dialog} onClose={() => { setDialog(null); setEditingItem(null); setTopicSubjectId(undefined); }} /> : null}
      <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !deleting) { setDeleteTarget(null); setDeleteError(null); } }} title={deleteCopy.title} description={deleteCopy.description} confirmLabel={deleting ? "Apagando..." : "Apagar"} isPending={deleting} error={deleteError} onConfirm={confirmDelete} />
    </div>
  </DashboardViewport>;
}
