"use client";

import { CheckCircle2, Flame, ListChecks, Repeat } from "lucide-react";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { HabitTracker } from "@/components/habit-tracker";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { getTaskSummary } from "@/lib/analytics";

export default function HabitTrackerPage() {
  const { data: habits, isLoading } = useHabit();
  const { data: projects } = useProjects();
  const { data: tasks } = useTask();
  const habitTaskSummary = getTaskSummary(
    (tasks ?? []).filter((task) => Boolean(task.habitId))
  );
  const totalCheckIns = (habits ?? []).reduce(
    (total, habit) => total + (habit.history?.length ?? 0),
    0
  );
  const highestStreak = Math.max(
    0,
    ...(habits ?? []).map((habit) => habit.streak ?? 0)
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Habit tracker"
        title="Track Routines"
        action={<EntityCreateDialog defaultMode="habit" triggerLabel="New habit" />}
      />

      <OverviewPanel
        title="Daily consistency board"
        description="Mark habit completions across the recent timeline and keep streaks visible."
        stats={[
          {
            label: "Habits",
            value: habits?.length ?? 0,
            icon: Repeat,
          },
          {
            label: "Top streak",
            value: highestStreak,
            icon: Flame,
          },
          {
            label: "Check-ins",
            value: totalCheckIns,
            icon: CheckCircle2,
          },
        ]}
        progress={{
          label: `${habitTaskSummary.completionRate}% habit tasks complete`,
          value: habitTaskSummary.completionRate,
          detail: `${habitTaskSummary.completed} done, ${habitTaskSummary.pending} pending`,
          icon: ListChecks,
        }}
        focusTitle="Track today first"
        focusDescription="Use the grid to mark each habit for the day, then review streak movement."
        focusItems={[
          {
            label: "Open habit tasks",
            value: habitTaskSummary.pending,
            icon: ListChecks,
          },
          {
            label: "Total check-ins",
            value: totalCheckIns,
            icon: CheckCircle2,
          },
        ]}
      />

      {isLoading ? (
        <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
          Loading habit tracker...
        </p>
      ) : (
        <HabitTracker habits={habits} projects={projects} />
      )}
    </div>
  );
}
