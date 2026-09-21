"use client";

import { useMemo, useState, type FormEvent } from "react";
import { BookOpen, Brain, CalendarClock, CheckCircle2, Clock3, ExternalLink, Eye, FileText, Plus, RotateCcw, Target } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { EmptyState, ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStudyReview, useCreateStudySession, useCreateStudySubject, useCreateStudyTopic, useMasterStudyReview, useRescheduleStudyReview, useStudyWorkspace } from "@/hooks/useStudyWorkspace";
import { buildStudySubjectAttention } from "@/lib/study-core";
import type { StudyReview, StudyWorkspace } from "@/types/Study";

type DialogMode = "review" | "session" | "subject" | "topic" | null;
type ReviewDraft = { answer: string; prompt: string };
type StudyAttention = ReturnType<typeof buildStudySubjectAttention>[number];

const studyPlanLinks = [
  {
    description: "Perfil 3, FGV, plano alternado ate 21/09.",
    href: "/study-plans/dataprev-plan.html",
    title: "Dataprev Plan",
  },
  {
    description: "Analista e Tecnico de TI, auditoria 2017-2025.",
    href: "/study-plans/trt-ti-auditoria-plan.html",
    title: "TRT em estudos",
  },
];

const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const today = () => new Date().toISOString().slice(0, 10);
const inDays = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h${rest ? ` ${rest}min` : ""}` : `${rest}min`;
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}

function StudyDialog({ data, mode, onClose }: { data: StudyWorkspace; mode: DialogMode; onClose: () => void }) {
  const createSession = useCreateStudySession();
  const createSubject = useCreateStudySubject();
  const createTopic = useCreateStudyTopic();
  const createReview = useCreateStudyReview();
  const [subjectId, setSubjectId] = useState(data.recommendation?.subjectId ?? data.subjects[0]?.id ?? "");
  const [topicId, setTopicId] = useState(data.recommendation?.topicId ?? "none");
  const [stage, setStage] = useState<"result" | "setup">("setup");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [duration, setDuration] = useState(data.recommendation?.durationMinutes ?? 25);
  const [reviews, setReviews] = useState<ReviewDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activeSubjects = data.subjects.filter((subject) => subject.isActive);
  const topics = activeSubjects.find((subject) => subject.id === subjectId)?.topics.filter((topic) => topic.isActive) ?? [];
  const pending = createSession.isPending || createSubject.isPending || createTopic.isPending || createReview.isPending;

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
      if (mode === "subject") {
        await createSubject.mutateAsync({ name: value("name"), plannedMinutesPerWeek: Number(value("plannedMinutesPerWeek") || 0) });
      } else if (mode === "topic") {
        await createTopic.mutateAsync({ name: value("name"), subjectId });
      } else if (mode === "review") {
        await createReview.mutateAsync({ answer: value("answer") || null, dueAt: value("dueAt"), notes: value("notes") || null, prompt: value("prompt"), subjectId, topicId: topicId === "none" ? null : topicId });
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
  const title = mode === "session" ? (stage === "setup" ? "Preparar sessao" : "Resultado da sessao") : mode === "subject" ? "Nova materia" : mode === "topic" ? "Novo topico" : "Capturar revisao";
  const description = mode === "session" ? (stage === "setup" ? "Confirme a recomendacao ou escolha outro foco." : "Registre somente o que aconteceu nesta sessao.") : mode === "subject" ? "A meta semanal e opcional e ajuda a ordenar a proxima acao." : mode === "topic" ? "Use um topico reutilizavel em sessoes e revisoes." : "Adicione um ponto importante diretamente a fila.";

  return <Dialog open onOpenChange={(open) => !open && close()}><DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"><form className="grid gap-4" onSubmit={submit}>
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
    {mode === "subject" && <><Field label="Materia"><Input name="name" required autoFocus /></Field><Field label="Meta semanal em minutos"><Input min="0" name="plannedMinutesPerWeek" type="number" defaultValue="120" /></Field></>}
    {(mode === "session" || mode === "topic" || mode === "review") && <Field label="Materia"><Select value={subjectId} onValueChange={(value) => { setSubjectId(value); setTopicId("none"); }}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{activeSubjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}</SelectContent></Select></Field>}
    {(mode === "session" || mode === "review") && <Field label="Topico opcional"><Select value={topicId} onValueChange={setTopicId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem topico</SelectItem>{topics.map((topic) => <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>)}</SelectContent></Select></Field>}
    {mode === "topic" && <Field label="Topico"><Input name="name" required /></Field>}
    {mode === "review" && <><Field label="Ponto de lembranca"><Textarea name="prompt" required /></Field><Field label="Resposta opcional"><Textarea name="answer" /></Field><Field label="Revisar em"><Input defaultValue={today()} name="dueAt" type="date" required /></Field><Field label="Notas opcionais"><Textarea name="notes" /></Field></>}
    {mode === "session" && stage === "setup" && <Field label="Duracao sugerida (minutos)"><Input min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} type="number" required /></Field>}
    {mode === "session" && stage === "result" && <><div className="rounded-lg border border-border bg-secondary/35 p-3 text-sm"><span className="font-medium">{formatMinutes(duration)}</span> em {activeSubjects.find((subject) => subject.id === subjectId)?.name}</div><div className="grid gap-4 sm:grid-cols-2"><Field label="Questoes"><Input min="0" name="totalQuestions" type="number" /></Field><Field label="Acertos"><Input min="0" name="correctQuestions" type="number" /></Field></div><Field label="Notas da sessao"><Textarea name="notes" /></Field><div className="grid gap-3 rounded-lg border border-border p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-medium">Itens para revisar</p><p className="text-xs text-text-secondary">Cada item entra para amanha.</p></div><Button size="sm" type="button" variant="outline" onClick={() => setReviews((items) => [...items, { answer: "", prompt: "" }])}><Plus className="size-4" />Adicionar</Button></div>{reviews.map((review, index) => <div className="grid gap-2 rounded-md bg-secondary/35 p-3" key={index}><Input aria-label={`Ponto de lembranca ${index + 1}`} placeholder="O que lembrar?" value={review.prompt} onChange={(event) => setReviews((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, prompt: event.target.value } : item))} /><Textarea aria-label={`Resposta ${index + 1}`} placeholder="Resposta opcional" value={review.answer} onChange={(event) => setReviews((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} /></div>)}</div></>}
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <DialogFooter><Button type="button" variant="outline" onClick={close}>Cancelar</Button>{mode === "session" && stage === "setup" ? <Button disabled={!subjectId || duration < 1} type="button" onClick={() => { setStartedAt(new Date()); setStage("result"); }}>Iniciar sessao</Button> : <Button disabled={pending || (!subjectId && mode !== "subject")} type="submit">{pending ? "Salvando..." : mode === "session" ? "Concluir sessao" : "Salvar"}</Button>}</DialogFooter>
  </form></DialogContent></Dialog>;
}

function MetricStrip({ data }: { data: StudyWorkspace }) {
  const metrics = [
    { label: "Tempo", value: formatMinutes(data.metrics.studiedMinutes), icon: Clock3 },
    { label: "Questoes", value: data.metrics.totalQuestions, icon: BookOpen },
    { label: "Acertos", value: `${data.metrics.accuracy}%`, icon: Brain },
    { label: "Revisoes", value: data.metrics.overdueReviews, icon: CalendarClock },
  ];

  return <section className="grid shrink-0 grid-cols-2 overflow-hidden rounded-2xl border border-border bg-panel md:flex md:min-h-[70px] md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent">
    {metrics.map((metric) => {
      const Icon = metric.icon;
      return <div className="min-w-0 border-r border-b border-border p-4 last:border-r-0 even:border-r-0 md:flex-1 md:border-b-0 md:px-5 md:first:pl-0 md:even:border-r md:last:border-r-0" key={metric.label}>
        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
          <Icon className="size-3.5" />
          <span>{metric.label}</span>
        </div>
        <div className="mt-1 text-xl font-bold tracking-[-0.04em] text-foreground md:text-[22px]">{metric.value}</div>
      </div>;
    })}
  </section>;
}

function AttentionRow({ item }: { item: StudyAttention }) {
  const progress = item.goalMinutes > 0 ? Math.min(100, item.studiedMinutes / item.goalMinutes * 100) : 0;

  return <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border px-2 py-3 first:border-t-0">
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color ?? "var(--primary)" }} />
        <span className="truncate">{item.subjectName}</span>
      </div>
      <p className="ml-4 mt-1 truncate text-[11px] text-text-tertiary">{item.reason}</p>
      {item.goalMinutes > 0 ? <div className="ml-4 mt-2 max-w-md"><Progress value={progress} /><p className="mt-1 text-[10px] text-text-tertiary">{formatMinutes(item.studiedMinutes)} de {formatMinutes(item.goalMinutes)} nesta semana</p></div> : null}
    </div>
    <div className="text-right text-sm font-bold text-foreground">
      {item.accuracy}%
      <small className="mt-0.5 block text-[10px] font-medium text-text-tertiary">acertos</small>
    </div>
  </article>;
}

function ReviewItem({ review }: { review: StudyReview }) {
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
    <div className="mt-3 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => setRevealed((value) => !value)}><Eye className="size-4" />{revealed ? "Ocultar" : "Resposta"}</Button>
      <Button size="sm" variant="outline" disabled={reschedule.isPending} onClick={() => reschedule.mutate({ dueAt: inDays(7), id: review.id })}><RotateCcw className="size-4" />7 dias</Button>
      <Button size="sm" disabled={master.isPending} onClick={() => master.mutate(review.id)}><CheckCircle2 className="size-4" />Dominei</Button>
    </div>
  </article>;
}

function StudyPlanLinks() {
  return <div className="grid gap-2 border-t border-border px-2 py-3 md:grid-cols-2">
    {studyPlanLinks.map((plan) => <a className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-secondary/35 p-3 text-sm hover:bg-hover" href={plan.href} target="_blank" rel="noreferrer" key={plan.href}>
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-panel text-text-secondary"><FileText className="size-4" /></span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{plan.title}</span>
          <span className="block truncate text-[11px] text-text-tertiary">{plan.description}</span>
        </span>
      </span>
      <ExternalLink className="size-4 shrink-0 text-text-tertiary" />
    </a>)}
  </div>;
}

export default function StudyPage() {
  const workspace = useStudyWorkspace();
  const [dialog, setDialog] = useState<DialogMode>(null);
  const data = workspace.data;
  const attention = useMemo(() => data ? buildStudySubjectAttention(data.subjects, data.sessions, data.reviews) : [], [data]);
  const pendingReviews = useMemo(() => data?.reviews.filter((review) => review.status === "pending").sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()).slice(0, 6) ?? [], [data]);
  const recentSessions = data?.sessions.slice(0, 4) ?? [];

  return <DashboardViewport contentClassName="overflow-hidden pb-4" header={<MenuPageHeader eyebrow="Hoje" title="Estudos" action={<Button size="sm" variant="ghost" disabled={!data?.subjects.some((subject) => subject.isActive)} onClick={() => setDialog("session")}><BookOpen className="size-4" />Sessao livre</Button>} />}>
    {workspace.isLoading ? <LoadingState title="Preparando seus estudos" /> : workspace.isError || !data ? <ErrorState title="Nao foi possivel carregar Estudos" description="Tente novamente para recalcular sua proxima acao." action={<RetryButton onClick={() => workspace.refetch()} />} /> : <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 md:gap-4">
      <div className="min-h-0 overflow-y-auto pr-1 md:contents">
        {data.recommendation ? <section className="grid shrink-0 items-center gap-5 rounded-[20px] border border-primary/30 bg-panel p-5 shadow-snow-1 md:grid-cols-[minmax(0,1fr)_auto] md:p-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-primary"><Target className="size-4" />Proxima acao</div>
            <h2 className="mt-2 truncate text-2xl font-bold leading-tight tracking-[-0.035em] text-foreground">{data.recommendation.subjectName}{data.recommendation.topicName ? ` - ${data.recommendation.topicName}` : ""}</h2>
            <p className="mt-2 text-sm text-text-secondary">{data.recommendation.reason}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-tertiary">
              <span><strong className="text-foreground">{data.recommendation.durationMinutes} min</strong> sugeridos</span>
              <span><strong className="text-foreground">{formatMinutes(data.metrics.studiedMinutes)}</strong> nesta semana</span>
            </div>
          </div>
          <Button className="h-[42px] w-full rounded-xl px-5 font-bold md:w-auto" onClick={() => setDialog("session")}><BookOpen className="size-4" />Comecar</Button>
        </section> : <EmptyState className="shrink-0 rounded-[20px] border border-border bg-panel" title="Crie sua primeira materia" description="Uma materia ativa e suficiente para gerar a primeira recomendacao." action={<Button onClick={() => setDialog("subject")}><Plus className="size-4" />Criar materia</Button>} />}

        <section className="mt-3 grid min-h-0 gap-3 md:mt-0 md:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.75fr)] md:gap-4">
          <div className="grid min-h-0 gap-3 md:grid-rows-[auto_minmax(0,1fr)]">
            <MetricStrip data={data} />
            <article className="flex min-h-[320px] flex-col overflow-hidden rounded-[18px] border border-border bg-panel md:min-h-0">
              <header className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">Foco da semana</h3>
                  <p className="mt-1 text-[11px] text-text-tertiary">Somente o que precisa de atencao.</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setDialog("subject")}>Materia</Button>
                  <Button size="sm" variant="ghost" disabled={!data.subjects.length} onClick={() => setDialog("topic")}>Topico</Button>
                </div>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                {attention.length === 0 ? <EmptyState title="Nada para priorizar" description="Ative ou crie uma materia para comecar." /> : attention.map((item) => <AttentionRow item={item} key={item.subjectId} />)}
                <StudyPlanLinks />
              </div>
            </article>
          </div>

          <aside className="grid min-h-0 gap-3 md:grid-rows-[auto_minmax(0,1fr)]">
            <section className="flex min-h-[70px] items-center justify-between gap-3 rounded-[18px] border border-border bg-panel px-4 py-3">
              <div className="flex items-baseline gap-2">
                <strong className="text-3xl font-bold tracking-[-0.05em]">{data.metrics.overdueReviews}</strong>
                <span className="text-xs text-text-tertiary">vencidas</span>
              </div>
              <Button size="sm" variant="ghost" disabled={!data.subjects.length} onClick={() => setDialog("review")}><Plus className="size-4" />Capturar</Button>
            </section>

            <article className="flex min-h-[320px] flex-col overflow-hidden rounded-[18px] border border-border bg-panel md:min-h-0">
              <header className="px-4 py-4">
                <h3 className="text-sm font-semibold">Proximas revisoes</h3>
                <p className="mt-1 text-[11px] text-text-tertiary">O que entra na fila agora.</p>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                {pendingReviews.length ? pendingReviews.map((review) => <ReviewItem key={review.id} review={review} />) : <div className="grid min-h-[130px] place-items-center px-6 text-center text-xs text-text-tertiary">Nenhuma revisao pendente.</div>}
                <div className="border-t border-border px-2 py-3">
                  <h4 className="text-xs font-semibold text-text-secondary">Historico recente</h4>
                  <div className="mt-2 grid gap-2">
                    {recentSessions.map((session) => <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/30 px-3 py-2" key={session.id}>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{session.subject?.name}{session.topic ? ` - ${session.topic.name}` : ""}</p>
                        <p className="text-[10px] text-text-tertiary">{date.format(new Date(session.startedAt))}{session.totalQuestions !== null && session.totalQuestions !== undefined ? ` - ${session.correctQuestions ?? 0}/${session.totalQuestions} acertos` : ""}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold">{formatMinutes(session.durationMinutes)}</span>
                    </div>)}
                    {!recentSessions.length ? <p className="text-xs text-text-tertiary">Nenhuma sessao concluida.</p> : null}
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </div>
      <StudyDialog data={data} mode={dialog} onClose={() => setDialog(null)} />
    </div>}
  </DashboardViewport>;
}
