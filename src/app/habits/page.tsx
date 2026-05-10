"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Flame, ListChecks, Repeat } from "lucide-react";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { ListSection } from "@/components/list-section";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { HabitList } from "./components/HabitList";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import {
  ActivityTrendChart,
  HabitPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChartConfig } from "@/components/ui/chart";
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import {
  buildActivityTrend,
  buildHabitPerformance,
  getTaskSummary,
} from "@/lib/analytics";

const radialChartConfig = {
  data: {
    label: "Completed Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function HabitsPage() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const projectFilter =
    selectedProjectId === "all" ? undefined : selectedProjectId;
  const { data: projects = [] } = useProjects();
  const { data: habits, isLoading } = useHabit(projectFilter);
  const { data: tasks } = useTask({ projectId: projectFilter });

  const habitPerformance = buildHabitPerformance(habits ?? [], tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
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
        eyebrow="Habit center"
        title="Habits"
        action={<EntityCreateDialog defaultMode="habit" />}
      />

      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">Filters</div>
          <label className="grid min-w-0 gap-1.5 sm:w-[320px]">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Project
            </span>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="min-w-0 overflow-hidden rounded-xl">
                <SelectValue placeholder="Project" className="truncate" />
              </SelectTrigger>
              <SelectContent className="max-w-[min(320px,calc(100vw-2rem))]">
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem
                    className="max-w-[min(300px,calc(100vw-3rem))]"
                    key={project.id}
                    value={project.id}
                  >
                    <span className="block max-w-full truncate">
                      {project.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      </section>

      <OverviewPanel
        title="Routine performance at a glance"
        description="Review streaks, recent check-ins, and linked task output before opening a habit detail page."
        stats={[
          {
            label: "Habits",
            value: habits?.length ?? 0,
            icon: Repeat,
          },
          {
            label: "Top Streak",
            value: highestStreak,
            icon: Flame,
          },
          {
            label: "Done Tasks",
            value: habitTaskSummary.completed,
            icon: ListChecks,
          },
        ]}
        progress={{
          label: `${habitTaskSummary.completionRate}% habit tasks complete`,
          value: habitTaskSummary.completionRate,
          detail: `${habitTaskSummary.pending} habit tasks still open`,
          icon: CheckCircle2,
        }}
        focusTitle="Keep routines connected"
        focusDescription="Use the popup to add habits or supporting tasks without crowding this page."
        focusItems={[
          {
            label: "Total check-ins",
            value: totalCheckIns,
            icon: CheckCircle2,
          },
          {
            label: "Open habit tasks",
            value: habitTaskSummary.pending,
            icon: Clock3,
          },
        ]}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <HabitPerformanceChart
          title="Habit Performance"
          description="Linked tasks, recent check-ins, and current streak per habit"
          data={habitPerformance}
        />
        <ChartRadialText
          title="Habit-linked task completion"
          description="Completed tasks attached to habits"
          type="completed"
          chartConfig={radialChartConfig}
          chartData={[
            {
              bucket: "progress",
              data: habitTaskSummary.completed,
              fill: "var(--color-progress)",
            },
          ]}
          tamanho={habitTaskSummary.total}
        >
          <div className="text-center text-sm text-muted-foreground">
            {habitTaskSummary.pending} habit tasks still open
          </div>
        </ChartRadialText>
      </section>

      <ActivityTrendChart
        title="Habit Activity Trend"
        description="Recent habit check-ins compared with completed tasks"
        data={activityTrend}
      />

      <ListSection
        title="All Habits"
        isLoading={isLoading}
        isEmpty={!habits?.length}
        loadingLabel="Loading habits..."
        emptyLabel="No habits found yet. Add the first one above."
      >
        <HabitList
          habits={habits}
          onHabitClick={(id) => router.push(`/habits/${id}`)}
        />
      </ListSection>
    </div>
  );
}
