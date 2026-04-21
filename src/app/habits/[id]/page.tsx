"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Flame, FolderKanban, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TaskList from "@/app/tasks/components/TaskListWithPagination";
import {
  ActivityTrendChart,
  HabitPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import type { ChartConfig } from "@/components/ui/chart";
import { useHabitDetail } from "@/hooks/useHabitMutations";
import { buildActivityTrend, buildHabitPerformance, getTaskSummary } from "@/lib/analytics";

const radialChartConfig = {
  data: {
    label: "Completed Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: habit, isLoading, isError } = useHabitDetail(id);

  if (isLoading) {
    return <div>Loading habit...</div>;
  }

  if (isError || !habit) {
    return <div>Habit not found.</div>;
  }

  const taskSummary = getTaskSummary(habit.tasks ?? []);
  const activityTrend = buildActivityTrend(habit.tasks ?? [], [habit]);
  const habitPerformance = buildHabitPerformance([habit], habit.tasks ?? []);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href="/habits">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to habits
          </Link>
        </Button>
        {habit.project ? (
          <Button asChild variant="ghost">
            <Link href={`/projects/${habit.projectId}`}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Open project
            </Link>
          </Button>
        ) : null}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">{habit.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detail view for this habit, its linked tasks, and recent
                completion behavior.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <Flame className="mr-2 inline h-4 w-4" />
                {habit.streak} day streak
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <ListChecks className="mr-2 inline h-4 w-4" />
                {taskSummary.completed}/{taskSummary.total} linked tasks done
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <FolderKanban className="mr-2 inline h-4 w-4" />
                {habit.project?.title ?? "Project"}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <ActivityTrendChart
          title="Habit Activity"
          description="Completed tasks and habit check-ins for the last 7 days"
          data={activityTrend}
        />
        <ChartRadialText
          title="Linked task completion"
          description="Progress of tasks attached to this habit"
          type="done"
          chartConfig={radialChartConfig}
          chartData={[
            {
              bucket: "progress",
              data: taskSummary.completed,
              fill: "var(--color-progress)",
            },
          ]}
          tamanho={taskSummary.total}
        >
          <div className="text-center text-sm text-muted-foreground">
            {habit.history?.length ?? 0} historical check-ins recorded
          </div>
        </ChartRadialText>
      </section>

      <HabitPerformanceChart
        title="Habit Snapshot"
        description="Single-habit comparison of completed tasks and recent check-ins"
        data={habitPerformance}
      />

      <TaskList tasks={habit.tasks} />
    </div>
  );
}
