"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListTodo,
  Pencil,
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
  dayLabel: string;
  dateLabel: string;
  slot: WeeklyPlanSlot;
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
  const { data: board, isLoading: isBoardLoading } = useWeeklyPlan(weekStartKey);
  const weekPlans = useMemo(
    () => buildWeekDayPlans(tasks, habits, projects, referenceDate),
    [tasks, habits, projects, referenceDate]
  );
  const weekTasks = weekPlans.flatMap((day) => day.tasks);
  const pendingWeekTasks = weekTasks.filter((task) => !task.completed);
  const completedWeekTasks = weekTasks.length - pendingWeekTasks.length;
  const scheduledHabitIds = new Set(
    board?.slots.flatMap((slot) => slot.habits.map((item) => item.habitId)) ?? []
  );
  const weekRange =
    week.length > 0
      ? `${week[0].dateLabel} - ${week[week.length - 1].dateLabel}`
      : "Current week";

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader eyebrow="Weekly organizer" title={`Plan ${weekRange}`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          One habit board per week, Monday through Sunday.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((current) => current - 1)}
            className="rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous week
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
            className="rounded-lg"
          >
            Current week
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((current) => current + 1)}
            className="rounded-lg"
          >
            Next week
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <OverviewPanel
        eyebrow="This week"
        title="Schedule habits from 00:00 to 00:00."
        description="Assign one or more habits to each hour of the selected week."
        stats={[
          {
            label: "Habits",
            value: habits.length,
            icon: Repeat,
          },
          {
            label: "Scheduled habits",
            value: scheduledHabitIds.size,
            icon: Clock,
          },
          {
            label: "Tracked tasks",
            value: weekTasks.length,
            icon: ListTodo,
          },
        ]}
        progress={{
          label: `${
            weekTasks.length
              ? Math.round((completedWeekTasks / weekTasks.length) * 100)
              : 0
          }% done this week`,
          value: weekTasks.length
            ? Math.round((completedWeekTasks / weekTasks.length) * 100)
            : 0,
          detail: `${completedWeekTasks} done, ${pendingWeekTasks.length} still open`,
          icon: CheckCircle2,
        }}
        focusTitle="Board"
        focusDescription="The schedule stores habits by user, week, day, and hour."
        focusItems={[
          {
            label: "Open tasks",
            value: pendingWeekTasks.length,
            icon: ListTodo,
          },
          {
            label: "Time slots",
            value: board?.slots.length ?? 0,
            icon: Clock,
          },
        ]}
      />

      <WeeklyHabitBoard
        boardSlots={board?.slots ?? []}
        habits={habits}
        isLoading={isBoardLoading}
        week={week}
        weekStartKey={weekStartKey}
      />
    </div>
  );
}

function WeeklyHabitBoard({
  boardSlots,
  habits,
  isLoading,
  week,
  weekStartKey,
}: {
  boardSlots: WeeklyPlanSlot[];
  habits: Habit[];
  isLoading: boolean;
  week: ReturnType<typeof getCurrentWeek>;
  weekStartKey: string;
}) {
  const [slotDialog, setSlotDialog] = useState<SlotDialogState>(null);
  const [slotDetail, setSlotDetail] = useState<SlotDetailState>(null);
  const { mutate: createSlot, isPending: isCreating } = useCreateWeeklyPlanSlot();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateWeeklyPlanSlot();
  const { mutate: deleteSlot, isPending: isDeleting } =
    useDeleteWeeklyPlanSlot(weekStartKey);
  const slotsByPosition = useMemo(() => {
    return new Map(
      boardSlots.map((slot) => [`${slot.dayIndex}-${slot.hour}`, slot])
    );
  }, [boardSlots]);

  const saveSlot = (data: WeeklyPlanSlotInput, slotId?: string) => {
    if (slotId) {
      updateSlot({ id: slotId, data }, { onSuccess: () => setSlotDialog(null) });
      return;
    }

    createSlot(data, { onSuccess: () => setSlotDialog(null) });
  };

  return (
    <>
      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3 px-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Weekly habit board</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading weekly board..."
                  : `${boardSlots.length} scheduled hours from 00:00 to 00:00.`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">
              Monday - Sunday
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4">
          <div className="hidden min-w-0 overflow-hidden rounded-lg border border-border/70 lg:block">
            <div className="min-w-0">
              <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] border-b border-border/70">
                <div className="px-1.5 py-2 text-[11px] font-medium text-muted-foreground">
                  Hour
                </div>
                {week.map((day) => (
                  <div
                    key={day.key}
                    className={cn(
                      "min-w-0 border-l border-border/70 px-2 py-2",
                      day.isToday && "bg-primary/5"
                    )}
                  >
                    <div className="truncate text-sm font-semibold">{day.label}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {day.dateLabel}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-border/70">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid min-h-[48px] grid-cols-[48px_repeat(7,minmax(0,1fr))]"
                  >
                    <div className="bg-secondary/20 px-1.5 py-2 text-[11px] font-medium text-muted-foreground">
                      {formatHour(hour)}
                    </div>
                    {week.map((day, dayIndex) => {
                      const slot = slotsByPosition.get(`${dayIndex}-${hour}`);

                      return (
                        <div
                          key={`${day.key}-${hour}`}
                          className={cn(
                            "min-w-0 border-l border-border/70 p-1",
                            day.isToday && "bg-primary/5"
                          )}
                        >
                          {slot ? (
                            <SlotCell
                              disabled={isDeleting}
                              onDelete={() => deleteSlot(slot.id)}
                              onEdit={() =>
                                setSlotDialog({ dayIndex, hour, slot })
                              }
                              onOpenDetails={() =>
                                setSlotDetail({
                                  dayLabel: day.label,
                                  dateLabel: day.dateLabel,
                                  slot,
                                })
                              }
                              slot={slot}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSlotDialog({ dayIndex, hour })}
                              className="flex h-full min-h-[38px] w-full items-center justify-center rounded-md border border-dashed border-border/70 bg-background/60 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/35"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:hidden">
            {week.map((day, dayIndex) => (
              <div
                key={day.key}
                className={cn(
                  "min-w-0 rounded-lg border border-border/70 bg-background/75 p-3",
                  day.isToday && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{day.label}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {day.dateLabel}
                    </div>
                  </div>
                  {day.isToday ? <Badge>Today</Badge> : null}
                </div>
                <div className="grid gap-1.5">
                  {HOURS.map((hour) => {
                    const slot = slotsByPosition.get(`${dayIndex}-${hour}`);

                    return (
                      <div
                        key={`${day.key}-mobile-${hour}`}
                        className="grid min-w-0 grid-cols-[54px_minmax(0,1fr)] gap-2"
                      >
                        <div className="pt-2 text-[11px] font-medium text-muted-foreground">
                          {formatHour(hour)}
                        </div>
                        {slot ? (
                          <SlotCell
                            disabled={isDeleting}
                            onDelete={() => deleteSlot(slot.id)}
                            onEdit={() => setSlotDialog({ dayIndex, hour, slot })}
                            onOpenDetails={() =>
                              setSlotDetail({
                                dayLabel: day.label,
                                dateLabel: day.dateLabel,
                                slot,
                              })
                            }
                            slot={slot}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSlotDialog({ dayIndex, hour })}
                            className="flex min-h-9 min-w-0 items-center justify-center rounded-md border border-dashed border-border/70 bg-background/60 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/35"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SlotDetailsDialog
        onClose={() => setSlotDetail(null)}
        onDelete={(slot) => {
          deleteSlot(slot.id);
          setSlotDetail(null);
        }}
        onEdit={(slot) => {
          setSlotDialog({
            dayIndex: slot.dayIndex,
            hour: slot.hour,
            slot,
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
          slotDialog={slotDialog}
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

  return (
    <div className="h-full min-w-0 rounded-md border border-border/70 bg-card p-1.5 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-1">
        <button
          type="button"
          onClick={onOpenDetails}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex min-w-0 items-center gap-1 text-[11px] font-semibold">
            <Clock className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">{formatHour(slot.hour)}</span>
            <span className="shrink-0 text-muted-foreground">
              {slotHabits.length}
            </span>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-0.5 opacity-80">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-6 w-6 rounded-md"
            aria-label="Edit slot"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={disabled}
            className="h-6 w-6 rounded-md text-destructive hover:text-destructive"
            aria-label="Delete slot"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenDetails}
        className="mt-1 grid w-full min-w-0 gap-0.5 text-left"
      >
        {slotHabits.length ? (
          <>
            <div className="truncate rounded bg-secondary/35 px-1.5 py-1 text-[11px] font-medium">
              {slotHabits[0].title}
            </div>
            {slotHabits.length > 1 ? (
              <div className="truncate text-[10px] text-muted-foreground">
                +{slotHabits.length - 1} more
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
  onDelete: (slot: WeeklyPlanSlot) => void;
  onEdit: (slot: WeeklyPlanSlot) => void;
  slotDetail: SlotDetailState;
}) {
  const slotHabits =
    slotDetail?.slot.habits
      .map((item) => item.habit)
      .filter((habit): habit is Habit => Boolean(habit)) ?? [];

  return (
    <Dialog open={Boolean(slotDetail)} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {slotDetail
              ? `${slotDetail.dayLabel} ${formatHour(slotDetail.slot.hour)}`
              : "Time slot"}
          </DialogTitle>
          <DialogDescription>{slotDetail?.dateLabel}</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] min-w-0 gap-2 overflow-y-auto pr-1">
          {slotHabits.length ? (
            slotHabits.map((habit) => (
              <Link
                href={`/habits/${habit.id}`}
                key={habit.id}
                onClick={onClose}
                className="min-w-0 rounded-lg border border-border/70 bg-background/75 p-3 transition-colors hover:bg-secondary/35"
              >
                <div className="truncate font-medium">{habit.title}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {getHabitProjectLabel(habit)}
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
              No habits assigned.
            </div>
          )}
        </div>

        {slotDetail ? (
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(slotDetail.slot)}
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
            <Button type="button" onClick={() => onEdit(slotDetail.slot)}>
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
  slotDialog,
  week,
  weekStartKey,
}: {
  habits: Habit[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: WeeklyPlanSlotInput) => void;
  slotDialog: Exclude<SlotDialogState, null>;
  week: ReturnType<typeof getCurrentWeek>;
  weekStartKey: string;
}) {
  const [dayIndex, setDayIndex] = useState(String(slotDialog.dayIndex));
  const [hour, setHour] = useState(String(slotDialog.hour));
  const [habitIds, setHabitIds] = useState<string[]>(
    getSlotHabitIds(slotDialog.slot)
  );

  const toggleHabit = (habitId: string, checked: boolean) => {
    setHabitIds((current) =>
      checked
        ? Array.from(new Set([...current, habitId]))
        : current.filter((id) => id !== habitId)
    );
  };

  const handleSave = () => {
    onSave({
      dayIndex: Number(dayIndex),
      habitIds,
      hour: Number(hour),
      weekStartKey,
    });
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {slotDialog.slot ? "Edit habit hour" : "Add habit hour"}
          </DialogTitle>
          <DialogDescription>
            Assign habits to one hour in this Monday-to-Sunday board.
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

          <div className="grid max-h-[45vh] min-w-0 gap-2 overflow-y-auto pr-1">
            {habits.length ? (
              habits.map((habit) => {
                const checked = habitIds.includes(habit.id);

                return (
                  <label
                    key={habit.id}
                    className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/75 p-3 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleHabit(habit.id, value === true)
                      }
                      className="mt-0.5"
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
                No habits available.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save hour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
