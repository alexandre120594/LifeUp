"use client";

import { ListTodo, CheckCircle2, Clock3 } from "lucide-react";
import Counter from "@/components/counter-with-icon";
import { PageHero } from "@/components/page-hero";
import TaskInput from "./components/TaskInput";
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
    <div className="space-y-8 p-4 md:p-8">
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <PageHero
          badgeIcon={ListTodo}
          badgeLabel="Task center"
          title="Tasks and execution flow"
          description="Review the task queue by project, add new work with project and habit context, and drill into specific tasks for details."
          stats={[
            { label: "Completed", value: taskSummary.completed },
            { label: "Pending", value: taskSummary.pending },
          ]}
        />

        <TaskInput />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Counter icon={<ListTodo />} number={taskSummary.total} name="Tasks" />
        <Counter
          icon={<CheckCircle2 />}
          number={taskSummary.completed}
          name="Completed"
        />
        <Counter icon={<Clock3 />} number={taskSummary.pending} name="Pending" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
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
