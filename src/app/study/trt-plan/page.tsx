"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Check,
  ChevronDown,
  Clock3,
  ListFilter,
  Search,
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
import { cn } from "@/lib/utils";

const plan = planData as TrtStudyPlan;
const STORAGE_KEY = "lifeup:trt-study-plan:completed";
const PLAN_DAY_IDS = new Set(
  plan.weeks.flatMap((week) => week.days.map((day) => day.id))
);
type PlanView = "schedule" | "subjects" | "references";

function readCompletedDays() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
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

export default function TrtStudyPlanPage() {
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(
    new Set([plan.weeks[0]?.id])
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<PlanView>("schedule");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCompletedDays(readCompletedDays());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

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
            week.tag,
            day.category,
            day.title,
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

  const completedCount = completedDays.size;
  const progress = Math.round((completedCount / plan.stats.days) * 100);
  const completedHours = completedCount * plan.stats.hoursPerDay;

  function toggleDay(dayId: string) {
    setCompletedDays((current) => {
      const next = new Set(current);

      if (next.has(dayId)) {
        next.delete(dayId);
      } else {
        next.add(dayId);
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
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
              Concurso público · Poder Judiciário · TI
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {plan.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base">
              {plan.description}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Semanas", plan.stats.weeks],
                ["Dias de estudo", plan.stats.days],
                ["Carga total", `${plan.stats.totalHours}h`],
                ["Por dia", `${plan.stats.hoursPerDay}h`],
              ].map(([label, value]) => (
                <div
                  className="rounded-xl border border-border/60 bg-background/65 px-3 py-3"
                  key={label}
                >
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="mt-1 text-xl font-semibold tabular-nums">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/75 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Progresso total</div>
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
                {completedCount} / {plan.stats.days} dias
              </span>
              <span>{completedHours}h concluídas</span>
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
              Cronograma
            </Button>
            <Button
              onClick={() => setView("subjects")}
              variant={view === "subjects" ? "default" : "outline"}
            >
              Mapa de matérias
            </Button>
            <Button
              onClick={() => setView("references")}
              variant={view === "references" ? "default" : "outline"}
            >
              Fontes
            </Button>
          </div>

          {view === "schedule" ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar semana, matéria ou tópico..."
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
                Estrutura de uso:
              </span>{" "}
              {plan.structure}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {visibleWeeks.map((week) => {
              const completedInWeek = week.days.filter((day) =>
                completedDays.has(day.id)
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
                        const isCompleted = completedDays.has(day.id);

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
                                onClick={() => toggleDay(day.id)}
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

      {view === "subjects" ? (
        <div className="grid gap-5">
          {plan.subjectGroups.map((group) => (
            <Card className="border-border/70 shadow-sm" key={group.title}>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>
                  Conteúdos cobertos pelo cronograma de 19 semanas.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <div
                    className="rounded-xl border border-border/70 bg-background/70 p-4"
                    key={item.title}
                  >
                    <div className="font-semibold">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "references" ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Fontes e referências de cobertura</CardTitle>
            <CardDescription>
              Use sempre o edital publicado do TRT-alvo como fonte final.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              {plan.references.map((reference) => (
                <li
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground"
                  key={reference}
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{reference}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
