"use client";

import {
  BarChart3,
  Check,
  Gauge,
  PiggyBank,
  Target,
  Trophy,
} from "lucide-react";
import { HabitStreak } from "@/components/habits/habit-streak";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  getHabitWeekSummaries,
  getScheduleLabel,
  type HabitMetrics,
} from "@/lib/life-habits";
import type { LifeHabit } from "@/types/BaseInterfaces";

export function HabitDetailsDialog({
  habit,
  metrics,
  onEdit,
  onOpenChange,
  todayKey,
}: {
  habit: LifeHabit;
  metrics: HabitMetrics;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  todayKey: string;
}) {
  const weeks = getHabitWeekSummaries(habit, todayKey);
  const kind =
    habit.kind === "negative"
      ? "Evitar"
      : habit.kind === "quantitative"
        ? "Quantidade"
        : "Normal";
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <Badge variant="outline">{kind}</Badge>
            {habit.category ? (
              <Badge variant="secondary">{habit.category}</Badge>
            ) : null}
          </div>
          <DialogTitle>{habit.title}</DialogTitle>
          <DialogDescription>
            {habit.notes || getScheduleLabel(habit)}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-panel-subtle p-4">
              <HabitStreak streak={metrics.currentStreak} />
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-panel-subtle p-3">
              <Metric
                icon={<Trophy />}
                label="Recorde"
                value={String(metrics.bestStreak)}
              />
              <Metric
                icon={<Gauge />}
                label="Força"
                value={`${metrics.consistency}%`}
              />
              <Metric
                icon={<Check />}
                label="Registros"
                value={String(metrics.totalCompletions)}
              />
            </div>
          </section>
          <section className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="size-4 text-primary" />
                Últimas quatro semanas
              </h3>
              <span className="text-xs text-text-secondary">
                {metrics.completionRate}%
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {weeks.map((week) => (
                <div className="grid gap-1.5" key={week.label}>
                  <div className="flex justify-between text-xs">
                    <span>{week.label}</span>
                    <span className="text-text-secondary">
                      {week.completedDays}/{week.availableDays}
                      {week.relapseCount
                        ? ` · ${week.relapseCount} recaída(s)`
                        : ""}
                    </span>
                  </div>
                  <Progress value={week.rate} />
                </div>
              ))}
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <Info
              icon={<Target />}
              label="Agenda"
              value={getScheduleLabel(habit)}
            />
            {habit.kind === "quantitative" ? (
              <Info
                icon={<Check />}
                label="Meta diária"
                value={`${habit.perDayTarget} ${habit.unitLabel ?? ""}`}
              />
            ) : null}
            {habit.kind === "negative" && habit.dailyCost > 0 ? (
              <Info
                icon={<PiggyBank />}
                label="Economia estimada"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics.moneySaved)}
              />
            ) : null}
          </section>
        </div>
        <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
          <Button onClick={onEdit} variant="outline">
            Editar hábito
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-7 place-items-center rounded-lg bg-secondary text-text-secondary [&_svg]:size-4">
        {icon}
      </span>
      <p className="mt-2 font-bold">{value}</p>
      <p className="text-[10px] text-text-tertiary">{label}</p>
    </div>
  );
}
function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <span className="flex items-center gap-2 text-xs text-text-secondary [&_svg]:size-4">
        {icon}
        {label}
      </span>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
