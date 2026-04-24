"use client";

import { CheckCircle2, Clock3, FolderKanban, ListTodo } from "lucide-react";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import TaskList from "./components/TaskListWithPagination";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import {
  ActivityTrendChart,
  ProjectPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { useHabit } from "@/hooks/useHabitMutations";
import {
  buildActivityTrend,
  buildProjectPerformance,
  getTaskSummary,
} from "@/lib/analytics";

const radialChartConfig = {
  data: {
    label: "Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function TasksPage() {
  const { data: tasks } = useTask();
  const { data: projects } = useProjects();
  const { data: habits } = useHabit();

  const taskSummary = getTaskSummary(tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const projectPerformance = buildProjectPerformance(projects ?? []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Task center"
        title="Tasks"
        action={<EntityCreateDialog defaultMode="task" />}
      />

      <OverviewPanel
        title="Execution flow without noise"
        description="Review the task queue by project, add new work with context, and drill into specific tasks for details."
        stats={[
          {
            label: "Tasks",
            value: taskSummary.total,
            icon: ListTodo,
          },
          {
            label: "Completed",
            value: taskSummary.completed,
            icon: CheckCircle2,
          },
          {
            label: "Pending",
            value: taskSummary.pending,
            icon: Clock3,
          },
        ]}
        progress={{
          label: `${taskSummary.completionRate}% complete`,
          value: taskSummary.completionRate,
          detail: `${taskSummary.completed} done, ${taskSummary.pending} pending`,
          icon: CheckCircle2,
        }}
        focusTitle="Protect the queue"
        focusDescription="Use the popup to create tasks with project and habit context from one place."
        focusItems={[
          {
            label: "Projects",
            value: projects?.length ?? 0,
            icon: FolderKanban,
          },
          {
            label: "Pending tasks",
            value: taskSummary.pending,
            icon: Clock3,
          },
        ]}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <ActivityTrendChart
          title="Execution Trend"
          description="Completed tasks and habit check-ins over the last 7 days"
          data={activityTrend}
        />
        <ChartRadialText
          title="Task completion"
          description="Progress across the full queue"
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
            {taskSummary.completionRate}% completion rate
          </div>
        </ChartRadialText>
      </section>

      <ProjectPerformanceChart
        title="Tasks By Project"
        description="Completed vs pending tasks in each project"
        data={projectPerformance}
      />

      <TaskList tasks={tasks} />
    </div>
  );
}
