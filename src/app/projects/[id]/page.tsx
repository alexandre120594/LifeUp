"use client";

import { use, useState } from "react";
import {
  ArrowLeft,
  Goal,
  ListChecks,
  Plus,
  Repeat,
  TimerReset,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputHabit from "@/app/habits/components/InputHabit";
import TaskInput from "@/app/tasks/components/TaskInput";
import TaskList from "@/app/tasks/components/TaskListWithPagination";
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

function toDayKey(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [creationDialog, setCreationDialog] = useState<"habit" | "task" | null>(
    null
  );
  const [activeBoardTab, setActiveBoardTab] = useState<"habits" | "tasks">(
    "habits"
  );
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
  const todayKey = toDayKey(new Date());
  const dailyTarget = project.dailyStreakTarget ?? 1;
  const completedToday = (project.tasks ?? []).filter((task) => {
    if (!task.completed) {
      return false;
    }

    return toDayKey(task.dateFinish ?? task.date ?? new Date()) === todayKey;
  }).length;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Button type="button" variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

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
                {project.streakGlobal ?? 0} day project streak
              </span>
              <span className="rounded-full bg-secondary px-3 py-1">
                <ListChecks className="mr-2 inline h-4 w-4" />
                {completedToday}/{dailyTarget} today
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

      <Card className="min-w-0 overflow-hidden border shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Add to project</div>
            <p className="text-sm text-muted-foreground">
              Create project habits or tasks from a focused popup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                setActiveBoardTab("habits");
                setCreationDialog("habit");
              }}
            >
              <Plus className="h-4 w-4" />
              New habit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActiveBoardTab("tasks");
                setCreationDialog("task");
              }}
            >
              <Plus className="h-4 w-4" />
              New task
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="min-w-0 space-y-4">
        <div
          aria-label="Project board"
          className="inline-flex w-full min-w-0 rounded-xl border border-border/70 bg-card p-1 shadow-sm sm:w-auto"
          role="tablist"
        >
          <button
            aria-selected={activeBoardTab === "habits"}
            className="min-w-0 flex-1 rounded-lg px-4 py-2 text-sm font-medium transition data-[active=true]:bg-yevox-primary data-[active=true]:text-white sm:flex-none"
            data-active={activeBoardTab === "habits"}
            onClick={() => setActiveBoardTab("habits")}
            role="tab"
            type="button"
          >
            Habits ({project.habits?.length ?? 0})
          </button>
          <button
            aria-selected={activeBoardTab === "tasks"}
            className="min-w-0 flex-1 rounded-lg px-4 py-2 text-sm font-medium transition data-[active=true]:bg-yevox-primary data-[active=true]:text-white sm:flex-none"
            data-active={activeBoardTab === "tasks"}
            onClick={() => setActiveBoardTab("tasks")}
            role="tab"
            type="button"
          >
            Tasks ({project.tasks?.length ?? 0})
          </button>
        </div>

        {activeBoardTab === "habits" ? (
          <Card className="min-w-0 overflow-hidden border shadow-sm" role="tabpanel">
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
        ) : (
          <div role="tabpanel">
            <TaskList tasks={project.tasks} />
          </div>
        )}
      </section>

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

      <Dialog
        open={creationDialog !== null}
        onOpenChange={(isOpen) => !isOpen && setCreationDialog(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {creationDialog === "habit" ? "Create habit" : "Create task"}
            </DialogTitle>
            <DialogDescription>
              {creationDialog === "habit"
                ? "Add a routine directly to this project."
                : "Add an execution task directly to this project."}
            </DialogDescription>
          </DialogHeader>
          {creationDialog === "habit" ? (
            <div className="[&>div]:mt-0">
              <InputHabit projectId={project.id} />
            </div>
          ) : null}
          {creationDialog === "task" ? <TaskInput projectId={project.id} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
