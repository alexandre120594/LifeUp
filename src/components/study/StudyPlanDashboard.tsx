"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronDown, Circle, Clock3, ListFilter, RotateCcw, Search, Target } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type PlanCard = { id: string; meta: string; subject: string; title: string; tone: string; topics: string[] };
type PlanWeek = { cards: PlanCard[]; description: string; id: string; label: string };
type PlanTrack = { description: string; id: string; label: string; salary?: string; title?: string; weeks: PlanWeek[] };
export type StudyPlan = { description: string; eyebrow: string; id: string; label: string; stats: [string, string][]; title: string; tracks: PlanTrack[] };
type PlanView = "checklist" | "details";

const toneClass: Record<string, string> = {
  "c-bd": "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "c-dados": "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "c-dev": "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "c-gov": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "c-ia": "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  "c-infra": "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "c-ing": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "c-leg": "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "c-port": "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "c-redes": "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "c-rlm": "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "c-sec": "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function storageKey(planId: string) {
  return `lifeup:study-plan:${planId}:completed`;
}

export function StudyPlanDashboard({ embedded = false, plan }: { embedded?: boolean; plan: StudyPlan }) {
  const [trackId, setTrackId] = useState(plan.tracks[0]?.id ?? "");
  const [openWeekId, setOpenWeekId] = useState(plan.tracks[0]?.weeks[0]?.id ?? "");
  const [completed, setCompleted] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "done">("all");
  const [view, setView] = useState<PlanView>("checklist");
  const track = plan.tracks.find((item) => item.id === trackId) ?? plan.tracks[0];

  useEffect(() => {
    let timeoutId: number | undefined;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey(plan.id)) ?? "[]");
      if (Array.isArray(stored) && stored.every((item) => typeof item === "string")) {
        timeoutId = window.setTimeout(() => setCompleted(stored), 0);
      }
    } catch {
      localStorage.removeItem(storageKey(plan.id));
    }
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [plan.id]);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const totalCards = track?.weeks.reduce((total, week) => total + week.cards.length, 0) ?? 0;
  const completedCards = track?.weeks.reduce((total, week) => total + week.cards.filter((card) => completedSet.has(card.id)).length, 0) ?? 0;
  const progress = totalCards ? Math.round((completedCards / totalCards) * 100) : 0;
  const visibleWeeks = track?.weeks.map((week) => ({
    ...week,
    cards: week.cards.filter((card) => {
      const normalizedQuery = query.trim().toLocaleLowerCase();
      const matchesQuery = !normalizedQuery || `${card.subject} ${card.title} ${card.topics.join(" ")}`.toLocaleLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" || (status === "done" ? completedSet.has(card.id) : !completedSet.has(card.id));
      return matchesQuery && matchesStatus;
    }),
  })).filter((week) => week.cards.length > 0) ?? [];
  const visibleCards = visibleWeeks.flatMap((week) => week.cards);
  const subjectGroups = Array.from(visibleCards.reduce((groups, card) => {
    const cards = groups.get(card.subject) ?? [];
    cards.push(card);
    groups.set(card.subject, cards);
    return groups;
  }, new Map<string, PlanCard[]>())).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));

  function changeTrack(value: string) {
    const nextTrack = plan.tracks.find((item) => item.id === value);
    setTrackId(value);
    setOpenWeekId(nextTrack?.weeks[0]?.id ?? "");
  }

  function toggleCard(cardId: string) {
    setCompleted((current) => {
      const next = current.includes(cardId) ? current.filter((item) => item !== cardId) : [...current, cardId];
      localStorage.setItem(storageKey(plan.id), JSON.stringify(next));
      return next;
    });
  }

  function resetPlan() {
    if (!window.confirm("Limpar o progresso deste plano?")) return;
    setCompleted([]);
    localStorage.removeItem(storageKey(plan.id));
  }

  if (!track) return null;

  const content = <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 md:gap-4">
      <section className="flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-panel px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Target className="size-4" /></span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{plan.label}</p><p className="truncate text-[11px] text-text-tertiary">{track.label}{track.title || track.salary ? ` · ${track.title ?? track.salary}` : ""}</p></div>
        </div>
        <div className="grid grid-cols-4 divide-x divide-border rounded-lg border border-border bg-secondary/20 sm:w-auto">
          {plan.stats.map(([value, label]) => <div className="min-w-[58px] px-2 py-1.5 text-center" key={label}><strong className="block truncate text-xs text-foreground">{value}</strong><span className="mt-0.5 block truncate text-[8px] font-medium uppercase tracking-[0.06em] text-text-tertiary">{label}</span></div>)}
        </div>
      </section>

      <section className="grid min-h-0 gap-3 md:grid-cols-[minmax(0,1fr)_260px] md:gap-4">
        <article className="flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-border bg-panel">
          <header className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {plan.tracks.length > 1 ? <SegmentedControl aria-label="Trilha do plano" className="max-w-full" onValueChange={changeTrack} options={plan.tracks.map((item) => ({ label: item.label, value: item.id }))} value={trackId} /> : <div><h3 className="text-sm font-semibold">{track.label}</h3><p className="mt-1 text-[11px] text-text-tertiary">{track.description}</p></div>}
              <span className="shrink-0 text-xs font-semibold text-text-secondary">{completedCards}/{totalCards} concluídos</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" /><Input aria-label="Buscar no plano" className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar matéria, tema ou tópico" value={query} /></label>
              <div className="flex shrink-0 gap-1 rounded-lg border border-border bg-secondary/25 p-1">
                {([["all", "Todos"], ["pending", "Pendentes"], ["done", "Concluídos"]] as const).map(([value, label]) => <button className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium", status === value ? "bg-panel text-foreground shadow-sm" : "text-text-tertiary hover:text-foreground")} key={value} onClick={() => setStatus(value)} type="button">{label}</button>)}
              </div>
              <Button aria-label="Limpar progresso" className="shrink-0" onClick={resetPlan} size="icon" title="Limpar progresso" variant="outline"><RotateCcw className="size-4" /></Button>
            </div>
            <SegmentedControl aria-label="Visualização do plano" className="w-fit" onValueChange={(value) => setView(value as PlanView)} options={[{ label: "Checklist", value: "checklist" }, { label: "Detalhes", value: "details" }]} value={view} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
            {view === "checklist" ? <PlanChecklist groups={subjectGroups} completedSet={completedSet} onToggle={toggleCard} /> : <div className="grid gap-2">
              {visibleWeeks.map((week) => {
                const isOpen = week.id === openWeekId;
                const completedWeek = week.cards.filter((card) => completedSet.has(card.id)).length;
                return <section className="overflow-hidden rounded-xl border border-border" key={week.id}>
                  <button aria-expanded={isOpen} className="flex w-full items-center gap-3 bg-secondary/20 px-3 py-3 text-left hover:bg-hover" onClick={() => setOpenWeekId(isOpen ? "" : week.id)} type="button">
                    {/* <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{week.label.replace("Semana ", "")}</span> */}
                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-foreground">{week.label}</strong><small className="mt-0.5 block truncate text-[11px] text-text-tertiary">{week.description}</small></span>
                    <span className="text-[11px] font-semibold text-text-tertiary">{completedWeek}/{week.cards.length}</span><ChevronDown className={cn("size-4 shrink-0 text-text-tertiary transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen ? <div className="grid gap-2 border-t border-border p-2">{week.cards.map((card) => <PlanCardItem card={card} completed={completedSet.has(card.id)} key={card.id} onToggle={() => toggleCard(card.id)} />)}</div> : null}
                </section>;
              })}
              {!visibleWeeks.length ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-tertiary">Nenhum item encontrado com estes filtros.</p> : null}
            </div>}
          </div>
        </article>

        <aside className="hidden min-h-0 flex-col rounded-[18px] border border-border bg-panel p-4 md:flex">
          <div className="flex items-center gap-2 text-sm font-semibold"><ListFilter className="size-4 text-primary" />Progresso da trilha</div>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">{track.description}</p>
          <div className="mt-5"><div className="flex items-baseline justify-between"><strong className="text-3xl text-foreground">{progress}%</strong><span className="text-xs text-text-tertiary">concluído</span></div><Progress className="mt-2" value={progress} /></div>
          <div className="mt-6 border-t border-border pt-4"><div className="flex items-center gap-2 text-xs font-semibold text-text-secondary"><CalendarDays className="size-4" />Como usar</div><p className="mt-2 text-xs leading-relaxed text-text-tertiary">Abra uma semana, conclua cada dia estudado e acompanhe o avanço diretamente aqui.</p></div>
          <div className="mt-auto flex items-center gap-2 border-t border-border pt-4 text-xs text-text-tertiary"><Clock3 className="size-4" />O plano permanece disponível na sua rotina.</div>
        </aside>
      </section>
    </div>;

  if (embedded) return content;
  return <DashboardViewport contentClassName="overflow-hidden pb-4" header={<MenuPageHeader eyebrow={plan.eyebrow} title={plan.label} action={<Button asChild size="sm" variant="ghost"><Link href="/study"><ArrowLeft className="size-4" />Voltar aos estudos</Link></Button>} />}>{content}</DashboardViewport>;
}

export function StudyPlansWorkspace({ plans }: { plans: StudyPlan[] }) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const plan = plans.find((item) => item.id === planId) ?? plans[0];
  if (!plan) return null;
  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
    <section className="shrink-0 rounded-2xl border border-border bg-panel p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-sm font-semibold">Planos de estudo</h2><p className="mt-1 text-[11px] text-text-tertiary">Escolha um ID para abrir o roteiro completo, marcar dias e acompanhar seu avanço.</p></div>
        <SegmentedControl aria-label="ID do plano de estudo" className="max-w-full" onValueChange={setPlanId} options={plans.map((item) => ({ label: `${item.label} · ${item.id}`, value: item.id }))} value={planId} />
      </div>
    </section>
    <div className="min-h-0 flex-1"><StudyPlanDashboard embedded key={plan.id} plan={plan} /></div>
  </div>;
}

function PlanCardItem({ card, completed, onToggle }: { card: PlanCard; completed: boolean; onToggle: () => void }) {
  return <article className={cn("rounded-lg border border-border bg-background/50 p-3 transition-opacity", completed && "opacity-55")}>
    <div className="flex items-start gap-3">
      <button aria-label={`${completed ? "Marcar como pendente" : "Marcar como concluído"}: ${card.title}`} className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-colors", completed ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent hover:border-primary")} onClick={onToggle} type="button">{completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}</button>
      <div className="min-w-0 flex-1"><Badge className={cn("border text-[9px]", toneClass[card.tone] ?? "border-border bg-secondary text-text-secondary")} variant="outline">{card.subject}</Badge><h4 className={cn("mt-2 text-sm font-semibold leading-snug text-foreground", completed && "line-through")}>{card.title}</h4><p className="mt-1 text-[11px] text-text-tertiary">{card.meta}</p>
        <ul className="mt-3 grid gap-1.5 border-t border-border pt-3">{card.topics.map((topic) => <li className="flex gap-2 text-xs leading-relaxed text-text-secondary" key={topic}><span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/70" />{topic}</li>)}</ul>
      </div>
    </div>
  </article>;
}

function PlanChecklist({ groups, completedSet, onToggle }: { groups: [string, PlanCard[]][]; completedSet: Set<string>; onToggle: (cardId: string) => void }) {
  if (!groups.length) return <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-tertiary">Nenhum item encontrado com estes filtros.</p>;
  return <div className="grid gap-3">
    {groups.map(([subject, cards]) => {
      const done = cards.filter((card) => completedSet.has(card.id)).length;
      return <section className="overflow-hidden rounded-xl border border-border" key={subject}>
        <header className="border-b border-border bg-secondary/20 px-3 py-3">
          <div className="flex items-center justify-between gap-3"><h4 className="truncate text-sm font-semibold">{subject}</h4><span className="shrink-0 text-xs font-semibold text-text-tertiary">{done}/{cards.length}</span></div>
          <Progress className="mt-2 h-1.5" value={cards.length ? done / cards.length * 100 : 0} />
        </header>
        <div className="divide-y divide-border">
          {cards.map((card) => {
            const completed = completedSet.has(card.id);
            return <button aria-pressed={completed} className={cn("flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-hover", completed && "bg-primary/5")} key={card.id} onClick={() => onToggle(card.id)} type="button">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", completed ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}><CheckCircle2 className="size-3.5" /></span>
              <span className={cn("min-w-0 flex-1", completed && "opacity-60")}><span className={cn("block text-sm font-medium leading-snug", completed && "line-through")}>{card.title}</span><span className="mt-1 block truncate text-[11px] text-text-tertiary">{card.meta}</span></span>
            </button>;
          })}
        </div>
      </section>;
    })}
  </div>;
}
