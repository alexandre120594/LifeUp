"use client";

import { CheckCircle2, Flame, FolderKanban, ListChecks, Target } from "lucide-react";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { getTaskSummary } from "@/lib/analytics";
import type { Project, Task } from "@/types/BaseInterfaces";

function toDayKey(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function ProjectStreakBoard({
  projects = [],
  tasks = [],
}: {
  projects?: Project[];
  tasks?: Task[];
}) {
  const todayKey = toDayKey(new Date());
  const rows = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const openTasks = projectTasks.filter((task) => !task.completed).length;
    const completedToday = projectTasks.filter(
      (task) =>
        task.completed &&
        toDayKey(task.dateFinish ?? task.date ?? new Date()) === todayKey
    ).length;
    const target = project.dailyStreakTarget ?? 1;
    const progress = Math.min(100, Math.round((completedToday / target) * 100));

    return {
      completedToday,
      isOnTrack: completedToday >= target,
      openTasks,
      progress,
      project,
      target,
    };
  }).sort((a, b) => Number(a.isOnTrack) - Number(b.isOnTrack));

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Project streak tracker
        </CardTitle>
        <CardDescription>
          Complete each project&apos;s daily task target to keep its streak alive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map(
              ({ completedToday, isOnTrack, openTasks, progress, project, target }) => (
              <div
                className="min-w-0 rounded-lg border border-border/70 bg-background/75 p-4"
                key={project.id}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {project.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-600" />
                        {project.streakGlobal ?? 0} day streak
                      </span>
                      <span>
                        {completedToday}/{target} tasks today
                      </span>
                      <span>{openTasks} open</span>
                    </div>
                  </div>
                  <Badge variant={isOnTrack ? "default" : "secondary"}>
                    {isOnTrack ? "On track" : "Needs task"}
                  </Badge>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              )
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No projects found. Create a project before tracking streak targets.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TodayTaskBoard({ tasks = [] }: { tasks?: Task[] }) {
  const todayKey = toDayKey(new Date());
  const todayTasks = tasks
    .filter((task) => toDayKey(task.date ?? new Date()) === todayKey)
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Today&apos;s task tracker
        </CardTitle>
        <CardDescription>
          Finish project tasks here to move daily streak targets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {todayTasks.length ? (
          <div className="grid gap-2">
            {todayTasks.map((task) => (
              <div
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/75 p-3 text-sm"
                key={task.id}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{task.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {task.project?.title ?? "Project"}
                  </div>
                </div>
                <Badge variant={task.completed ? "default" : "secondary"}>
                  {task.completed ? "Done" : task.time || "Open"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No tasks scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AppTrackerPage() {
  const { data: projects } = useProjects();
  const { data: tasks, isLoading } = useTask();
  const taskSummary = getTaskSummary(tasks ?? []);
  const todayKey = toDayKey(new Date());
  const completedToday = (tasks ?? []).filter(
    (task) =>
      task.completed &&
      toDayKey(task.dateFinish ?? task.date ?? new Date()) === todayKey
  ).length;
  const openToday = (tasks ?? []).filter(
    (task) => !task.completed && toDayKey(task.date ?? new Date()) === todayKey
  ).length;
  const projectsOnStreak = (projects ?? []).filter(
    (project) => (project.streakGlobal ?? 0) > 0
  ).length;
  const projectsOnTrackToday = (projects ?? []).filter((project) => {
    const todayKey = toDayKey(new Date());
    const completedToday = (tasks ?? []).filter((task) => {
      if (!task.completed || task.projectId !== project.id) {
        return false;
      }

      return toDayKey(task.dateFinish ?? task.date ?? new Date()) === todayKey;
    }).length;

    return completedToday >= (project.dailyStreakTarget ?? 1);
  }).length;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="App tracker"
        title="Project Streaks"
        action={<EntityCreateDialog defaultMode="task" triggerLabel="New task" />}
      />

      <OverviewPanel
        title="Daily project execution"
        description="Track project streaks from completed tasks, not habit check-ins."
        stats={[
          {
            label: "Projects",
            value: projects?.length ?? 0,
            icon: FolderKanban,
          },
          {
            label: "Project streaks",
            value: projectsOnStreak,
            icon: Flame,
          },
          {
            label: "Done today",
            value: completedToday,
            icon: CheckCircle2,
          },
        ]}
        progress={{
          label: `${projectsOnTrackToday}/${projects?.length ?? 0} projects on track`,
          value:
            projects?.length
              ? Math.round((projectsOnTrackToday / projects.length) * 100)
              : 0,
          detail: `Daily targets are based on completed project tasks`,
          icon: ListChecks,
        }}
        focusTitle="Finish today's project work"
        focusDescription="Complete at least each project's daily target to keep momentum visible."
        focusItems={[
          {
            label: "Open today",
            value: openToday,
            icon: ListChecks,
          },
          {
            label: "All pending tasks",
            value: taskSummary.pending,
            icon: Target,
          },
        ]}
      />

      <ProjectStreakBoard projects={projects} tasks={tasks} />

      {isLoading ? (
        <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
          Loading app tracker...
        </p>
      ) : (
        <TodayTaskBoard tasks={tasks} />
      )}
    </div>
  );
}
