"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  Check,
  ChevronDown,
  Clock3,
  Layers3,
  ListFilter,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import planData from "@/data/trt-audit-study-plan.json";
import type {
  TrtAuditStudyDay,
  TrtAuditStudyPlan,
  TrtAuditStudyTrack,
} from "@/types/trt-audit-study-plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSaveStudyPlanProgress,
  useStudyPlanProgress,
} from "@/hooks/useStudyMutations";
import { cn } from "@/lib/utils";

const plan = planData as TrtAuditStudyPlan;
const PLAN_KEY = "trt-audit";
const LEGACY_STORAGE_KEY = "lifeup:trt-audit-study-plan:completed";
const PLAN_DAY_IDS = new Set(
  plan.tracks.flatMap((track) =>
    track.data.map((day) => `${track.id}:${day.day}`)
  )
);

type DetailView = "schedule" | "audit" | "usage";

const matterToneByClass: Record<string, string> = {
  "c-portugues": "border-sky-200 bg-sky-100 text-sky-900",
  "c-redes": "border-emerald-200 bg-emerald-100 text-emerald-900",
  "c-direito": "border-rose-200 bg-rose-100 text-rose-900",
  "c-infra": "border-amber-200 bg-amber-100 text-amber-950",
  "c-seguranca": "border-red-200 bg-red-100 text-red-900",
  "c-bd": "border-teal-200 bg-teal-100 text-teal-900",
  "c-dev": "border-blue-200 bg-blue-100 text-blue-900",
  "c-gov": "border-yellow-200 bg-yellow-100 text-yellow-950",
  "c-cnj": "border-violet-200 bg-violet-100 text-violet-900",
  "c-cloud": "border-indigo-200 bg-indigo-100 text-indigo-900",
  "c-dados": "border-pink-200 bg-pink-100 text-pink-900",
  "c-ingles": "border-cyan-200 bg-cyan-100 text-cyan-900",
  "c-rlm": "border-orange-200 bg-orange-100 text-orange-950",
};

function readLegacyCompletedDays() {
  try {
    const value = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];

    return Array.isArray(parsed)
      ? new Set(
          parsed.filter(
            (item): item is string =>
              typeof item === "string" && PLAN_DAY_IDS.has(item)
          )
        )
      : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function getTrackDayId(trackId: string, day: number) {
  return `${trackId}:${day}`;
}

function getReviewTitle(days: TrtAuditStudyDay[], day: number, offset: number) {
  return (
    days.find((item) => item.day === day - offset)?.sourceTitle ??
    "Ainda não há card anterior suficiente."
  );
}

function buildWeeks(days: TrtAuditStudyDay[]) {
  const weeks = new Map<number, TrtAuditStudyDay[]>();

  days.forEach((day) => {
    const current = weeks.get(day.week) ?? [];
    current.push(day);
    weeks.set(day.week, current);
  });

  return Array.from(weeks.entries()).map(([week, weekDays]) => ({
    week,
    matters: Array.from(new Set(weekDays.map((day) => day.matter))).join(" · "),
    days: weekDays,
  }));
}

function TrackSummary({
  completedDays,
  track,
}: {
  completedDays: Set<string>;
  track: TrtAuditStudyTrack;
}) {
  const completed = track.data.filter((day) =>
    completedDays.has(getTrackDayId(track.id, day.day))
  ).length;
  const progress = Math.round((completed / track.days) * 100);

  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold">{track.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {track.days} dias · {track.weeks} semanas · {track.hours}h
          </div>
        </div>
        <span className="shrink-0 text-lg font-semibold tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {completed} / {track.days} concluídos
      </div>
    </div>
  );
}

export default function TrtAuditStudyPlanPage() {
  const [activeTrackId, setActiveTrackId] = useState(plan.tracks[0]?.id ?? "");
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));
  const [query, setQuery] = useState("");
  const [matter, setMatter] = useState("all");
  const [view, setView] = useState<DetailView>("schedule");
  const migratedLegacyProgress = useRef(false);
  const { data: persistedProgress } = useStudyPlanProgress(PLAN_KEY);
  const { mutate: savePersistedProgress } = useSaveStudyPlanProgress(PLAN_KEY);

  const completedDays = useMemo(
    () =>
      new Set(
        (persistedProgress?.itemIds ?? []).filter((itemId) =>
          PLAN_DAY_IDS.has(itemId)
        )
      ),
    [persistedProgress]
  );

  useEffect(() => {
    if (!persistedProgress) {
      return;
    }

    if (!migratedLegacyProgress.current && completedDays.size === 0) {
      migratedLegacyProgress.current = true;
      const legacyItems = readLegacyCompletedDays();

      if (legacyItems.size > 0) {
        savePersistedProgress([...legacyItems]);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
  }, [completedDays, persistedProgress, savePersistedProgress]);

  const activeTrack = useMemo(
    () =>
      plan.tracks.find((track) => track.id === activeTrackId) ?? plan.tracks[0],
    [activeTrackId]
  );

  const matters = useMemo(
    () =>
      Array.from(new Set(activeTrack.data.map((day) => day.matter))).sort(
        (a, b) => a.localeCompare(b, "pt-BR")
      ),
    [activeTrack]
  );

  const visibleDays = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return activeTrack.data.filter((day) => {
      const matchesMatter = matter === "all" || day.matter === matter;
      const searchable = [
        day.matter,
        day.title,
        day.sourceTitle,
        day.dow,
        ...day.topics,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return (
        matchesMatter &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });
  }, [activeTrack, matter, query]);

  const visibleWeeks = useMemo(() => buildWeeks(visibleDays), [visibleDays]);
  const totalCompleted = completedDays.size;
  const totalProgress = Math.round(
    (totalCompleted / plan.stats.uniqueDays) * 100
  );

  function toggleTrack(trackId: string) {
    setActiveTrackId(trackId);
    setMatter("all");
    setQuery("");
    setOpenWeeks(new Set([1]));
  }

  function toggleDay(day: TrtAuditStudyDay) {
    const dayId = getTrackDayId(activeTrack.id, day.day);

    const next = new Set(completedDays);

    if (next.has(dayId)) {
      next.delete(dayId);
    } else {
      next.add(dayId);
    }

    savePersistedProgress([...next]);
  }

  function toggleWeek(week: number) {
    setOpenWeeks((current) => {
      const next = new Set(current);

      if (next.has(week)) {
        next.delete(week);
      } else {
        next.add(week);
      }

      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/14 via-card to-accent/20 shadow-sm">
        <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              {plan.subtitle}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {plan.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
              {plan.description}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Base", `${plan.stats.baseWeeks} sem.`],
                ["Analista", `${plan.stats.analystDays} dias`],
                ["Técnico", `${plan.stats.technicianDays} dias`],
                ["Tópicos/dia", plan.stats.topicsPerDay],
                ["Revisão", "D+1/D+7/D+21"],
              ].map(([label, value]) => (
                <div
                  className="rounded-xl border border-border/60 bg-background/65 px-3 py-3"
                  key={label}
                >
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/75 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Progresso geral</div>
                <div className="mt-1 text-3xl font-semibold tabular-nums">
                  {totalProgress}%
                </div>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {totalCompleted} / {plan.stats.uniqueDays} dias únicos
              </span>
              <span>{totalCompleted * plan.stats.hoursPerDay}h concluídas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 lg:grid-cols-3">
        {plan.tracks.map((track) => (
          <button
            className={cn(
              "rounded-2xl border border-border/70 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/50",
              activeTrack.id === track.id && "border-primary bg-primary/5"
            )}
            key={track.id}
            onClick={() => toggleTrack(track.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{track.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {track.days} dias · {track.weeks} semanas · {track.hours}h
                </div>
              </div>
              <Layers3 className="h-5 w-5 shrink-0 text-primary" />
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {track.subtitle}
            </p>
          </button>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {plan.tracks.map((track) => (
          <TrackSummary
            completedDays={completedDays}
            key={track.id}
            track={track}
          />
        ))}
      </section>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setView("schedule")}
              variant={view === "schedule" ? "default" : "outline"}
            >
              Cronograma
            </Button>
            <Button
              onClick={() => setView("audit")}
              variant={view === "audit" ? "default" : "outline"}
            >
              Auditoria
            </Button>
            <Button
              onClick={() => setView("usage")}
              variant={view === "usage" ? "default" : "outline"}
            >
              Uso
            </Button>
          </div>

          {view === "schedule" ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar matéria, tópico ou revisão..."
                  value={query}
                />
              </label>
              <Select onValueChange={setMatter} value={matter}>
                <SelectTrigger>
                  <ListFilter className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as matérias</SelectItem>
                  {matters.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {view === "schedule" ? (
        <div className="grid gap-4">
          <Card className="border-border/70 bg-secondary/20">
            <CardContent className="p-4 text-sm leading-6 text-muted-foreground sm:p-5">
              <span className="font-semibold text-foreground">
                {activeTrack.title}:
              </span>{" "}
              {activeTrack.salary} {activeTrack.subtitle}
            </CardContent>
          </Card>

          {visibleWeeks.map((week) => {
            const completedInWeek = week.days.filter((day) =>
              completedDays.has(getTrackDayId(activeTrack.id, day.day))
            ).length;
            const weekProgress = Math.round(
              (completedInWeek / week.days.length) * 100
            );
            const isOpen =
              openWeeks.has(week.week) ||
              query.trim() !== "" ||
              matter !== "all";

            return (
              <Card
                className="min-w-0 overflow-hidden border-border/70 shadow-sm"
                key={week.week}
              >
                <button
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/25 sm:p-5"
                  onClick={() => toggleWeek(week.week)}
                  type="button"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    {week.week}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {activeTrack.label} — Semana {week.week}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground sm:text-sm">
                      {week.matters}
                    </span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground md:inline">
                    {completedInWeek}/{week.days.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div className="h-1 bg-secondary">
                  <div
                    className="h-full bg-primary transition-[width]"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>

                {isOpen ? (
                  <CardContent className="grid gap-3 border-t border-border/60 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                    {week.days.map((day) => {
                      const dayId = getTrackDayId(activeTrack.id, day.day);
                      const isCompleted = completedDays.has(dayId);

                      return (
                        <article
                          className={cn(
                            "grid min-w-0 content-start gap-3 rounded-xl border border-border/70 bg-background/70 p-4 transition-colors",
                            isCompleted && "bg-primary/5 opacity-70"
                          )}
                          key={dayId}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Badge
                                className={cn(
                                  "border text-[10px] uppercase tracking-wide",
                                  matterToneByClass[day.cls ?? ""] ??
                                    "border-border bg-secondary text-secondary-foreground"
                                )}
                              >
                                {day.matter}
                              </Badge>
                              <h2
                                className={cn(
                                  "mt-2 text-sm font-semibold leading-5",
                                  isCompleted && "line-through"
                                )}
                              >
                                {day.title}
                              </h2>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock3 className="h-3.5 w-3.5" />
                                {day.dow} · Semana {day.week} · 3h
                              </div>
                            </div>
                            <button
                              aria-label={
                                isCompleted
                                  ? `Marcar ${day.title} como pendente`
                                  : `Concluir ${day.title}`
                              }
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                                isCompleted
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:border-primary hover:text-primary"
                              )}
                              onClick={() => toggleDay(day)}
                              type="button"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Assunto novo
                            </div>
                            <ul className="mt-2 grid gap-1.5">
                              {day.topics.map((topic) => (
                                <li
                                  className="flex gap-2 text-xs leading-5 text-muted-foreground"
                                  key={topic}
                                >
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-lg border border-border/60 bg-secondary/25 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Repetição espaçada
                            </div>
                            <div className="mt-2 grid gap-1.5 text-xs leading-5 text-muted-foreground">
                              {[
                                ["D+1", 1],
                                ["D+7", 7],
                                ["D+21", 21],
                              ].map(([label, offset]) => (
                                <p key={label}>
                                  <span className="font-semibold text-foreground">
                                    {label}:
                                  </span>{" "}
                                  {getReviewTitle(
                                    activeTrack.data,
                                    day.day,
                                    Number(offset)
                                  )}
                                </p>
                              ))}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </CardContent>
                ) : null}
              </Card>
            );
          })}

          {!visibleWeeks.length ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhum dia do plano corresponde aos filtros selecionados.
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {view === "audit" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Verificações 2017-2025</CardTitle>
              <CardDescription>
                Editais e provas usados para reforçar a cobertura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {plan.verification.items.map((item) => (
                  <li
                    className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground"
                    key={item}
                  >
                    <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Complementos adicionados</CardTitle>
              <CardDescription>
                Lacunas cobertas depois da auditoria do plano.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {plan.additions.items.map((item) => (
                  <li
                    className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground"
                    key={item}
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === "usage" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Como usar a separação</CardTitle>
              <CardDescription>
                Sequência de execução para cada cargo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {plan.usage.paragraphs.map((paragraph) => (
                <p
                  className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Observação</CardTitle>
              <CardDescription>
                Ajuste final dependente do TRT escolhido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                {plan.note}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
