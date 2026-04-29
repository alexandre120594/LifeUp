"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FolderKanban,
  LayoutGrid,
  List,
  ListTodo,
  Plus,
  Repeat,
  Trash,
} from "lucide-react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import {
  buildWeekDayPlans,
  buildWeeklyProjectPlans,
  getCurrentWeek,
} from "@/lib/weekly-organizer";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/BaseInterfaces";

type WeekProjectAssignments = Record<string, string[]>;
type BoardView = "grid" | "list";
type HabitDialogDay = {
  label: string;
  dateLabel: string;
  habits: HabitDisplayItem[];
} | null;
type HabitDisplayItem = {
  id: string;
  title: string;
  cadence: "Daily" | "Weekly";
};

function buildDefaultAssignments(projects: Project[], week: ReturnType<typeof getCurrentWeek>) {
  const assignments = Object.fromEntries(
    week.map((day) => [day.key, [] as string[]])
  ) as WeekProjectAssignments;

  projects.forEach((project, index) => {
    const day = week[index % week.length];

    if (day) {
      assignments[day.key].push(project.id);
    }
  });

  return assignments;
}

function ProjectPlannerCard({
  project,
  dayKey,
  week,
  onMove,
  onRemoveFromWeek,
}: {
  project: Project;
  dayKey: string;
  week: ReturnType<typeof getCurrentWeek>;
  onMove: (nextDayKey: string) => void;
  onRemoveFromWeek: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title={project.title}
        onClick={() => setIsDialogOpen(true)}
        className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-lg border border-border/60 bg-card px-3 py-2.5 text-left text-sm shadow-sm transition-colors hover:border-primary/30 hover:bg-secondary/45"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: project.color || "#94a3b8" }}
        />
        <span className="min-w-0 truncate font-medium">{project.title}</span>
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{project.title}</DialogTitle>
            <DialogDescription>
              Change this project&apos;s day or remove it from this week.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-w-0 gap-3">
            <Select
              value={dayKey}
              onValueChange={(nextDayKey) => {
                onMove(nextDayKey);
                setIsDialogOpen(false);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Move to day" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Move to</SelectLabel>
                  {week.map((day) => (
                    <SelectItem key={day.key} value={day.key}>
                      {day.label} {day.dateLabel}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link href={`/projects/${project.id}`}>Open project</Link>
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onRemoveFromWeek();
                setIsDialogOpen(false);
              }}
              className="h-11 rounded-xl"
            >
              <Trash className="h-4 w-4" />
              Remove from week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function WeeklyOrganizerPage() {
  const referenceDate = useMemo(() => new Date(), []);
  const week = useMemo(() => getCurrentWeek(referenceDate), [referenceDate]);
  const weekStorageKey = `lifeup-weekly-organizer:${week[0]?.key ?? "current"}`;
  const [assignments, setAssignments] = useState<WeekProjectAssignments | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }

      const saved = window.localStorage.getItem(weekStorageKey);

      if (!saved) {
        return null;
      }

      try {
        return JSON.parse(saved) as WeekProjectAssignments;
      } catch {
        return null;
      }
    }
  );
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState(week[0]?.key ?? "");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [habitDialogDay, setHabitDialogDay] = useState<HabitDialogDay>(null);
  const [boardView, setBoardView] = useState<BoardView>("grid");

  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTask();
  const { data: habits = [] } = useHabit();
  const effectiveAssignments = useMemo(
    () => assignments ?? buildDefaultAssignments(projects, week),
    [assignments, projects, week]
  );

  useEffect(() => {
    if (assignments && Object.keys(assignments).length > 0) {
      window.localStorage.setItem(weekStorageKey, JSON.stringify(assignments));
    }
  }, [assignments, weekStorageKey]);

  const weekPlans = useMemo(
    () => buildWeekDayPlans(tasks, habits, projects, referenceDate),
    [tasks, habits, projects, referenceDate]
  );
  const projectPlans = useMemo(
    () => buildWeeklyProjectPlans(projects, tasks, habits, referenceDate),
    [projects, tasks, habits, referenceDate]
  );
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );
  const selectedDayProjectIds = useMemo(
    () => new Set(effectiveAssignments[selectedDayKey] ?? []),
    [effectiveAssignments, selectedDayKey]
  );
  const availableProjects = projects.filter(
    (project) => !selectedDayProjectIds.has(project.id)
  );
  const weekTasks = weekPlans.flatMap((day) => day.tasks);
  const pendingWeekTasks = weekTasks.filter((task) => !task.completed);
  const completedWeekTasks = weekTasks.length - pendingWeekTasks.length;
  const weekRange =
    week.length > 0
      ? `${week[0].dateLabel} - ${week[week.length - 1].dateLabel}`
      : "Current week";

  const addProjectToDay = () => {
    if (!selectedProjectId || !selectedDayKey) {
      return;
    }

    setAssignments((current) => {
      const source = current ?? effectiveAssignments;
      const currentDayProjects = source[selectedDayKey] ?? [];

      if (currentDayProjects.includes(selectedProjectId)) {
        return source;
      }

      return {
        ...source,
        [selectedDayKey]: [...currentDayProjects, selectedProjectId],
      };
    });
    setSelectedProjectId("");
    setIsAddDialogOpen(false);
  };

  const removeProjectFromWeek = (projectId: string) => {
    setAssignments((current) => ({
      ...(current ?? effectiveAssignments),
      ...Object.fromEntries(
        Object.entries(current ?? effectiveAssignments).map(([key, ids]) => [
          key,
          ids.filter((id) => id !== projectId),
        ])
      ),
    }));
  };

  const moveProjectToDay = (
    currentDayKey: string,
    projectId: string,
    nextDayKey: string
  ) => {
    if (currentDayKey === nextDayKey) {
      return;
    }

    setAssignments((current) => {
      const source = current ?? effectiveAssignments;
      const nextDayProjects = source[nextDayKey] ?? [];

      if (nextDayProjects.includes(projectId)) {
        return {
          ...source,
          [currentDayKey]: (source[currentDayKey] ?? []).filter(
            (id) => id !== projectId
          ),
        };
      }

      return {
        ...source,
        [currentDayKey]: (source[currentDayKey] ?? []).filter(
          (id) => id !== projectId
        ),
        [nextDayKey]: [...nextDayProjects, projectId],
      };
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Weekly organizer"
        title={`Plan ${weekRange}`}
      />

      <OverviewPanel
        eyebrow="This week"
        title="Distribute projects and habits across the current week."
        description="Current Monday-to-Sunday view based on today's date."
        stats={[
          {
            label: "Projects",
            value: projects.length,
            icon: FolderKanban,
          },
          {
            label: "Habits",
            value: habits.length,
            icon: Repeat,
          },
          {
            label: "Tracked tasks",
            value: weekTasks.length,
            icon: ListTodo,
          },
        ]}
        progress={{
          label: `${weekTasks.length ? Math.round((completedWeekTasks / weekTasks.length) * 100) : 0}% done this week`,
          value: weekTasks.length
            ? Math.round((completedWeekTasks / weekTasks.length) * 100)
            : 0,
          detail: `${completedWeekTasks} done, ${pendingWeekTasks.length} still open`,
          icon: CheckCircle2,
          }}
        focusTitle="Tracker"
        focusDescription="Task progress stays visible without filling the week board."
        focusItems={[
          {
            label: "Open tasks",
            value: pendingWeekTasks.length,
            icon: ListTodo,
          },
          {
            label: "Habits",
            value: habits.length,
            icon: Repeat,
          },
        ]}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setIsAddDialogOpen(true)}
          className="h-11 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Add existing project
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add existing project</DialogTitle>
            <DialogDescription>
              Choose a project and the day it should appear in this week.
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-w-0 gap-3">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Projects</SelectLabel>
                {availableProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedDayKey} onValueChange={setSelectedDayKey}>
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Choose day" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>This week</SelectLabel>
                {week.map((day) => (
                  <SelectItem key={day.key} value={day.key}>
                    {day.label} {day.dateLabel}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>
          <DialogFooter>
          <Button
            type="button"
            onClick={addProjectToDay}
            disabled={!selectedProjectId || !selectedDayKey}
            className="h-11 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Week board</CardTitle>
              <CardDescription>
                Projects and habits distributed across the current week.
              </CardDescription>
            </div>
            <div className="grid w-full grid-cols-2 rounded-lg border border-border/70 bg-background p-1 sm:w-auto">
              <Button
                type="button"
                variant={boardView === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setBoardView("grid")}
                className="rounded-md"
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                type="button"
                variant={boardView === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setBoardView("list")}
                className="rounded-md"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent
          className={cn(
            "grid min-w-0 gap-3",
            boardView === "grid"
              ? "md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7"
              : "grid-cols-1"
          )}
        >
          {weekPlans.map((day) => {
            const assignedProjects = (effectiveAssignments[day.key] ?? [])
              .map((projectId) => projectsById.get(projectId))
              .filter((project): project is Project => Boolean(project));
            const hasProjectFocus = assignedProjects.length > 0;
            const dayHabitItems: HabitDisplayItem[] = [
              ...day.dailyHabits.map((habit) => ({
                id: habit.id,
                title: habit.title,
                cadence: "Daily" as const,
              })),
              ...day.weeklyHabits.map((habit) => ({
                id: habit.id,
                title: habit.title,
                cadence: "Weekly" as const,
              })),
            ];
            const visibleHabitItems = dayHabitItems.slice(0, 5);
            const hiddenHabitCount = dayHabitItems.length - visibleHabitItems.length;

            return (
              <div
                key={day.key}
                className={cn(
                  "min-w-0 rounded-lg border border-border/70 bg-background/75 p-3",
                  boardView === "grid"
                    ? "flex min-h-[220px] flex-col"
                    : "grid gap-3 md:grid-cols-[150px_minmax(0,1fr)] md:items-start",
                  day.isToday && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold">{day.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {day.dateLabel}
                    </div>
                  </div>
                  {day.isToday ? <Badge>Today</Badge> : null}
                </div>

                <div
                  className={cn(
                    "space-y-2",
                    boardView === "grid" ? "mt-3 flex-1" : "min-w-0"
                  )}
                >
                  <div
                    className={cn(
                      "min-w-0 gap-2",
                      boardView === "grid"
                        ? "space-y-2"
                        : "grid sm:grid-cols-2 xl:grid-cols-3"
                    )}
                  >
                    {hasProjectFocus ? (
                      assignedProjects.map((project) => {
                        return (
                          <ProjectPlannerCard
                            key={project.id}
                            project={project}
                            dayKey={day.key}
                            week={week}
                            onMove={(nextDayKey) =>
                              moveProjectToDay(day.key, project.id, nextDayKey)
                            }
                            onRemoveFromWeek={() =>
                              removeProjectFromWeek(project.id)
                            }
                          />
                        );
                      })
                    ) : (
                      <div className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
                        No project focus.
                      </div>
                    )}
                  </div>

                  {hasProjectFocus ? (
                    <div
                      className={cn(
                        "gap-1.5 pt-1",
                        boardView === "grid"
                          ? "space-y-1.5"
                          : "flex flex-wrap items-center"
                      )}
                    >
                      {visibleHabitItems.map((habit) => (
                        <Link
                          href={`/habits/${habit.id}`}
                          key={habit.id}
                          className={cn(
                            "flex min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition-colors",
                            habit.cadence === "Weekly"
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "bg-secondary/35 hover:bg-secondary/55",
                            boardView === "list" && "w-fit max-w-full"
                          )}
                        >
                          <span className="min-w-0 truncate">{habit.title}</span>
                          <Badge
                            variant={
                              habit.cadence === "Daily" ? "secondary" : "default"
                            }
                            className="shrink-0"
                          >
                            {habit.cadence}
                          </Badge>
                        </Link>
                      ))}
                      {hiddenHabitCount > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setHabitDialogDay({
                              label: day.label,
                              dateLabel: day.dateLabel,
                              habits: dayHabitItems,
                            })
                          }
                          className={cn(
                            "h-auto justify-start rounded-lg bg-secondary/20 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/35",
                            boardView === "list" && "w-fit max-w-full"
                          )}
                        >
                          +{hiddenHabitCount} more habits
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(habitDialogDay)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setHabitDialogDay(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {habitDialogDay?.label} habits
            </DialogTitle>
            <DialogDescription>
              {habitDialogDay?.dateLabel}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] min-w-0 gap-2 overflow-y-auto pr-1">
            {habitDialogDay?.habits.map((habit) => (
              <Link
                href={`/habits/${habit.id}`}
                key={habit.id}
                onClick={() => setHabitDialogDay(null)}
                className={cn(
                  "flex min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  habit.cadence === "Weekly"
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "bg-secondary/35 hover:bg-secondary/55"
                )}
              >
                <span className="min-w-0 truncate font-medium">{habit.title}</span>
                <Badge
                  variant={habit.cadence === "Daily" ? "secondary" : "default"}
                  className="shrink-0"
                >
                  {habit.cadence}
                </Badge>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="min-w-0 border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Project focus</CardTitle>
          <CardDescription>Projects included in this week&apos;s distribution.</CardDescription>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projectPlans.length ? (
            projectPlans.map((plan) => (
              <Link
                href={`/projects/${plan.project.id}`}
                key={plan.project.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/75 p-4 transition-colors hover:bg-secondary/35"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{plan.project.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {plan.tasks.length} tasks, {plan.habits.length} habits
                  </div>
                </div>
                <Badge variant={plan.pendingTasks ? "default" : "secondary"}>
                  {plan.pendingTasks} open
                </Badge>
              </Link>
            ))
          ) : (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              No projects or habits exist yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
