"use client";

import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Repeat,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { useHabit } from "@/hooks/useHabitMutations";
import { useFinanceDashboard } from "@/hooks/useFinanceMutations";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import {
  ActivityTrendChart,
  ProjectPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { ListSection } from "@/components/list-section";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { type ChartConfig } from "@/components/ui/chart";
import ProjectItem from "./projects/components/ProjectItem";
import TaskList from "./tasks/components/TaskListWithPagination";
import {
  buildActivityTrend,
  buildProjectPerformance,
  getTaskSummary,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";

const radialChartConfig = {
  data: {
    label: "Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();
  const { data: tasks } = useTask();
  const { data: habits } = useHabit();
  const { data: finance } = useFinanceDashboard();

  const taskSummary = getTaskSummary(tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const projectPerformance = buildProjectPerformance(projects ?? []);
  const financeSummary = finance?.summary;
  const totalCash = financeSummary?.netCashFlow ?? 0;

  const radialChartData = [
    {
      bucket: "progress",
      data: taskSummary.completed,
      fill: "var(--color-progress)",
    },
  ];

  const overviewStats = [
    {
      label: "Projects",
      value: projects?.length ?? 0,
      icon: FolderKanban,
    },
    {
      label: "Habits",
      value: habits?.length ?? 0,
      icon: Repeat,
    },
    {
      label: "Tasks",
      value: tasks?.length ?? 0,
      icon: ListTodo,
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Welcome back,"
        title="Alexandre"
        action={<EntityCreateDialog />}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold sm:text-base">
        <span className="text-muted-foreground">
          Here&apos;s our situation now:
        </span>
        <span className="text-emerald-600">
          Income {formatCurrency(financeSummary?.totalIncome ?? 0)}
        </span>
        <span className="text-red-600">
          Expenses {formatCurrency(financeSummary?.totalExpenses ?? 0)}
        </span>
        <span
          className={cn(totalCash < 0 ? "text-red-600" : "text-emerald-600")}
        >
          Total cash {formatCurrency(totalCash)}
        </span>
      </div>

      <OverviewPanel
        title="Your workspace at a glance"
        description="Create less clutter, focus on current progress, and jump into the pieces that need attention."
        stats={overviewStats}
        progress={{
          label: `${taskSummary.completionRate}% complete`,
          value: taskSummary.completionRate,
          detail: `${taskSummary.completed} done, ${taskSummary.pending} still open`,
          icon: CheckCircle2,
        }}
        focusTitle="Keep the queue clean"
        focusDescription="Use the popup to add a project, habit, or task without leaving the dashboard."
        focusItems={[
          {
            label: "Pending tasks",
            value: taskSummary.pending,
            icon: Clock3,
          },
          {
            label: "Completed tasks",
            value: taskSummary.completed,
            icon: CheckCircle2,
          },
        ]}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
        <ActivityTrendChart
          title="Last 7 Days Activity"
          description="Tasks completed and habit check-ins by day"
          data={activityTrend}
        />

        <ChartRadialText
          title="Task Completion"
          description="Current progress across all tasks"
          type="done"
          chartConfig={radialChartConfig}
          chartData={radialChartData}
          tamanho={taskSummary.total}
        >
          <div className="text-center text-sm text-muted-foreground">
            {taskSummary.pending} pending tasks left
          </div>
        </ChartRadialText>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ProjectPerformanceChart
          title="Project Throughput"
          description="Completed vs pending tasks by project"
          data={projectPerformance}
        />
        <TaskList tasks={tasks} />
      </section>

      <ListSection
        title="Projects"
        description="Open each project to inspect habit-level performance."
        isLoading={isLoading}
        isEmpty={!projects?.length}
        loadingLabel="Loading projects..."
        emptyLabel="No projects found. Create your first project above."
      >
        {projects?.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </ListSection>
    </div>
  );
}
