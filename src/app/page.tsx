"use client";

import { useForm } from "react-hook-form";
import { Goal, List, Repeat, Sparkles } from "lucide-react";
import { useCreateProject, useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { useHabit } from "@/hooks/useHabitMutations";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import {
  ActivityTrendChart,
  ProjectPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { type ChartConfig } from "@/components/ui/chart";
import Counter from "@/components/counter-with-icon";
import ProjectItem from "./projects/components/ProjectItem";
import TaskList from "./tasks/components/TaskListWithPagination";
import { ProjectCreateInput } from "@/types/BaseInterfaces";
import {
  buildActivityTrend,
  buildProjectPerformance,
  getTaskSummary,
} from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { register, handleSubmit, setValue } = useForm<ProjectCreateInput>();
  const { mutate, isPending } = useCreateProject();
  const { data: projects, isLoading } = useProjects();
  const { data: tasks } = useTask();
  const { data: habits } = useHabit();

  const taskSummary = getTaskSummary(tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const projectPerformance = buildProjectPerformance(projects ?? []);

  const radialChartData = [
    {
      bucket: "progress",
      data: taskSummary.completed,
      fill: "var(--color-progress)",
    },
  ];

  const onSubmit = (data: ProjectCreateInput) => {
    mutate(data, {
      onSuccess: () => {
        setValue("title", "");
        setValue("color", "");
      },
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[var(--primary-yevox)]/15 via-card to-[var(--secondary-yevox)]/70 shadow-sm">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[1.3fr_0.7fr] md:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Productivity overview
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  LifeUp Dashboard
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Follow the current pace of your projects, compare habit
                  consistency, and see where unfinished tasks are accumulating.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="text-muted-foreground">Completion Rate</div>
                <div className="mt-2 text-3xl font-semibold">
                  {taskSummary.completionRate}%
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="text-muted-foreground">Pending Tasks</div>
                <div className="mt-2 text-3xl font-semibold">
                  {taskSummary.pending}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                {...register("title", { required: "Name is required" })}
                placeholder="New project name..."
                className="w-full rounded-xl border bg-background px-3 py-2"
              />
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2">
                <label className="text-sm text-muted-foreground">Color</label>
                <input
                  {...register("color")}
                  type="color"
                  defaultValue="#3b82f6"
                  className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-yevox-primary px-4 py-2.5 text-white disabled:bg-slate-400"
              >
                {isPending ? "Saving..." : "Add Project"}
              </button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Counter icon={<Goal />} number={projects?.length} name="Projects" />
        <Counter icon={<Repeat />} number={habits?.length} name="Habits" />
        <Counter icon={<List />} number={tasks?.length} name="Tasks" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
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

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ProjectPerformanceChart
          title="Project Throughput"
          description="Completed vs pending tasks by project"
          data={projectPerformance}
        />
        <TaskList tasks={tasks} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Open each project to inspect habit-level performance.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <p>Loading projects...</p>
          ) : projects?.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">
              No projects found. Create your first project above.
            </div>
          ) : (
            projects?.map((project) => (
              <ProjectItem key={project.id} project={project} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
