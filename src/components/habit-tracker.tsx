"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Bell, Check, Flame, Plus, Repeat } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHabits, useUpdateHabits } from "@/hooks/useHabitMutations";
import { cn } from "@/lib/utils";
import type { Habit, HabitCreateInput, Project } from "@/types/BaseInterfaces";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecentDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - index - 1));

    return {
      dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
      key: toDateKey(date),
      shortLabel: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
    };
  });
}

function calculateCurrentStreak(history: string[]) {
  const completedDays = new Set(history);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let streak = 0;

  while (completedDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function formatFrequency(value?: string) {
  return value === "weekly" ? "Weekly" : "Daily";
}

export function HabitTracker({
  habits = [],
  projects = [],
}: {
  habits?: Habit[];
  projects?: Project[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const days = getRecentDays(21);
  const { mutate: createHabit, isPending: isCreating } = useCreateHabits();
  const { mutate: updateHabit, isPending: isUpdating } = useUpdateHabits();
  const createForm = useForm<HabitCreateInput>({
    defaultValues: {
      frequency: "daily",
      projectId: "",
      reminderTime: "",
      title: "",
    },
  });

  const visibleDayCount = days.length;
  const habitsPerPage = 5;
  const totalPages = Math.ceil(habits.length / habitsPerPage);
  const currentHabitPage = Math.min(currentPage, totalPages || 1);
  const visibleHabits = habits.slice(
    (currentHabitPage - 1) * habitsPerPage,
    currentHabitPage * habitsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleDay = (habit: Habit, dayKey: string) => {
    const history = new Set(habit.history ?? []);

    if (history.has(dayKey)) {
      history.delete(dayKey);
    } else {
      history.add(dayKey);
    }

    const nextHistory = Array.from(history).sort();

    updateHabit({
      id: habit.id,
      data: {
        frequency: habit.frequency || "daily",
        history: nextHistory,
        projectId: habit.projectId,
        reminderTime: habit.reminderTime ?? "",
        streak: calculateCurrentStreak(nextHistory),
        title: habit.title,
      },
    });
  };

  const onCreateHabit = (data: HabitCreateInput) => {
    if (!data.title || !data.projectId) {
      return;
    }

    createHabit(data, {
      onSuccess: () => {
        createForm.reset({
          frequency: data.frequency ?? "daily",
          projectId: data.projectId,
          reminderTime: data.reminderTime ?? "",
          title: "",
        });
        setIsCreateOpen(false);
      },
    });
  };

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Habit tracker</CardTitle>
          <CardDescription>
            Create habits, set cadence, and mark check-ins without making every
            routine responsible for the main project streak.
          </CardDescription>
        </div>
        <Button
          className="gap-2"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Create habit
        </Button>
      </CardHeader>
      <CardContent>
        {habits.length ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[minmax(220px,1.2fr)_120px_110px_120px_repeat(21,minmax(30px,1fr))] gap-1 border-b border-border/70 pb-2">
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Habit
                  </div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Frequency
                  </div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Reminder
                  </div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Stats
                  </div>
                  {days.map((day) => (
                    <div
                      className="text-center text-[10px] font-medium text-muted-foreground"
                      key={day.key}
                      title={day.shortLabel}
                    >
                      <div>{day.dayLabel.slice(0, 1)}</div>
                      <div>{day.shortLabel.split(" ")[1]}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 pt-2">
                  {visibleHabits.map((habit) => {
                    const visibleCompleted = days.filter((day) =>
                      habit.history?.includes(day.key)
                    ).length;
                    const progressPercent = Math.round(
                      (visibleCompleted / visibleDayCount) * 100
                    );

                    return (
                      <div
                        className="grid grid-cols-[minmax(220px,1.2fr)_120px_110px_120px_repeat(21,minmax(30px,1fr))] items-center gap-1 rounded-lg border border-border/60 p-2"
                        key={habit.id}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {habit.title}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">
                            {habit.project?.title ?? "No project"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <Repeat className="h-3.5 w-3.5 text-primary" />
                          {formatFrequency(habit.frequency)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Bell className="h-3.5 w-3.5" />
                          {habit.reminderTime || "None"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                            <Flame className="h-3.5 w-3.5" />
                            {habit.streak ?? 0}
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-emerald-600"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {visibleCompleted}/{visibleDayCount}
                          </div>
                        </div>
                        {days.map((day) => {
                          const isCompleted = habit.history?.includes(day.key);

                          return (
                            <Button
                              className={cn(
                                "h-8 w-full rounded-sm p-0",
                                isCompleted
                                  ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "bg-background hover:bg-secondary"
                              )}
                              disabled={isUpdating}
                              key={`${habit.id}-${day.key}`}
                              onClick={() => toggleDay(habit, day.key)}
                              title={`${habit.title} - ${day.shortLabel}`}
                              type="button"
                              variant={isCompleted ? "default" : "outline"}
                            >
                              {isCompleted ? <Check className="h-3.5 w-3.5" /> : null}
                            </Button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {totalPages > 1 ? (
              <Pagination>
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious
                      className={
                        currentHabitPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(currentHabitPage - 1);
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentHabitPage}
                          onClick={(event) => {
                            event.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      className={
                        currentHabitPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(currentHabitPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No habits found. Create a habit first, then track it here.
          </p>
        )}
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create habit</DialogTitle>
            <DialogDescription>
              Add cadence and reminder context before tracking starts.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={createForm.handleSubmit(onCreateHabit)}
          >
            <Input
              {...createForm.register("title", { required: true })}
              className="h-11"
              placeholder="Habit name"
            />
            <Controller
              name="projectId"
              control={createForm.control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
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
              name="frequency"
              control={createForm.control}
              render={({ field }) => (
                <Select
                  value={field.value || "daily"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              {...createForm.register("reminderTime")}
              className="h-11"
              type="time"
            />
            <Button disabled={isCreating || !projects.length} type="submit">
              {isCreating ? "Creating..." : "Create habit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
