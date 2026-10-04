import { Check, Circle, Eye, Pencil, RotateCcw, Trash2, Trophy } from "lucide-react";

import { HabitStreak } from "@/components/habits/habit-streak";
import { HabitWeek } from "@/components/habits/habit-week";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLastSevenDays, type HabitMetrics } from "@/lib/life-habits";
import { cn } from "@/lib/utils";
import type { LifeHabit } from "@/types/BaseInterfaces";

type HabitCardProps = {
  habit: LifeHabit;
  isPending: boolean;
  metrics: HabitMetrics;
  onDelete: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onRelapse: () => void;
  onToggleToday: () => void;
  todayKey: string;
};

export function HabitCard({
  habit,
  isPending,
  metrics,
  onDelete,
  onDetails,
  onEdit,
  onRelapse,
  onToggleToday,
  todayKey,
}: HabitCardProps) {
  const isGood = habit.kind === "good";
  const lastRelapseKey = [...habit.badEvents].sort().at(-1) ?? null;
  const restartedToday = !isGood && lastRelapseKey === todayKey;

  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-panel transition-[border-color,box-shadow,transform] duration-200 hover:border-border-strong hover:shadow-snow-2",
        metrics.checkedToday && "border-primary/25",
      )}
    >
      <div className="h-1 w-full" style={{ backgroundColor: habit.color ?? "var(--primary)" }} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="outline">{isGood ? "Construir" : "Evitar"}</Badge>
            <button className="mt-2 block max-w-full text-left" onClick={onDetails} type="button">
              <h2 className="truncate text-base font-semibold hover:text-primary">{habit.title}</h2>
            </button>
          </div>
          <HabitStreak compact streak={metrics.currentStreak} />
        </div>

        {!isGood ? (
          <p className="-mt-1 text-xs text-text-secondary">
            {restartedToday
              ? metrics.checkedToday
                ? "Nova sequência · Dia 1"
                : "Sequência reiniciada hoje"
              : metrics.currentStreak > 0
              ? `${metrics.currentStreak} dia${metrics.currentStreak === 1 ? "" : "s"} preservando este hábito`
              : "Uma nova sequência pode começar hoje."}
          </p>
        ) : null}

        <HabitWeek days={getLastSevenDays(habit, todayKey)} />

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px] text-text-secondary">
            <span>Meta: {metrics.targetDays} dias</span>
            <span>{metrics.progress}%</span>
          </div>
          <Progress value={metrics.progress} />
        </div>

        <div className="mt-auto grid gap-2">
          <Button
            className={cn("h-11 transition-transform active:scale-[0.98]", metrics.checkedToday && "text-primary")}
            disabled={isPending}
            onClick={onToggleToday}
            type="button"
            variant={metrics.checkedToday ? "secondary" : "default"}
          >
            {metrics.checkedToday ? <Check className="size-4" /> : <Circle className="size-4" />}
            {isGood
              ? metrics.checkedToday
                ? "Feito hoje · desfazer"
                : "Fazer hoje"
              : metrics.checkedToday
                ? "Continuei hoje · desfazer"
                : "Continuei hoje"}
          </Button>

          {!isGood ? (
            <Button disabled={isPending} onClick={onRelapse} size="sm" type="button" variant="ghost">
              <RotateCcw className="size-4" />
              Registrar recaída
            </Button>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
            <Trophy className="size-3.5" /> {lastRelapseKey ? "Recorde anterior" : "Recorde"}: {metrics.bestStreak} dias
          </span>
          <div className="flex gap-1">
            <Button aria-label={`Ver detalhes de ${habit.title}`} onClick={onDetails} size="icon-sm" type="button" variant="ghost"><Eye className="size-4" /></Button>
            <Button aria-label={`Editar ${habit.title}`} onClick={onEdit} size="icon-sm" type="button" variant="ghost"><Pencil className="size-4" /></Button>
            <Button aria-label={`Excluir ${habit.title}`} onClick={onDelete} size="icon-sm" type="button" variant="ghost"><Trash2 className="size-4" /></Button>
          </div>
        </div>
      </div>
    </article>
  );
}
