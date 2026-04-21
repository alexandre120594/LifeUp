"use client";

import Link from "next/link";
import { use } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import { ActivityTrendChart } from "@/components/ChartsComponent/InsightsCharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useTaskById } from "@/hooks/useTaskMutation";
import { useProjectsById } from "@/hooks/useProjectMutations";
import { buildActivityTrend, getTaskSummary } from "@/lib/analytics";

const radialChartConfig = {
  data: {
    label: "Completed Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: task, isLoading, isError } = useTaskById(id);
  const { data: project } = useProjectsById(task?.projectId ?? "");

  if (isLoading) {
    return <div>Loading task...</div>;
  }

  if (isError || !task) {
    return <div>Task not found.</div>;
  }

  const relatedTaskSummary = getTaskSummary(project?.tasks ?? []);
  const projectTrend = buildActivityTrend(project?.tasks ?? [], project?.habits ?? []);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tasks
          </Link>
        </Button>
        {task.projectId ? (
          <Button asChild variant="ghost">
            <Link href={`/projects/${task.projectId}`}>
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
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Task detail with project context so you can understand how this
                item fits into the wider workload.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                {task.completed ? "Completed" : "Pending"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <Repeat className="mr-2 inline h-4 w-4" />
                {task.habit?.title ?? "No linked habit"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <CalendarClock className="mr-2 inline h-4 w-4" />
                {task.time ?? "No finish time"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            <span className="font-medium text-foreground">Project:</span>{" "}
            {task.project?.title ?? project?.title ?? "Unknown"}
          </div>
          <div>
            <span className="font-medium text-foreground">Habit:</span>{" "}
            {task.habit?.title ?? "Not linked"}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <ActivityTrendChart
          title="Project Activity Around This Task"
          description="Recent completed tasks and habit check-ins for the same project"
          data={projectTrend}
        />
        <ChartRadialText
          title="Project completion"
          description="How far the parent project has progressed"
          type="done"
          chartConfig={radialChartConfig}
          chartData={[
            {
              bucket: "progress",
              data: relatedTaskSummary.completed,
              fill: "var(--color-progress)",
            },
          ]}
          tamanho={relatedTaskSummary.total}
        >
          <div className="text-center text-sm text-muted-foreground">
            {relatedTaskSummary.pending} other project tasks still open
          </div>
        </ChartRadialText>
      </section>
    </div>
  );
}
