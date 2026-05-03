"use client";

import { use } from "react";
import { Goal, ListChecks, Repeat, Sparkles, TimerReset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputHabit from "@/app/habits/components/InputHabit";
import TaskInput from "@/app/tasks/components/TaskInput";
import { HabitList } from "@/app/habits/components/HabitList";
import { useProjectsById } from "@/hooks/useProjectMutations";
import {
  ActivityTrendChart,
  HabitPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import {
  buildActivityTrend,
  buildHabitPerformance,
  getTaskSummary,
} from "@/lib/analytics";
import { formatFocusDuration, sumTaskFocusMinutes } from "@/lib/pomodoro";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading, isError } = useProjectsById(id);

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (isError || !project) {
    return <div>Project not found.</div>;
  }

  const taskSummary = getTaskSummary(project.tasks ?? []);
  const activityTrend = buildActivityTrend(project.tasks ?? [], project.habits ?? []);
  const habitPerformance = buildHabitPerformance(
    project.habits ?? [],
    project.tasks ?? []
  );
  const focusMinutes = sumTaskFocusMinutes(project.tasks ?? []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="min-w-0 overflow-hidden border shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <CardTitle className="break-words text-xl sm:text-2xl">
                {project.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor habits and task execution for this project.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-secondary px-3 py-1">
                <Goal className="mr-2 inline h-4 w-4" />
                {project.streakGlobal ?? 0} day streak
              </span>
              <span className="rounded-full bg-secondary px-3 py-1">
                <Repeat className="mr-2 inline h-4 w-4" />
                {project.habits?.length ?? 0} habits
              </span>
              <span className="rounded-full bg-secondary px-3 py-1">
                <ListChecks className="mr-2 inline h-4 w-4" />
                {taskSummary.completed}/{taskSummary.total} tasks complete
              </span>
              <span className="rounded-full bg-secondary px-3 py-1">
                <TimerReset className="mr-2 inline h-4 w-4" />
                {formatFocusDuration(focusMinutes)} focused
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <ActivityTrendChart
          title="Project Activity"
          description="Last 7 days of completed tasks and habit check-ins"
          data={activityTrend}
        />
        <HabitPerformanceChart
          title="Habit Performance"
          description="Linked tasks, recent check-ins, and current streak per habit"
          data={habitPerformance}
        />
      </section>

      <Card className="min-w-0 overflow-hidden border shadow-sm">
        <CardHeader>
          <CardTitle>Habits</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          <HabitList
            habits={project.habits}
            colorHabit={project.color ?? "#ccc"}
            onHabitClick={() => undefined}
          />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="min-w-0 rounded-lg border border-border/70 bg-gradient-to-br from-[var(--primary-yevox)]/12 via-card to-card p-4 shadow-sm sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground sm:tracking-[0.18em]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Creation flow
          </div>
          <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="min-w-0 space-y-3">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Add work without losing structure
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Create the next habit or task directly inside this project. The
                forms below already inherit the current project, so the only
                remaining decisions are what to name and how to organize the
                work.
              </p>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-lg border border-border/70 bg-background/80 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Habit flow
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    Create routines first
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add the repeated behavior you want this project to reinforce.
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/80 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Task flow
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    Attach execution to a habit
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add concrete tasks that contribute to the right streak and
                    metrics.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <div className="[&>div]:mt-0">
                <InputHabit projectId={project.id} />
              </div>
              <TaskInput projectId={project.id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
