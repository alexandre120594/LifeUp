"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedHabitId, setSelectedHabitId] = useState("all");
  const projectFilter =
    selectedProjectId === "all" ? undefined : selectedProjectId;
  const habitFilter = selectedHabitId === "all" ? undefined : selectedHabitId;
  const { data: tasks } = useTask({
    habitId: habitFilter,
    projectId: projectFilter,
  });
  const { data: projects } = useProjects();
  const { data: habits } = useHabit();
  const filteredHabitOptions =
    selectedProjectId === "all"
      ? habits ?? []
      : (habits ?? []).filter((habit) => habit.projectId === selectedProjectId);
  const visibleProjects =
    selectedProjectId === "all"
      ? projects ?? []
      : (projects ?? []).filter((project) => project.id === selectedProjectId);
  const visibleHabits =
    selectedHabitId === "all"
      ? filteredHabitOptions
      : filteredHabitOptions.filter((habit) => habit.id === selectedHabitId);

  const taskSummary = getTaskSummary(tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], visibleHabits);
  const projectPerformance = buildProjectPerformance(
    visibleProjects.map((project) => ({
      ...project,
      habits: visibleHabits.filter((habit) => habit.projectId === project.id),
      tasks: (tasks ?? []).filter((task) => task.projectId === project.id),
    }))
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Task center"
        title="Tasks"
        action={<EntityCreateDialog defaultMode="task" />}
      />

      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,680px)] lg:items-center">
          <div className="text-sm font-semibold">Filters</div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Project
              </span>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => {
                  setSelectedProjectId(value);
                  setSelectedHabitId("all");
                }}
              >
                <SelectTrigger className="min-w-0 overflow-hidden rounded-xl">
                  <SelectValue placeholder="Project" className="truncate" />
                </SelectTrigger>
                <SelectContent className="max-w-[min(320px,calc(100vw-2rem))]">
                  <SelectItem value="all">All projects</SelectItem>
                  {(projects ?? []).map((project) => (
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
            <label className="grid min-w-0 gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Habit
              </span>
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                <SelectTrigger className="min-w-0 overflow-hidden rounded-xl">
                  <SelectValue placeholder="Habit" className="truncate" />
                </SelectTrigger>
                <SelectContent className="max-w-[min(320px,calc(100vw-2rem))]">
                  <SelectItem value="all">All habits</SelectItem>
                  {filteredHabitOptions.map((habit) => (
                    <SelectItem
                      className="max-w-[min(300px,calc(100vw-3rem))]"
                      key={habit.id}
                      value={habit.id}
                    >
                      <span className="block max-w-full truncate">
                        {habit.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>
      </section>

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
        description="Task workload, open work, and completion rate by project"
        data={projectPerformance}
      />

      <TaskList
        key={`${selectedProjectId}-${selectedHabitId}`}
        tasks={tasks}
      />
    </div>
  );
}
