"use client";

import { use } from "react";
import { Goal, ListChecks, Repeat } from "lucide-react";
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

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="border shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor habits and task execution for this project.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <Goal className="mr-2 inline h-4 w-4" />
                {project.streakGlobal ?? 0} day streak
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <Repeat className="mr-2 inline h-4 w-4" />
                {project.habits?.length ?? 0} habits
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                <ListChecks className="mr-2 inline h-4 w-4" />
                {taskSummary.completed}/{taskSummary.total} tasks complete
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <ActivityTrendChart
          title="Project Activity"
          description="Last 7 days of completed tasks and habit check-ins"
          data={activityTrend}
        />
        <HabitPerformanceChart
          title="Habit Performance"
          description="Completed tasks and recent check-ins per habit"
          data={habitPerformance}
        />
      </section>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitList
            habits={project.habits}
            colorHabit={project.color ?? "#ccc"}
            onHabitClick={() => undefined}
          />
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Add New Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <InputHabit projectId={project.id} />
          <TaskInput projectId={project.id} />
        </CardContent>
      </Card>
    </div>
  );
}
