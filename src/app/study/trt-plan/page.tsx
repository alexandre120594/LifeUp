"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  ListFilter,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import planData from "@/data/trt-study-plan.json";
import type { TrtStudyPlan } from "@/types/trt-study-plan";
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

const plan = planData as TrtStudyPlan;
const PLAN_KEY = "dataprev-perfil3";
const LEGACY_STORAGE_KEY = "lifeup:dataprev-perfil3-plan:completed";
const PLAN_DAY_IDS = new Set(
  plan.weeks.flatMap((week) => week.days.map((day) => day.id))
);
const PLAN_ITEM_IDS = new Set([
  ...PLAN_DAY_IDS,
  ...plan.checklistSections.flatMap((section) =>
    section.groups.flatMap((group) => group.items.map((item) => item.id))
  ),
]);

type PlanView = "schedule" | "checklist" | "audit" | "edital";

function readLegacyCompletedItems() {
  try {
    const value = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];

    return Array.isArray(parsed)
      ? new Set(
          parsed.filter(
            (item): item is string =>
              typeof item === "string" && PLAN_ITEM_IDS.has(item)
          )
        )
      : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export default function TrtStudyPlanPage() {
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(
    new Set([plan.weeks[0]?.id])
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<PlanView>("schedule");
  const migratedLegacyProgress = useRef(false);
  const { data: persistedProgress } = useStudyPlanProgress(PLAN_KEY);
  const { mutate: savePersistedProgress } = useSaveStudyPlanProgress(PLAN_KEY);

  const completedItems = useMemo(
    () =>
      new Set(
        (persistedProgress?.itemIds ?? []).filter((itemId) =>
          PLAN_ITEM_IDS.has(itemId)
        )
      ),
    [persistedProgress]
  );

  useEffect(() => {
    if (!persistedProgress) {
      return;
    }

    if (!migratedLegacyProgress.current && completedItems.size === 0) {
      migratedLegacyProgress.current = true;
      const legacyItems = readLegacyCompletedItems();

      if (legacyItems.size > 0) {
        savePersistedProgress([...legacyItems]);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
  }, [completedItems, persistedProgress, savePersistedProgress]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          plan.weeks.flatMap((week) =>
            week.days.map((day) => day.category).filter(Boolean)
          )
        )
      ).sort(),
    []
  );

  const visibleWeeks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return plan.weeks
      .map((week) => ({
        ...week,
        days: week.days.filter((day) => {
          const matchesCategory =
            category === "all" || day.category === category;
          const searchable = [
            week.title,
            week.subtitle,
            day.category,
            day.title,
            day.schedule,
            day.task,
            ...day.topics,
          ]
            .join(" ")
            .toLocaleLowerCase("pt-BR");

          return (
            matchesCategory &&
            (!normalizedQuery || searchable.includes(normalizedQuery))
          );
        }),
      }))
      .filter((week) => week.days.length > 0);
  }, [category, query]);

  const completedDayCount = [...completedItems].filter((item) =>
    PLAN_DAY_IDS.has(item)
  ).length;
  const progress = Math.round((completedDayCount / plan.stats.days) * 100);
  const completedHours = Math.round(completedDayCount * plan.stats.hoursPerDay);
  const checklistTotal = plan.checklistSections.reduce(
    (sectionTotal, section) =>
      sectionTotal +
      section.groups.reduce(
        (groupTotal, group) => groupTotal + group.items.length,
        0
      ),
    0
  );
  const checklistDone = plan.checklistSections.reduce(
    (sectionTotal, section) =>
      sectionTotal +
      section.groups.reduce(
        (groupTotal, group) =>
          groupTotal +
          group.items.filter((item) => completedItems.has(item.id)).length,
        0
      ),
    0
  );

  function toggleItem(itemId: string) {
    const next = new Set(completedItems);

    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }

    savePersistedProgress([...next]);
  }

  function toggleWeek(weekId: string) {
    setOpenWeeks((current) => {
      const next = new Set(current);

      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }

      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/14 via-card to-accent/20 shadow-sm">
        <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <BookOpenCheck className="h-4 w-4" />
              {plan.subtitle}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {plan.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
              {plan.description}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {plan.headerStats.map((item) => (
                <div
                  className="rounded-xl border border-border/60 bg-background/65 px-3 py-3"
                  key={item.label}
                >
                  <div className="text-xs text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-1 text-xl font-semibold tabular-nums">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/75 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Progresso do cronograma</div>
                <div className="mt-1 text-3xl font-semibold tabular-nums">
                  {progress}%
                </div>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {completedDayCount} / {plan.stats.days} dias
              </span>
              <span>{completedHours}h concluídas</span>
            </div>
            <div className="mt-4 rounded-xl border border-border/60 bg-secondary/25 p-3 text-xs leading-5 text-muted-foreground">
              Checklist: {checklistDone} / {checklistTotal} itens oficiais
              conferidos.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setView("schedule")}
              variant={view === "schedule" ? "default" : "outline"}
            >
              <CalendarDays className="h-4 w-4" />
              Cronograma
            </Button>
            <Button
              onClick={() => setView("checklist")}
              variant={view === "checklist" ? "default" : "outline"}
            >
              <ClipboardCheck className="h-4 w-4" />
              Checklist
            </Button>
            <Button
              onClick={() => setView("audit")}
              variant={view === "audit" ? "default" : "outline"}
            >
              <ShieldCheck className="h-4 w-4" />
              Auditoria
            </Button>
            <Button
              onClick={() => setView("edital")}
              variant={view === "edital" ? "default" : "outline"}
            >
              <FileText className="h-4 w-4" />
              Edital
            </Button>
          </div>

          {view === "schedule" ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar semana, matéria, data ou tópico..."
                  value={query}
                />
              </label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger>
                  <ListFilter className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((item) => (
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
        <>
          <Card className="border-border/70 bg-secondary/20">
            <CardContent className="p-4 text-sm leading-6 text-muted-foreground sm:p-5">
              <span className="font-semibold text-foreground">
                Regra de alternância:
              </span>{" "}
              {plan.structure}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {visibleWeeks.map((week) => {
              const completedInWeek = week.days.filter((day) =>
                completedItems.has(day.id)
              ).length;
              const weekProgress = Math.round(
                (completedInWeek / week.days.length) * 100
              );
              const isOpen =
                openWeeks.has(week.id) || query.trim() !== "" || category !== "all";

              return (
                <Card
                  className="min-w-0 overflow-hidden border-border/70 shadow-sm"
                  key={week.id}
                >
                  <button
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/25 sm:p-5"
                    onClick={() => toggleWeek(week.id)}
                    type="button"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                      {week.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{week.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">
                        {week.subtitle}
                      </span>
                    </span>
                    <Badge className="hidden sm:inline-flex" variant="outline">
                      {week.tag}
                    </Badge>
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
                        const isCompleted = completedItems.has(day.id);

                        return (
                          <article
                            className={cn(
                              "grid min-w-0 content-start gap-3 rounded-xl border border-border/70 bg-background/70 p-4 transition-colors",
                              isCompleted && "bg-primary/5 opacity-70"
                            )}
                            key={day.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Badge variant="secondary">{day.category}</Badge>
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
                                  {day.schedule}
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
                                onClick={() => toggleItem(day.id)}
                                type="button"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                            <ul className="grid gap-1.5">
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
                            <p className="rounded-lg bg-secondary/35 p-3 text-xs leading-5 text-muted-foreground">
                              {day.task}
                            </p>
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
        </>
      ) : null}

      {view === "checklist" ? (
        <div className="grid gap-5">
          {plan.checklistSections.map((section) => (
            <Card className="border-border/70 shadow-sm" key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {section.groups.map((group) => {
                  const done = group.items.filter((item) =>
                    completedItems.has(item.id)
                  ).length;

                  return (
                    <div
                      className="rounded-xl border border-border/70 bg-background/70 p-4"
                      key={group.title}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold">{group.title}</div>
                        <Badge variant="outline">
                          {done}/{group.items.length}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => {
                          const isCompleted = completedItems.has(item.id);

                          return (
                            <button
                              className={cn(
                                "rounded-full border border-border/70 px-3 py-1.5 text-left text-xs leading-5 transition-colors",
                                isCompleted
                                  ? "border-primary bg-primary text-primary-foreground line-through"
                                  : "bg-secondary/30 text-muted-foreground hover:border-primary hover:text-foreground"
                              )}
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              type="button"
                            >
                              {item.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "audit" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Distribuição por bloco</CardTitle>
              <CardDescription>{plan.audit.summary}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {plan.audit.distribution.map((row) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/70 p-3 text-sm"
                  key={row.label}
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {row.label}
                  </span>
                  <Badge>{row.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Pontos de atenção</CardTitle>
              <CardDescription>
                Riscos de profundidade após a cobertura integral.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {plan.audit.notes.map((note) => (
                  <li
                    className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground"
                    key={note}
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === "edital" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plan.editalCards.map((card) => (
            <Card className="border-border/70 shadow-sm" key={card.label}>
              <CardHeader>
                <Badge className="w-fit">{card.label}</Badge>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
