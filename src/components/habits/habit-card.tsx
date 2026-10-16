import {
  Archive,
  ArchiveRestore,
  Check,
  Circle,
  Eye,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { HabitStreak } from "@/components/habits/habit-streak";
import { HabitWeek } from "@/components/habits/habit-week";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  getHabitCompletions,
  getLastSevenDays,
  getScheduleLabel,
  type HabitMetrics,
} from "@/lib/life-habits";
import { cn } from "@/lib/utils";
import type { LifeHabit, LifeHabitActionInput } from "@/types/BaseInterfaces";

export function HabitCard({
  habit,
  isPending,
  metrics,
  onAction,
  onArchive,
  onDelete,
  onDetails,
  onEdit,
  onRelapse,
  todayKey,
}: {
  habit: LifeHabit;
  isPending: boolean;
  metrics: HabitMetrics;
  onAction: (data: LifeHabitActionInput) => void;
  onArchive: () => void;
  onDelete: () => void;
  onDetails: () => void;
  onEdit: () => void;
  onRelapse: () => void;
  todayKey: string;
}) {
  const entry = getHabitCompletions(habit)[todayKey];
  const kindLabel =
    habit.kind === "negative"
      ? "Evitar"
      : habit.kind === "quantitative"
        ? "Quantidade"
        : "Normal";
  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-panel transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-snow-2",
        metrics.checkedToday && "border-primary/25",
      )}
    >
      <div
        className="h-1"
        style={{ backgroundColor: habit.color ?? "var(--primary)" }}
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {habit.icon}
              </span>
              <Badge variant="outline">{kindLabel}</Badge>
              {habit.category ? (
                <Badge variant="secondary">{habit.category}</Badge>
              ) : null}
            </div>
            <button
              className="mt-2 block max-w-full text-left"
              onClick={onDetails}
              type="button"
            >
              <h2 className="truncate text-base font-semibold hover:text-primary">
                {habit.title}
              </h2>
              <p className="mt-1 text-[11px] text-text-tertiary">
                {getScheduleLabel(habit)}
              </p>
            </button>
          </div>
          <HabitStreak compact streak={metrics.currentStreak} />
        </div>

        <HabitWeek days={getLastSevenDays(habit, todayKey)} />

        {habit.kind === "quantitative" ? (
          <div className="grid gap-2 rounded-lg bg-secondary/45 p-3">
            <div className="flex items-end justify-between">
              <span className="text-xs text-text-secondary">Hoje</span>
              <span className="text-lg font-bold">
                {metrics.todayAmount}{" "}
                <span className="text-xs font-normal text-text-tertiary">
                  de {habit.perDayTarget}
                </span>
              </span>
            </div>
            <Progress value={metrics.progress} />
            <div className="flex gap-2">
              <Button
                aria-label="Diminuir quantidade"
                disabled={isPending || metrics.todayAmount <= 0}
                onClick={() =>
                  onAction({
                    action: "increment",
                    amount: -habit.incrementAmount,
                    dayKey: todayKey,
                  })
                }
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <Minus className="size-4" />
              </Button>
              <Button
                aria-label="Adicionar quantidade"
                disabled={isPending}
                onClick={() =>
                  onAction({
                    action: "increment",
                    amount: habit.incrementAmount,
                    dayKey: todayKey,
                  })
                }
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {habit.substeps.length && habit.kind !== "negative" ? (
          <div className="grid gap-2 rounded-lg border border-border p-3">
            {habit.substeps.map((step) => (
              <label className="flex items-center gap-2 text-sm" key={step.id}>
                <Checkbox
                  checked={entry?.steps.includes(step.id) ?? false}
                  disabled={isPending}
                  onCheckedChange={() =>
                    onAction({
                      action: "toggle-step",
                      dayKey: todayKey,
                      stepId: step.id,
                    })
                  }
                />
                <span
                  className={cn(
                    entry?.steps.includes(step.id) &&
                      "text-text-tertiary line-through",
                  )}
                >
                  {step.title}
                </span>
              </label>
            ))}
          </div>
        ) : null}

        {habit.kind === "positive" && !habit.substeps.length ? (
          <Button
            className="h-11"
            disabled={isPending || habit.focusOnly}
            onClick={() =>
              onAction({ action: "toggle-checkin", dayKey: todayKey })
            }
            type="button"
            variant={metrics.checkedToday ? "secondary" : "default"}
          >
            {metrics.checkedToday ? (
              <Check className="size-4" />
            ) : (
              <Circle className="size-4" />
            )}
            {metrics.checkedToday
              ? "Feito hoje · desfazer"
              : habit.focusOnly
                ? "Conclua em uma sessão de foco"
                : "Concluir hoje"}
          </Button>
        ) : null}
        {habit.kind === "negative" ? (
          <Button
            disabled={isPending}
            onClick={onRelapse}
            type="button"
            variant="outline"
          >
            <RotateCcw className="size-4" />
            Registrar recaída
          </Button>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-2">
          <span className="text-[11px] text-text-tertiary">
            Força {metrics.consistency}% · recorde {metrics.bestStreak}
          </span>
          <div className="flex gap-1">
            <Button
              aria-label={`Detalhes de ${habit.title}`}
              onClick={onDetails}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              aria-label={`Editar ${habit.title}`}
              onClick={onEdit}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              aria-label={`${habit.archivedAt ? "Restaurar" : "Arquivar"} ${habit.title}`}
              onClick={onArchive}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              {habit.archivedAt ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
            </Button>
            <Button
              aria-label={`Excluir ${habit.title}`}
              onClick={onDelete}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
