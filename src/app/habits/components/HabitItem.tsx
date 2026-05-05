"use client";

import Link from "next/link";
import { format, subDays } from "date-fns";
import {
  CalendarClock,
  Check,
  Edit,
  Eye,
  Flame,
  FolderKanban,
  ListChecks,
  Repeat,
  Trash,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteHabits, useUpdateHabits } from "@/hooks/useHabitMutations";
import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";

export default function HabitItem({
  habit,
  colorHabit,
  NameProject,
  onClickHabit,
}: {
  habit: Habit;
  colorHabit?: string;
  NameProject?: string;
  onClickHabit?: (id: string) => void;
}) {
  const { register, handleSubmit } = useForm<HabitCreateInput>({
    defaultValues: {
      frequency: habit.frequency,
      reminderTime: habit.reminderTime ?? "",
      title: habit.title,
    },
  });
  const [isEdit, setIsEdit] = useState<string | null>(null);
  const { mutate: deleteHabit, isPending } = useDeleteHabits(habit.id);
  const { mutate: updateHabit } = useUpdateHabits();
  const taskCount = habit.tasks?.length ?? 0;
  const completedTasks = habit.tasks?.filter((task) => task.completed).length ?? 0;
  const completionRate = taskCount
    ? Math.round((completedTasks / taskCount) * 100)
    : 0;
  const projectColor = colorHabit || habit.project?.color || "#94a3b8";
  const projectName = NameProject || habit.project?.title || "Unassigned";

  const last7Days = Array.from({ length: 7 })
    .map((_, index) => format(subDays(new Date(), index), "yyyy-MM-dd"))
    .reverse();

  const onSubmitUpdate = (data: HabitCreateInput) => {
    updateHabit(
      { id: habit.id, data },
      {
        onSuccess: () => {
          setIsEdit(null);
        },
      }
    );
  };

  if (isEdit === habit.id) {
    return (
      <div
        className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm"
        style={{ boxShadow: `inset 4px 0 0 ${projectColor}` }}
      >
        <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_160px_150px]">
            <Input
              {...register("title", { required: "Enter a habit name" })}
              disabled={isPending}
              placeholder="Example: Workout after lunch"
            />
            <select
              {...register("frequency")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              disabled={isPending}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <Input
              {...register("reminderTime")}
              disabled={isPending}
              type="time"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsEdit(null);
              }}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Check className="h-4 w-4" />
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="group min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, var(--card) 84%, white 16%), var(--card))",
        boxShadow: `inset 4px 0 0 ${projectColor}`,
      }}
      onClick={() => onClickHabit?.(habit.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClickHabit?.(habit.id);
        }
      }}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background/60"
            style={{ backgroundColor: projectColor }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 break-words text-base font-semibold tracking-tight [overflow-wrap:anywhere]">
                {habit.title}
              </h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium capitalize text-secondary-foreground">
                {habit.frequency}
              </span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{projectName}</span>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <Flame className="h-3.5 w-3.5" />
              Streak
            </div>
            <div className="mt-1 text-lg font-semibold">{habit.streak ?? 0}</div>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" />
              Tasks
            </div>
            <div className="mt-1 text-lg font-semibold">
              {completedTasks}/{taskCount}
            </div>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <Repeat className="h-3.5 w-3.5" />
              Rate
            </div>
            <div className="mt-1 text-lg font-semibold">{completionRate}%</div>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-background/80 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Last 7 days
            </div>
            {habit.reminderTime ? (
              <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                {habit.reminderTime}
              </span>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {last7Days.map((date) => {
              const isCompleted = (habit.history ?? []).includes(date);

              return (
                <div
                  key={date}
                  title={date}
                  className={`h-2 rounded-full transition-colors ${
                    isCompleted ? "bg-primary" : "bg-secondary"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="min-w-24 flex-1"
            onClick={(event) => event.stopPropagation()}
          >
            <Link href={`/habits/${habit.id}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              setIsEdit(habit.id);
            }}
            type="button"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              deleteHabit(habit.id);
            }}
            type="button"
          >
            <Trash className="h-4 w-4 text-red-600" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
