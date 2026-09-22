"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronDown, Circle, Clock3, ListFilter, Target } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type PlanCard = { id: string; meta: string; subject: string; title: string; tone: string; topics: string[] };
type PlanWeek = { cards: PlanCard[]; description: string; id: string; label: string };
type PlanTrack = { description: string; id: string; label: string; salary?: string; title?: string; weeks: PlanWeek[] };
export type StudyPlan = { description: string; eyebrow: string; id: string; label: string; stats: [string, string][]; title: string; tracks: PlanTrack[] };

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

export function StudyPlanDashboard({ plan }: { plan: StudyPlan }) {
  const [trackId, setTrackId] = useState(plan.tracks[0]?.id ?? "");
  const [openWeekId, setOpenWeekId] = useState(plan.tracks[0]?.weeks[0]?.id ?? "");
  const [completed, setCompleted] = useState<string[]>([]);
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

  if (!track) return null;

  return <DashboardViewport contentClassName="overflow-hidden pb-4" header={<MenuPageHeader eyebrow={plan.eyebrow} title={plan.label} action={<Button asChild size="sm" variant="ghost"><Link href="/study"><ArrowLeft className="size-4" />Voltar aos estudos</Link></Button>} />}>
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 md:gap-4">
      <section className="grid shrink-0 gap-4 rounded-[18px] border border-border bg-panel p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"><Target className="size-4" />Plano de estudo</div>
          <h2 className="mt-2 text-xl font-bold leading-tight text-foreground md:text-2xl">{plan.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-text-secondary">{plan.description}</p>
          {track.title || track.salary ? <p className="mt-3 text-xs text-text-tertiary">{track.title ?? track.salary}</p> : null}
        </div>
        <div className="grid grid-cols-4 divide-x divide-border rounded-lg border border-border bg-secondary/25">
          {plan.stats.map(([value, label]) => <div className="min-w-0 px-2 py-2.5 text-center" key={label}><strong className="block truncate text-sm text-foreground md:text-base">{value}</strong><span className="mt-0.5 block truncate text-[9px] font-medium uppercase tracking-[0.08em] text-text-tertiary">{label}</span></div>)}
        </div>
      </section>

      <section className="grid min-h-0 gap-3 md:grid-cols-[minmax(0,1fr)_260px] md:gap-4">
        <article className="flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-border bg-panel">
          <header className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            {plan.tracks.length > 1 ? <SegmentedControl aria-label="Trilha do plano" className="max-w-full" onValueChange={changeTrack} options={plan.tracks.map((item) => ({ label: item.label, value: item.id }))} value={trackId} /> : <div><h3 className="text-sm font-semibold">{track.label}</h3><p className="mt-1 text-[11px] text-text-tertiary">{track.description}</p></div>}
            <span className="shrink-0 text-xs font-semibold text-text-secondary">{completedCards}/{totalCards} concluídos</span>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
            <div className="grid gap-2">
              {track.weeks.map((week) => {
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
            </div>
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
    </div>
  </DashboardViewport>;
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
