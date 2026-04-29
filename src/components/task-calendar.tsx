"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsById } from "@/hooks/useProjectMutations";
import {
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from "@/hooks/useTaskMutation";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskCreateInput } from "@/types/BaseInterfaces";

type CalendarDay = {
  date: Date;
  dayKey: string;
  inMonth: boolean;
};

function toDayKey(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function getMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function getMonthLabel(monthKey: string) {
  return new Date(`${monthKey}-02T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function buildCalendarDays(monthKey: string): CalendarDay[] {
  const [year, month] = monthKey.split("-").map(Number);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstCalendarDay = new Date(firstOfMonth);
  firstCalendarDay.setUTCDate(firstOfMonth.getUTCDate() - firstOfMonth.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCalendarDay);
    date.setUTCDate(firstCalendarDay.getUTCDate() + index);

    return {
      date,
      dayKey: toDayKey(date),
      inMonth: date.getUTCMonth() === month - 1,
    };
  });
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  return getMonthKey(new Date(Date.UTC(year, month - 1 + offset, 1)));
}

function compareTaskTime(a: Task, b: Task) {
  return (a.time ?? "99:99").localeCompare(b.time ?? "99:99");
}

function formatTaskTime(time?: string | null) {
  return time || "Anytime";
}

export function TaskCalendar({
  projects = [],
  tasks = [],
}: {
  projects?: Project[];
  tasks?: Task[];
}) {
  const todayKey = toDayKey(new Date());
  const [visibleMonth, setVisibleMonth] = useState(getMonthKey(new Date()));
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { mutate: createTask, isPending } = useCreateTask();
  const form = useForm<TaskCreateInput>({
    defaultValues: {
      date: selectedDay,
      habitId: "",
      projectId: "",
      time: "",
      title: "",
    },
  });
  const selectedProjectId = useWatch({
    control: form.control,
    name: "projectId",
  });
  const selectedHabitId = useWatch({
    control: form.control,
    name: "habitId",
  });
  const { data: selectedProject } = useProjectsById(selectedProjectId ?? "");
  const availableHabits = selectedProject?.habits ?? [];

  const tasksByDay = useMemo(() => {
    return tasks.reduce<Record<string, Task[]>>((days, task) => {
      const dayKey = toDayKey(task.date ?? new Date());
      days[dayKey] = [...(days[dayKey] ?? []), task];
      return days;
    }, {});
  }, [tasks]);
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth]
  );
  const selectedTasks = tasksByDay[selectedDay] ?? [];

  const selectDay = (dayKey: string) => {
    setSelectedDay(dayKey);
    form.setValue("date", dayKey);
    setIsDayDialogOpen(true);
  };

  const openCreateDialog = (dayKey = selectedDay) => {
    setSelectedDay(dayKey);
    form.setValue("date", dayKey);
    setIsCreateDialogOpen(true);
  };

  const onSubmit = (data: TaskCreateInput) => {
    if (!data.title || !data.projectId || !data.habitId || !data.date) {
      return;
    }

    createTask(data, {
      onSuccess: () => {
        setSelectedDay(data.date ?? selectedDay);
        setVisibleMonth((data.date ?? selectedDay).slice(0, 7));
        form.reset({
          date: data.date,
          habitId: data.habitId,
          projectId: data.projectId,
          time: data.time ?? "",
          title: "",
        });
      },
    });
  };

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Task calendar
          </CardTitle>
          <CardDescription>
            Pick a day to review work or schedule a task for a future date.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            type="button"
            onClick={() => openCreateDialog()}
          >
            <Plus className="h-4 w-4" />
            Add task
          </Button>
          <Button
            size="icon"
            type="button"
            variant="outline"
            onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-36 text-center text-sm font-semibold">
            {getMonthLabel(visibleMonth)}
          </div>
          <Button
            size="icon"
            type="button"
            variant="outline"
            onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-w-0">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayTasks = tasksByDay[day.dayKey] ?? [];
              const sortedDayTasks = [...dayTasks].sort(compareTaskTime);
              const isSelected = selectedDay === day.dayKey;

              return (
                <button
                  className={cn(
                    "flex min-h-20 min-w-0 flex-col rounded-md border border-border/60 p-1.5 text-left transition hover:bg-secondary/45 sm:min-h-24 xl:min-h-28",
                    !day.inMonth && "opacity-45",
                    isSelected && "border-primary bg-primary/10",
                    day.dayKey === todayKey && !isSelected && "border-primary/45"
                  )}
                  key={day.dayKey}
                  onClick={() => selectDay(day.dayKey)}
                  type="button"
                >
                  <span className="text-xs font-semibold">
                    {day.date.getUTCDate()}
                  </span>
                  {sortedDayTasks.length ? (
                    <span className="mt-1 grid gap-0.5">
                      {sortedDayTasks.slice(0, 4).map((task) => (
                        <span
                          className="truncate rounded-sm bg-secondary px-1 py-0.5 text-[10px] font-medium leading-4 text-muted-foreground"
                          key={task.id}
                          title={task.title}
                        >
                          {task.time ? `${task.time} ` : ""}
                          {task.title}
                        </span>
                      ))}
                      {sortedDayTasks.length > 4 ? (
                        <span className="px-1 text-[10px] font-medium leading-4 text-muted-foreground">
                          +{sortedDayTasks.length - 4} more
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {new Date(`${selectedDay}T00:00:00.000Z`).toLocaleDateString(
                "en-US",
                {
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                  year: "numeric",
                }
              )}
            </DialogTitle>
            <DialogDescription>
              Review, edit, or delete the tasks scheduled for this date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Button
              className="w-fit gap-2"
              type="button"
              onClick={() => {
                setIsDayDialogOpen(false);
                openCreateDialog(selectedDay);
              }}
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
            {selectedTasks.length ? (
              [...selectedTasks].sort(compareTaskTime).map((task) => (
                <CalendarTaskDialogRow key={task.id} task={task} />
              ))
            ) : (
              <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
                No tasks on this day.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
            <DialogDescription>
              Choose a date, project, and habit for the new task.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
            <Input
              {...form.register("title", { required: true })}
              className="h-11"
              placeholder="Task title"
            />
            <Input
              {...form.register("date", { required: true })}
              className="h-11"
              type="date"
            />
            <Input
              {...form.register("time")}
              className="h-11"
              type="time"
            />
            <Controller
              name="projectId"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("habitId", "");
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Projects</SelectLabel>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name="habitId"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={!selectedProjectId || availableHabits.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Habit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Habits</SelectLabel>
                      {availableHabits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>
                          {habit.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <Button
              disabled={
                isPending ||
                !projects.length ||
                !selectedProjectId ||
                !selectedHabitId
              }
              type="submit"
            >
              {isPending ? "Adding..." : "Schedule task"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CalendarTaskDialogRow({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<Task>({
    defaultValues: {
      date: toDayKey(task.date ?? new Date()),
      time: task.time ?? "",
      title: task.title,
    },
  });
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(task.id);

  const onSave = (data: Task) => {
    updateTask(
      {
        id: task.id,
        data: {
          id: task.id,
          date: data.date,
          time: data.time,
          title: data.title,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const onToggleComplete = (checked: boolean) => {
    const taskFinishedAt = new Date();

    updateTask({
      id: task.id,
      data: {
        id: task.id,
        completed: checked,
        dateFinish: taskFinishedAt,
      },
    });
  };

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => onToggleComplete(Boolean(checked))}
            className="mt-1"
          />
          {isEditing ? (
            <form
              className="grid min-w-0 flex-1 gap-2"
              onSubmit={form.handleSubmit(onSave)}
            >
              <Input
                {...form.register("title", { required: true })}
                className="h-10"
              />
              <Input
                {...form.register("date", { required: true })}
                className="h-10"
                type="date"
              />
              <Input
                {...form.register("time")}
                className="h-10"
                type="time"
              />
              <div className="flex flex-wrap gap-2">
                <Button disabled={isUpdating} size="sm" type="submit">
                  <Check className="h-4 w-4" />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="min-w-0">
              <div className="mb-1 inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {formatTaskTime(task.time)}
              </div>
              <div
                className={cn(
                  "truncate text-sm font-medium",
                  task.completed && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {task.project?.title ?? "Project"}{" "}
                {task.habit?.title ? `- ${task.habit.title}` : ""}
              </div>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="flex shrink-0 justify-end gap-2">
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              disabled={isDeleting}
              onClick={() => deleteTask(task.id)}
              size="sm"
              type="button"
              variant="destructive"
            >
              <Trash className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
