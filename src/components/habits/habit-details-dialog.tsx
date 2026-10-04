"use client";

import { Award, BarChart3, Check, RotateCcw, Target, Trophy } from "lucide-react";

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
import { getHabitWeekSummaries, type HabitMetrics } from "@/lib/life-habits";
import { cn } from "@/lib/utils";
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
  const weeklySummaries = getHabitWeekSummaries(habit, todayKey);
  const baseMilestone = Math.max(10, Math.floor(metrics.currentStreak / 10) * 10);
  const milestones = [baseMilestone, baseMilestone + 10, baseMilestone + 20];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{habit.kind === "good" ? "Construir hábito" : "Evitar hábito"}</Badge>
            <span className="size-2.5 rounded-full" style={{ backgroundColor: habit.color ?? "var(--primary)" }} />
          </div>
          <DialogTitle className="text-xl leading-tight">{habit.title}</DialogTitle>
          <DialogDescription>{habit.notes || "Seu histórico diário de consistência."}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section className="grid gap-3 sm:grid-cols-2" aria-label="Métricas do hábito">
            <div className="rounded-xl border border-border bg-panel-subtle p-4"><HabitStreak streak={metrics.currentStreak} /></div>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-panel-subtle p-3">
              <DetailMetric icon={<Trophy className="size-4" />} label="Recorde" value={`${metrics.bestStreak}d`} />
              <DetailMetric icon={<Check className="size-4" />} label="Conclusão" value={`${metrics.completionRate}%`} />
              <DetailMetric icon={<Target className="size-4" />} label="Meta" value={`${metrics.targetDays}d`} />
            </div>
          </section>

          <section className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><BarChart3 className="size-4 text-primary" />Ritmo das últimas 4 semanas</div>
              <span className="text-xs text-text-secondary">{metrics.completionRate}% de consistência</span>
            </div>
            <div className="mt-4 grid gap-3">
              {weeklySummaries.map((week) => (
                <div className="grid gap-1.5" key={week.label}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium">{week.label}</span>
                    <span className="flex items-center gap-2 text-text-secondary">
                      {habit.kind === "bad" && week.relapseCount > 0 ? (
                        <span className="flex items-center gap-1 text-destructive"><RotateCcw className="size-3" />{week.relapseCount} recaída{week.relapseCount === 1 ? "" : "s"}</span>
                      ) : null}
                      <span>{week.availableDays ? `${week.completedDays}/${week.availableDays} dias` : "Sem dados"}</span>
                    </span>
                  </div>
                  <Progress value={week.rate} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-text-tertiary">Cada barra compara os dias mantidos com os dias disponíveis naquela semana.</p>
          </section>

          <section className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Award className="size-4 text-primary" />Marcos e recompensa</div>
            <div className="mt-3 grid gap-2">
              {milestones.map((milestone) => {
                const reached = metrics.currentStreak >= milestone;
                return (
                  <div className={cn("flex items-center gap-3 rounded-lg border p-3", reached ? "border-primary/25 bg-primary/5" : "border-border bg-panel-subtle")} key={milestone}>
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border text-[9px] font-semibold", reached ? "border-primary bg-primary text-primary-foreground" : "border-border-strong text-text-tertiary")}>{reached ? <Check className="size-4" /> : milestone}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{milestone} dias</p>
                      <p className="truncate text-xs text-text-secondary">{habit.reward || "Marco de consistência"}</p>
                    </div>
                    <span className="text-xs text-text-tertiary">{reached ? "Conquistado" : `faltam ${Math.max(0, milestone - metrics.currentStreak)} dias`}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between text-xs text-text-secondary"><span>Progresso da meta</span><span>{metrics.currentStreak}/{metrics.targetDays} dias</span></div>
            <Progress className="mt-2" value={metrics.progress} />
          </section>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
          <Button onClick={onEdit} type="button" variant="outline">Editar hábito</Button>
          <Button onClick={() => onOpenChange(false)} type="button">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 text-center">
      <span className="mx-auto grid size-7 place-items-center rounded-lg bg-secondary text-text-secondary">{icon}</span>
      <p className="mt-2 text-base font-bold leading-none">{value}</p>
      <p className="mt-1 truncate text-[10px] text-text-tertiary">{label}</p>
    </div>
  );
}
