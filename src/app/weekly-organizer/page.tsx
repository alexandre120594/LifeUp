"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListChecks,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
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
  useCreateWeeklyPlanSlot,
  useDeleteWeeklyPlanSlot,
  useUpdateWeeklyPlanSlot,
  useWeeklyPlan,
} from "@/hooks/useWeeklyPlanMutations";
import { buildWeekDayPlans, getCurrentWeek } from "@/lib/weekly-organizer";
import { cn } from "@/lib/utils";
import type {
  Habit,
  Project,
  Task,
  WeeklyPlanSlot,
  WeeklyPlanSlotInput,
} from "@/types/BaseInterfaces";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

type SlotDialogState = {
  dayIndex: number;
  hour: number;
  slot?: WeeklyPlanSlot;
} | null;

type SlotDetailState = {
  dateLabel: string;
  dayIndex: number;
  dayLabel: string;
  hour: number;
  slot?: WeeklyPlanSlot;
} | null;

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getHabitProjectLabel(habit?: Habit) {
  return habit?.project?.title ?? "No project";
}

function getSlotHabitIds(slot?: WeeklyPlanSlot) {
  return slot?.habits.map((item) => item.habitId) ?? [];
}

function getSlotTaskIds(slot?: WeeklyPlanSlot) {
  return slot?.tasks?.map((item) => item.taskId) ?? [];
}

export default function WeeklyOrganizerPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const referenceDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + weekOffset * 7);
    return date;
  }, [weekOffset]);
  const week = useMemo(() => getCurrentWeek(referenceDate), [referenceDate]);
  const weekStartKey = week[0]?.key ?? "";

  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTask();
  const { data: habits = [] } = useHabit();
  const { data: board, isLoading } = useWeeklyPlan(weekStartKey);
  const weekPlans = useMemo(
    () => buildWeekDayPlans(tasks, habits, projects, referenceDate),
    [tasks, habits, projects, referenceDate]
  );
  const weekTasks = weekPlans.flatMap((day) => day.tasks);
  const pendingWeekTasks = weekTasks.filter((task) => !task.completed);
  const scheduledItems = (board?.slots ?? []).reduce(
    (total, slot) =>
      total + slot.habits.length + (slot.tasks?.length ?? 0),
    0
  );
  const weekRange =
    week.length > 0
      ? `${week[0].dateLabel} - ${week[week.length - 1].dateLabel}`
      : "Current week";

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHero
        badgeIcon={CalendarRange}
        badgeLabel="Life planning"
        title="Weekly Plan"
        description="Plan the habits and tasks that belong to your life routines. Study scheduling now lives in the Study workspace."
        stats={[
          { label: "Week tasks", value: weekTasks.length },
          { label: "Pending", value: pendingWeekTasks.length },
          { label: "Scheduled", value: scheduledItems },
        ]}
      />

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{weekRange}</div>
          <div className="text-xs text-muted-foreground">
            {weekTasks.length} tasks in this week / {habits.length} habits available
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="rounded-lg"
            onClick={() => setWeekOffset((current) => current - 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous week
          </Button>
          <Button
            className="rounded-lg"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(0)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Current week
          </Button>
          <Button
            className="rounded-lg"
            onClick={() => setWeekOffset((current) => current + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Next week
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <WeeklyPlanBoard
        boardSlots={board?.slots ?? []}
        habits={habits}
        isLoading={isLoading}
        projects={projects}
        tasks={tasks}
        week={week}
        weekStartKey={weekStartKey}
      />
    </div>
  );
}

function WeeklyPlanBoard({
  boardSlots,
  habits,
  isLoading,
  projects,
  tasks,
  week,
  weekStartKey,
}: {
  boardSlots: WeeklyPlanSlot[];
  habits: Habit[];
  isLoading: boolean;
  projects: Project[];
  tasks: Task[];
  week: ReturnType<typeof getCurrentWeek>;
  weekStartKey: string;
}) {
  const [slotDialog, setSlotDialog] = useState<SlotDialogState>(null);
  const [slotDetail, setSlotDetail] = useState<SlotDetailState>(null);
  const { mutate: createSlot, isPending: isCreating } = useCreateWeeklyPlanSlot();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateWeeklyPlanSlot();
  const { mutate: deleteSlot, isPending: isDeleting } =
    useDeleteWeeklyPlanSlot(weekStartKey);
  const slotsByDay = useMemo(() => {
    return week.map((_, dayIndex) =>
      boardSlots
        .filter((slot) => slot.dayIndex === dayIndex)
        .sort((a, b) => a.hour - b.hour)
    );
  }, [boardSlots, week]);

  const saveSlot = (data: WeeklyPlanSlotInput, slotId?: string) => {
    if (slotId) {
      updateSlot({ id: slotId, data }, { onSuccess: () => setSlotDialog(null) });
      return;
    }

    createSlot(data, { onSuccess: () => setSlotDialog(null) });
  };

  const deleteCell = (slot?: WeeklyPlanSlot) => {
    if (slot?.id) {
      deleteSlot(slot.id);
    }
  };

  return (
    <>
      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Weekly board
              </CardTitle>
              <CardDescription>
                Assign habits and tasks to one-hour blocks from Monday to Sunday.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{boardSlots.length} slots</Badge>
              <Badge variant="outline">{tasks.length} tasks</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              Loading weekly board...
            </p>
          ) : (
            <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-7">
              {week.map((day, dayIndex) => (
                <div
                  className={cn(
                    "flex min-h-[260px] min-w-0 flex-col rounded-lg border border-border/70 bg-background/75 p-3",
                    day.isToday && "border-primary/50 bg-primary/5"
                  )}
                  key={day.key}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold">{day.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {day.dateLabel}
                      </div>
                    </div>
                    {day.isToday ? <Badge>Today</Badge> : null}
                  </div>

                  <div className="grid min-w-0 flex-1 content-start gap-2">
                    {slotsByDay[dayIndex].length ? (
                      slotsByDay[dayIndex].map((slot) => {
                        const key = `${dayIndex}-${slot.hour}`;

                        return (
                        <SlotCell
                          disabled={isDeleting}
                          key={key}
                          onDelete={() => deleteCell(slot)}
                          onEdit={() =>
                            setSlotDialog({ dayIndex, hour: slot.hour, slot })
                          }
                          onOpenDetails={() =>
                            setSlotDetail({
                              dateLabel: day.dateLabel,
                              dayIndex,
                              dayLabel: day.label,
                              hour: slot.hour,
                              slot,
                            })
                          }
                          slot={slot}
                        />
                        );
                      })
                    ) : (
                      <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
                        No blocks planned.
                      </div>
                    )}
                  </div>

                  <Button
                    className="mt-3 w-full justify-center"
                    onClick={() => setSlotDialog({ dayIndex, hour: 9 })}
                    type="button"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Add block
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SlotDetailsDialog
        onClose={() => setSlotDetail(null)}
        onDelete={(detail) => {
          deleteCell(detail.slot);
          setSlotDetail(null);
        }}
        onEdit={(detail) => {
          setSlotDialog({
            dayIndex: detail.dayIndex,
            hour: detail.hour,
            slot: detail.slot,
          });
          setSlotDetail(null);
        }}
        slotDetail={slotDetail}
      />

      {slotDialog ? (
        <SlotDialog
          habits={habits}
          isSaving={isCreating || isUpdating}
          onClose={() => setSlotDialog(null)}
          onSave={(data) => saveSlot(data, slotDialog.slot?.id)}
          projects={projects}
          slotDialog={slotDialog}
          tasks={tasks}
          week={week}
          weekStartKey={weekStartKey}
        />
      ) : null}
    </>
  );
}

function SlotCell({
  disabled,
  onDelete,
  onEdit,
  onOpenDetails,
  slot,
}: {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onOpenDetails: () => void;
  slot: WeeklyPlanSlot;
}) {
  const slotHabits = slot.habits
    .map((item) => item.habit)
    .filter((habit): habit is Habit => Boolean(habit));
  const slotTasks =
    slot.tasks
      ?.map((item) => item.task)
      .filter((task): task is Task => Boolean(task)) ?? [];
  const totalItems = slotHabits.length + slotTasks.length;
  const firstItem = slotHabits[0]?.title ?? slotTasks[0]?.title;

  return (
    <div className="h-full min-w-0 rounded-md border border-border/70 bg-card p-1.5 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-1">
        <button
          className="min-w-0 flex-1 text-left"
          onClick={onOpenDetails}
          type="button"
        >
          <div className="flex min-w-0 items-center gap-1 text-[11px] font-semibold">
            <Clock className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">{formatHour(slot.hour)}</span>
            <span className="shrink-0 text-muted-foreground">{totalItems}</span>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-0.5 opacity-80">
          <Button
            aria-label="Edit slot"
            className="h-6 w-6 rounded-md"
            onClick={onEdit}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            aria-label="Delete slot"
            className="h-6 w-6 rounded-md text-destructive hover:text-destructive"
            disabled={disabled}
            onClick={onDelete}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <button
        className="mt-1 grid w-full min-w-0 gap-0.5 text-left"
        onClick={onOpenDetails}
        type="button"
      >
        {totalItems ? (
          <>
            <div className="truncate rounded bg-secondary/35 px-1.5 py-1 text-[11px] font-medium">
              {firstItem}
            </div>
            {totalItems > 1 ? (
              <div className="truncate text-[10px] text-muted-foreground">
                +{totalItems - 1} more
              </div>
            ) : null}
          </>
        ) : (
          <div className="truncate rounded bg-secondary/25 px-1.5 py-1 text-[11px] text-muted-foreground">
            Empty slot
          </div>
        )}
      </button>
    </div>
  );
}

function SlotDetailsDialog({
  onClose,
  onDelete,
  onEdit,
  slotDetail,
}: {
  onClose: () => void;
  onDelete: (detail: Exclude<SlotDetailState, null>) => void;
  onEdit: (detail: Exclude<SlotDetailState, null>) => void;
  slotDetail: SlotDetailState;
}) {
  const slotHabits =
    slotDetail?.slot?.habits
      .map((item) => item.habit)
      .filter((habit): habit is Habit => Boolean(habit)) ?? [];
  const slotTasks =
    slotDetail?.slot?.tasks
      ?.map((item) => item.task)
      .filter((task): task is Task => Boolean(task)) ?? [];

  return (
    <Dialog open={Boolean(slotDetail)} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {slotDetail
              ? `${slotDetail.dayLabel} ${formatHour(slotDetail.hour)}`
              : "Time slot"}
          </DialogTitle>
          <DialogDescription>{slotDetail?.dateLabel}</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] min-w-0 gap-2 overflow-y-auto pr-1">
          {slotHabits.length || slotTasks.length ? (
            <>
              {slotHabits.map((habit) => (
                <Link
                  className="min-w-0 rounded-lg border border-border/70 bg-background/75 p-3 transition-colors hover:bg-secondary/35"
                  href={`/habits/${habit.id}`}
                  key={habit.id}
                  onClick={onClose}
                >
                  <div className="truncate font-medium">{habit.title}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {getHabitProjectLabel(habit)}
                  </div>
                </Link>
              ))}
              {slotTasks.map((task) => (
                <Link
                  className="min-w-0 rounded-lg border border-border/70 bg-background/75 p-3 transition-colors hover:bg-secondary/35"
                  href={`/tasks/${task.id}`}
                  key={task.id}
                  onClick={onClose}
                >
                  <div className="truncate font-medium">{task.title}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {task.project?.title ?? "No project"}
                    {task.habit?.title ? ` - ${task.habit.title}` : ""}
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
              No habits or tasks assigned.
            </div>
          )}
        </div>

        {slotDetail ? (
          <DialogFooter>
            <Button
              onClick={() => onDelete(slotDetail)}
              type="button"
              variant="destructive"
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
            <Button onClick={() => onEdit(slotDetail)} type="button">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SlotDialog({
  habits,
  isSaving,
  onClose,
  onSave,
  projects,
  slotDialog,
  tasks,
  week,
  weekStartKey,
}: {
  habits: Habit[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: WeeklyPlanSlotInput) => void;
  projects: Project[];
  slotDialog: Exclude<SlotDialogState, null>;
  tasks: Task[];
  week: ReturnType<typeof getCurrentWeek>;
  weekStartKey: string;
}) {
  const [dayIndex, setDayIndex] = useState(String(slotDialog.dayIndex));
  const [hour, setHour] = useState(String(slotDialog.hour));
  const [projectId, setProjectId] = useState("all");
  const [habitIds, setHabitIds] = useState<string[]>(
    getSlotHabitIds(slotDialog.slot)
  );
  const [taskIds, setTaskIds] = useState<string[]>(
    getSlotTaskIds(slotDialog.slot)
  );
  const filteredHabits =
    projectId === "all"
      ? habits
      : habits.filter((habit) => habit.projectId === projectId);
  const filteredTasks =
    projectId === "all"
      ? tasks
      : tasks.filter((task) => task.projectId === projectId);

  const toggleHabit = (habitId: string, checked: boolean) => {
    setHabitIds((current) =>
      checked
        ? Array.from(new Set([...current, habitId]))
        : current.filter((id) => id !== habitId)
    );
  };

  const toggleTask = (taskId: string, checked: boolean) => {
    setTaskIds((current) =>
      checked
        ? Array.from(new Set([...current, taskId]))
        : current.filter((id) => id !== taskId)
    );
  };

  const handleSave = () => {
    onSave({
      dayIndex: Number(dayIndex),
      habitIds,
      hour: Number(hour),
      taskIds,
      weekStartKey,
    });
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {slotDialog.slot ? "Edit weekly slot" : "Add weekly slot"}
          </DialogTitle>
          <DialogDescription>
            Assign habits and tasks to one hour in the selected week.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-w-0 gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Day
              <Select value={dayIndex} onValueChange={setDayIndex}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Weekday</SelectLabel>
                    {week.map((day, index) => (
                      <SelectItem key={day.key} value={String(index)}>
                        {day.label} {day.dateLabel}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Hour
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Hour</SelectLabel>
                    {HOURS.map((item) => (
                      <SelectItem key={item} value={String(item)}>
                        {formatHour(item)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium">
            Project filter
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="grid max-h-[45vh] min-w-0 gap-4 overflow-y-auto pr-1">
            <div className="grid gap-2">
              <div className="text-sm font-semibold">Habits</div>
              {filteredHabits.length ? (
                filteredHabits.map((habit) => {
                  const checked = habitIds.includes(habit.id);

                  return (
                    <label
                      className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/75 p-3 text-sm"
                      key={habit.id}
                    >
                      <Checkbox
                        checked={checked}
                        className="mt-0.5"
                        onCheckedChange={(value) =>
                          toggleHabit(habit.id, value === true)
                        }
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {habit.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {getHabitProjectLabel(habit)}
                          {habit.reminderTime ? ` - ${habit.reminderTime}` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
                  No habits for this filter.
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold">Tasks</div>
              {filteredTasks.length ? (
                filteredTasks.map((task) => {
                  const checked = taskIds.includes(task.id);

                  return (
                    <label
                      className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/75 p-3 text-sm"
                      key={task.id}
                    >
                      <Checkbox
                        checked={checked}
                        className="mt-0.5"
                        onCheckedChange={(value) =>
                          toggleTask(task.id, value === true)
                        }
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {task.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {task.project?.title ?? "No project"}
                          {task.habit?.title ? ` - ${task.habit.title}` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
                  No tasks for this filter.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSave} type="button">
            {isSaving ? "Saving..." : "Save hour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
