"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronDown, RotateCcw, Search, ShieldCheck, Target } from "lucide-react";
import scheduleData from "@/data/trt-pi-schedule.json";
import { useResetStudyPlanProgress, useStudyPlanProgress, useUpdateStudyPlanProgress } from "@/hooks/useStudyWorkspace";
import { TRT_PI_PLAN_ID, TRT_PI_PLAN_TOTAL_DAYS } from "@/lib/study-plan";
import { cn } from "@/lib/utils";
import type { StudyPlanDay, StudyPlanDayProgress, StudyPlanProgressInput } from "@/types/Study";
import { ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StatusFilter = "all" | "done" | "pending";

const days = scheduleData as StudyPlanDay[];
const phases = ["all", "Base", "Consolidação", "Fechamento"] as const;

function ScheduleDayCard({
  day,
  isOpen,
  onOpenChange,
  onSave,
  progress,
}: {
  day: StudyPlanDay;
  isOpen: boolean;
  onOpenChange: () => void;
  onSave: (progress: Omit<StudyPlanProgressInput, "planId">) => void;
  progress: StudyPlanDayProgress;
}) {
  const [score, setScore] = useState(progress.score === null ? "" : String(progress.score));

  function saveScore() {
    const parsed = score === "" ? null : Number(score);
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0 || parsed > 100)) {
      setScore(progress.score === null ? "" : String(progress.score));
      return;
    }
    if (parsed !== progress.score) onSave({ dayNumber: progress.dayNumber, score: parsed });
  }

  return <article className={cn("overflow-hidden rounded-xl border bg-panel transition-colors", progress.completed ? "border-primary/30" : "border-border", day.checkpoint && "ring-1 ring-primary/25")}>
    <div className="flex items-start gap-3 px-3 py-3 sm:px-4">
      <Checkbox
        aria-label={`${progress.completed ? "Marcar como pendente" : "Marcar como concluído"}: dia ${day.n}`}
        checked={progress.completed}
        className="mt-1 size-5"
        onCheckedChange={(checked) => onSave({ completed: checked === true, dayNumber: progress.dayNumber })}
      />
      <button aria-expanded={isOpen} className="min-w-0 flex-1 text-left" onClick={onOpenChange} type="button">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          <span>Dia {String(day.n).padStart(3, "0")}</span>
          <span>{day.date} · {day.weekday}</span>
          <Badge variant="outline">{day.phase}</Badge>
          {day.checkpoint ? <Badge>Checkpoint 95 dias</Badge> : null}
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">{day.subject}</p>
            <h3 className={cn("mt-0.5 text-sm font-semibold leading-snug", progress.completed && "text-text-secondary line-through")}>{day.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">{day.bullets[0]}</p>
          </div>
          <ChevronDown className={cn("mt-1 size-4 shrink-0 text-text-tertiary transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>
    </div>

    {isOpen ? <div className="grid gap-4 border-t border-border bg-secondary/10 px-3 py-4 sm:px-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <p className="text-xs font-semibold">Meta obrigatória do dia</p>
          <ul className="mt-2 grid gap-1.5">
            {day.bullets.map((bullet) => <li className="flex gap-2 text-xs leading-relaxed text-text-secondary" key={bullet}><span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />{bullet}</li>)}
          </ul>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:max-w-52 sm:justify-end">
          <Badge variant="secondary">{day.tag}</Badge>
          <Badge variant="outline">questões {day.qtarget}</Badge>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-border bg-panel p-3"><strong className="text-xs">05:00–07:00</strong><p className="mt-1 text-[11px] leading-relaxed text-text-secondary"><b>90 min obrigatórios:</b> teoria ativa + exemplos. Os 30 min finais são margem para pausa, revisão ou aprofundamento.</p></div>
        <div className="rounded-lg border border-border bg-panel p-3"><strong className="text-xs">13:30–14:30</strong><p className="mt-1 text-[11px] leading-relaxed text-text-secondary"><b>40 min obrigatórios:</b> {day.qtarget} questões/itens conforme o assunto. 20 min de margem.</p></div>
        <div className="rounded-lg border border-border bg-panel p-3"><strong className="text-xs">20:00–22:00</strong><p className="mt-1 text-[11px] leading-relaxed text-text-secondary"><b>80 min obrigatórios:</b> correção, prática e caderno de erros. 40 min de margem.</p></div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3"><strong className="text-xs text-primary">Se sobrar</strong><p className="mt-1 text-[11px] leading-relaxed text-text-secondary">Feche Anki e erros. Com ≥80%, faça 30–60 min de pré-leitura do próximo dia. Não marque o próximo dia como concluído.</p></div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-panel p-3 sm:flex-row sm:items-center">
        <label className="text-xs font-medium" htmlFor={`score-${day.n}`}>Acertos (%)</label>
        <Input
          className="h-8 w-full sm:w-24"
          id={`score-${day.n}`}
          inputMode="numeric"
          max={100}
          min={0}
          onBlur={saveScore}
          onChange={(event) => setScore(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
          placeholder="0–100"
          type="number"
          value={score}
        />
        <span className="text-[11px] leading-relaxed text-text-tertiary">&lt;70: use a margem para base · 70–79: consolide · ≥80: pode pré-avançar</span>
      </div>
    </div> : null}
  </article>;
}

export function StudySchedule() {
  const query = useStudyPlanProgress(TRT_PI_PLAN_ID);
  const update = useUpdateStudyPlanProgress(TRT_PI_PLAN_ID);
  const reset = useResetStudyPlanProgress(TRT_PI_PLAN_ID);
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<(typeof phases)[number]>("all");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openDay, setOpenDay] = useState(1);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const progressByDay = useMemo(() => new Map((query.data ?? []).map((item) => [item.dayNumber, item])), [query.data]);
  const completed = useMemo(() => days.filter((day) => progressByDay.get(day.n)?.completed).length, [progressByDay]);
  const percentage = Math.round(completed / TRT_PI_PLAN_TOTAL_DAYS * 100);
  const nextDay = days.find((day) => !progressByDay.get(day.n)?.completed) ?? days.at(-1);
  const subjects = useMemo(() => Array.from(new Set(days.map((day) => day.subject))).sort((a, b) => a.localeCompare(b, "pt-BR")), []);
  const visibleDays = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    return days.filter((day) => {
      const item = progressByDay.get(day.n);
      const isDone = item?.completed ?? false;
      const matchesText = !normalized || `${day.subject} ${day.title} ${day.bullets.join(" ")} ${day.tag}`.toLocaleLowerCase("pt-BR").includes(normalized);
      const matchesPhase = phase === "all" || day.phase === phase;
      const matchesSubject = subject === "all" || day.subject === subject;
      const matchesStatus = status === "all" || (status === "done" ? isDone : !isDone);
      return matchesText && matchesPhase && matchesSubject && matchesStatus;
    });
  }, [phase, progressByDay, search, status, subject]);

  function saveProgress(value: Omit<StudyPlanProgressInput, "planId">) {
    update.mutate({ ...value, planId: TRT_PI_PLAN_ID });
  }

  function openNextDay() {
    if (!nextDay) return;
    setOpenDay(nextDay.n);
    setSearch("");
    setPhase("all");
    setSubject("all");
    setStatus("all");
    window.setTimeout(() => document.getElementById(`schedule-day-${nextDay.n}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  async function confirmReset() {
    try {
      setResetError(null);
      await reset.mutateAsync();
      setResetOpen(false);
      setOpenDay(1);
    } catch (cause) {
      setResetError(cause instanceof Error ? cause.message : "Não foi possível zerar o progresso.");
    }
  }

  if (query.isLoading) return <LoadingState className="h-full" title="Carregando seu cronograma" />;
  if (query.isError) return <ErrorState title="Não foi possível carregar o cronograma" description="Seu progresso continua salvo. Tente carregar novamente." action={<RetryButton onClick={() => query.refetch()} />} />;

  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-0.5">
    <section className="grid shrink-0 gap-3 rounded-2xl border border-border bg-panel p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Target className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h2 className="text-sm font-semibold">TRT-PI · Plano realista de 150 dias</h2><span className="flex items-center gap-1 text-[11px] text-text-tertiary"><ShieldCheck className="size-3.5 text-primary" />Progresso salvo na sua conta</span></div>
          <p className="mt-1 text-xs text-text-secondary">14/10/2026 → 12/03/2027 · 3h30–4h obrigatórias por dia · 1h–1h30 de margem</p>
          <div className="mt-3 flex items-center gap-3"><Progress className="h-2 flex-1" value={percentage} /><strong className="text-xs">{completed}/{TRT_PI_PLAN_TOTAL_DAYS}</strong><span className="text-xs text-text-tertiary">{percentage}%</span></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {nextDay ? <Button size="sm" variant="outline" onClick={openNextDay}><CalendarDays className="size-4" />Próximo: dia {nextDay.n}</Button> : null}
        <Button aria-label="Zerar progresso" size="icon-sm" title="Zerar progresso" variant="ghost" onClick={() => setResetOpen(true)}><RotateCcw className="size-4" /></Button>
      </div>
    </section>

    <section className="grid shrink-0 gap-2 rounded-xl border border-border bg-panel p-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_230px_150px]">
      <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" /><Input aria-label="Buscar no cronograma" className="pl-9" placeholder="Buscar matéria, assunto ou tópico" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <Select value={phase} onValueChange={(value) => setPhase(value as (typeof phases)[number])}><SelectTrigger aria-label="Filtrar por fase"><SelectValue /></SelectTrigger><SelectContent>{phases.map((value) => <SelectItem key={value} value={value}>{value === "all" ? "Todas as fases" : value}</SelectItem>)}</SelectContent></Select>
      <Select value={subject} onValueChange={setSubject}><SelectTrigger aria-label="Filtrar por matéria"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as matérias</SelectItem>{subjects.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}><SelectTrigger aria-label="Filtrar por situação"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pending">Pendentes</SelectItem><SelectItem value="done">Concluídos</SelectItem></SelectContent></Select>
    </section>

    {update.isError ? <p className="shrink-0 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">{update.error.message}</p> : null}
    <div className="grid gap-2 pb-1">
      {visibleDays.map((day) => {
        const item = progressByDay.get(day.n) ?? { completed: false, dayNumber: day.n, score: null };
        return <div id={`schedule-day-${day.n}`} key={day.n}><ScheduleDayCard key={`${day.n}-${item.score ?? "empty"}`} day={day} isOpen={openDay === day.n} progress={item} onOpenChange={() => setOpenDay((current) => current === day.n ? 0 : day.n)} onSave={saveProgress} /></div>;
      })}
      {!visibleDays.length ? <div className="rounded-xl border border-dashed border-border bg-panel p-8 text-center"><CheckCircle2 className="mx-auto size-5 text-primary" /><p className="mt-2 text-sm font-medium">Nenhum dia encontrado</p><p className="mt-1 text-xs text-text-tertiary">Ajuste os filtros para voltar ao cronograma.</p></div> : null}
    </div>

    <ConfirmDialog open={resetOpen} onOpenChange={(open) => { if (!reset.isPending) { setResetOpen(open); setResetError(null); } }} title="Zerar o progresso do cronograma?" description="As marcações e percentuais de acerto dos 150 dias serão apagados da sua conta. Esta ação não pode ser desfeita." confirmLabel={reset.isPending ? "Zerando..." : "Zerar progresso"} isPending={reset.isPending} error={resetError} onConfirm={confirmReset} />
  </div>;
}
