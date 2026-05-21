"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  ListTodo,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
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
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import {
  useCreateWeeklyPlanSlot,
  useDeleteWeeklyPlanSlot,
  useUpdateWeeklyPlanSlot,
  useWeeklyPlan,
} from "@/hooks/useWeeklyPlanMutations";
import {
  useCreateStudySubject,
  useDeleteStudySubject,
  useSaveStudyScheduleBlock,
  useStudySchedule,
  useStudySubjects,
  useUpdateStudySubject,
} from "@/hooks/useStudyMutations";
import { buildWeekDayPlans, getCurrentWeek } from "@/lib/weekly-organizer";
import { cn } from "@/lib/utils";
import type {
  Habit,
  Project,
  StudyScheduleBlock,
  StudySubject,
  StudySubjectInput,
  Task,
  WeeklyPlanSlot,
  WeeklyPlanSlotInput,
} from "@/types/BaseInterfaces";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

type SlotDialogState = {
  dayIndex: number;
  hour: number;
  slot?: WeeklyPlanSlot;
  studyBlocks?: StudyScheduleBlock[];
} | null;

type SlotDetailState = {
  dayLabel: string;
  dateLabel: string;
  dayIndex: number;
  hour: number;
  slot?: WeeklyPlanSlot;
  studyBlocks: StudyScheduleBlock[];
} | null;

type SlotSaveInput = WeeklyPlanSlotInput & {
  studySubjectIds: string[];
};

type WeeklyBoardMode = "study" | "weekly";

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

function getStudySubjectIds(blocks: StudyScheduleBlock[] = []) {
  return blocks.map((block) => block.subjectId);
}

function StudySubjectsPanel({ subjects }: { subjects: StudySubject[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<StudySubjectInput>({
    color: "#38bdf8",
    name: "",
    notes: "",
    plannedHoursPerWeek: 1,
  });
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const { mutate: createSubject, isPending: isCreating } = useCreateStudySubject();
  const { mutate: updateSubject, isPending: isUpdating } = useUpdateStudySubject();
  const { mutate: deleteSubject, isPending: isDeleting } = useDeleteStudySubject();

  const resetForm = () => {
    setEditingSubjectId(null);
    setForm({
      color: "#38bdf8",
      name: "",
      notes: "",
      plannedHoursPerWeek: 1,
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const startEditing = (subject: StudySubject) => {
    setEditingSubjectId(subject.id);
    setForm({
      color: subject.color ?? "#38bdf8",
      name: subject.name,
      notes: subject.notes ?? "",
      plannedHoursPerWeek: subject.plannedHoursPerWeek,
    });
    setIsDialogOpen(true);
  };

  const saveSubject = () => {
    if (!form.name.trim()) {
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      plannedHoursPerWeek: Math.max(1, Number(form.plannedHoursPerWeek) || 1),
    };

    if (editingSubjectId) {
      updateSubject(
        { id: editingSubjectId, data: payload },
        {
          onSuccess: () => {
            resetForm();
            setIsDialogOpen(false);
          },
        }
      );
      return;
    }

    createSubject(payload, {
      onSuccess: () => {
        resetForm();
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Study subjects
            </CardTitle>
            <CardDescription>
              Create subjects, set weekly study hours, then schedule them on the
              board below.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{subjects.length} subjects</Badge>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              New subject
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
          {subjects.length ? (
            subjects.map((subject) => {
              const scheduledHours = subject.scheduleBlocks?.length ?? 0;

              return (
                <div
                  className="flex min-w-0 flex-col gap-3 rounded-lg border border-border/70 bg-background/75 p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={subject.id}
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: subject.color ?? "#38bdf8" }}
                      />
                      <span className="truncate font-semibold">
                        {subject.name}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {scheduledHours}/{subject.plannedHoursPerWeek}h scheduled
                      per week
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(subject)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => deleteSubject(subject.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              No study subjects yet. Create one to start building your weekly
              study routine.
            </p>
          )}
        </div>
      </CardContent>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);

          if (!isOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingSubjectId ? "Edit study subject" : "New study subject"}
            </DialogTitle>
            <DialogDescription>
              Set the subject details before assigning it to weekly study hours.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              className="h-11"
              placeholder="Subject name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-[88px_minmax(0,1fr)]">
              <Input
                aria-label="Subject color"
                className="h-11"
                type="color"
                value={form.color ?? "#38bdf8"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
              />
              <Input
                className="h-11"
                min={1}
                placeholder="Hours per week"
                type="number"
                value={form.plannedHoursPerWeek ?? 1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    plannedHoursPerWeek: Number(event.target.value),
                  }))
                }
              />
            </div>
            <Input
              className="h-11"
              placeholder="Notes, professor, or room"
              value={form.notes ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={isCreating || isUpdating || !form.name.trim()}
              onClick={saveSubject}
              type="button"
            >
              {editingSubjectId ? "Save subject" : "Create subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StudyDailySummary({
  studySchedule,
  week,
}: {
  studySchedule: StudyScheduleBlock[];
  week: ReturnType<typeof getCurrentWeek>;
}) {
  const subjectsByDay = week.map((day, dayIndex) => {
    const blocks = studySchedule
      .filter((block) => block.dayIndex === dayIndex)
      .sort((a, b) => a.hour - b.hour);

    return { blocks, day };
  });

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Study by day
        </CardTitle>
        <CardDescription>
          Your repeating subject routine for each weekday.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {subjectsByDay.map(({ blocks, day }) => (
          <div
            className={cn(
              "min-w-0 rounded-lg border border-border/70 bg-background/75 p-3",
              day.isToday && "border-primary/50 bg-primary/5"
            )}
            key={day.key}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">{day.label}</div>
              {day.isToday ? <Badge>Today</Badge> : null}
            </div>
            <div className="mt-3 grid gap-2">
              {blocks.length ? (
                blocks.map((block) => (
                  <div
                    className="min-w-0 rounded-md bg-secondary/35 px-2 py-1.5 text-xs"
                    key={block.id}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: block.subject?.color ?? "#38bdf8",
                        }}
                      />
                      <span className="truncate font-medium">
                        {block.subject?.name ?? "Subject"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-muted-foreground">
                      {formatHour(block.hour)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">
                  No study subjects
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function WeeklyOrganizerPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<WeeklyBoardMode>("study");
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
  const { data: studySubjects = [] } = useStudySubjects();
  const { data: studySchedule = [], isLoading: isStudyLoading } =
    useStudySchedule();
  const weekPlans = useMemo(
    () => buildWeekDayPlans(tasks, habits, projects, referenceDate),
    [tasks, habits, projects, referenceDate]
  );
  const weekTasks = weekPlans.flatMap((day) => day.tasks);
  const scheduledStudyHours = studySchedule.length;
  const plannedStudyHours = studySubjects.reduce(
    (total, subject) => total + subject.plannedHoursPerWeek,
    0
  );
  const weekRange =
    week.length > 0
      ? `${week[0].dateLabel} - ${week[week.length - 1].dateLabel}`
      : "Current week";

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{weekRange}</div>
          <div className="text-xs text-muted-foreground">
            {activeTab === "study"
              ? `${scheduledStudyHours}/${plannedStudyHours} study hours scheduled`
              : `${weekTasks.length} tasks in this week`}
          </div>
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

      <div className="flex flex-wrap gap-2 rounded-lg border border-border/70 bg-card p-1">
        <Button
          className="flex-1 justify-center sm:flex-none"
          onClick={() => setActiveTab("study")}
          type="button"
          variant={activeTab === "study" ? "default" : "ghost"}
        >
          <GraduationCap className="h-4 w-4" />
          Study Plan
        </Button>
        <Button
          className="flex-1 justify-center sm:flex-none"
          onClick={() => setActiveTab("weekly")}
          type="button"
          variant={activeTab === "weekly" ? "default" : "ghost"}
        >
          <ListTodo className="h-4 w-4" />
          Weekly Plan
        </Button>
      </div>

      {activeTab === "study" ? (
        <>
          <StudySubjectsPanel subjects={studySubjects} />

          <StudyDailySummary studySchedule={studySchedule} week={week} />

          <WeeklyHabitBoard
            boardMode="study"
            boardSlots={[]}
            habits={[]}
            isLoading={isStudyLoading}
            projects={projects}
            studySchedule={studySchedule}
            studySubjects={studySubjects}
            tasks={[]}
            week={week}
            weekStartKey={weekStartKey}
          />
        </>
      ) : (
        <WeeklyHabitBoard
          boardMode="weekly"
          boardSlots={board?.slots ?? []}
          habits={habits}
          isLoading={isBoardLoading}
          projects={projects}
          studySchedule={[]}
          studySubjects={[]}
          tasks={tasks}
          week={week}
          weekStartKey={weekStartKey}
        />
      )}
    </div>
  );
}

function WeeklyHabitBoard({
  boardMode,
  boardSlots,
  habits,
  isLoading,
  projects,
  studySchedule,
  studySubjects,
  tasks,
  week,
  weekStartKey,
}: {
  boardMode: WeeklyBoardMode;
  boardSlots: WeeklyPlanSlot[];
  habits: Habit[];
  isLoading: boolean;
  projects: Project[];
  studySchedule: StudyScheduleBlock[];
  studySubjects: StudySubject[];
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
  const { mutate: saveStudySchedule, isPending: isSavingStudySchedule } =
    useSaveStudyScheduleBlock();
  const slotsByPosition = useMemo(() => {
    return new Map(
      boardSlots.map((slot) => [`${slot.dayIndex}-${slot.hour}`, slot])
    );
  }, [boardSlots]);
  const studyBlocksByPosition = useMemo(() => {
    const blocks = new Map<string, StudyScheduleBlock[]>();

    studySchedule.forEach((block) => {
      const key = `${block.dayIndex}-${block.hour}`;
      blocks.set(key, [...(blocks.get(key) ?? []), block]);
    });

    return blocks;
  }, [studySchedule]);

  const saveSlot = (data: SlotSaveInput, slotId?: string) => {
    const { studySubjectIds, ...weeklySlotData } = data;
    const shouldSaveWeeklySlot =
      boardMode === "weekly" &&
      (Boolean(slotId) ||
        weeklySlotData.habitIds.length > 0 ||
        (weeklySlotData.taskIds?.length ?? 0) > 0);
    const shouldSaveStudyBlock = boardMode === "study";
    let pendingSaves =
      Number(shouldSaveWeeklySlot) + Number(shouldSaveStudyBlock);
    const closeAfterSave = () => {
      pendingSaves -= 1;

      if (pendingSaves === 0) {
        setSlotDialog(null);
      }
    };

    if (pendingSaves === 0) {
      setSlotDialog(null);
      return;
    }

    if (shouldSaveWeeklySlot && slotId) {
      updateSlot({ id: slotId, data: weeklySlotData }, { onSuccess: closeAfterSave });
    } else if (shouldSaveWeeklySlot) {
      createSlot(weeklySlotData, { onSuccess: closeAfterSave });
    }

    if (shouldSaveStudyBlock) {
      saveStudySchedule(
        {
          dayIndex: data.dayIndex,
          hour: data.hour,
          subjectIds: studySubjectIds,
        },
        { onSuccess: closeAfterSave }
      );
    }
  };

  const deleteCell = (slot?: WeeklyPlanSlot, dayIndex?: number, hour?: number) => {
    if (boardMode === "weekly" && slot) {
      deleteSlot(slot.id);
    }

    if (
      boardMode === "study" &&
      typeof dayIndex === "number" &&
      typeof hour === "number"
    ) {
      saveStudySchedule({ dayIndex, hour, subjectIds: [] });
    }
  };

  return (
    <>
      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3 px-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle>
                {boardMode === "study" ? "Study plan board" : "Weekly plan board"}
              </CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading weekly board..."
                  : boardMode === "study"
                    ? `${studySchedule.length} repeating study blocks.`
                    : `${boardSlots.length} weekly habit/task slots.`}
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
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {day.label}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {day.dateLabel}
                        </div>
                      </div>
                      {day.isToday ? (
                        <Badge className="shrink-0 px-2 py-0 text-[10px]">
                          Today
                        </Badge>
                      ) : null}
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
                              disabled={isDeleting || isSavingStudySchedule}
                              onDelete={() => deleteCell(slot, dayIndex, hour)}
                              onEdit={() =>
                                setSlotDialog({
                                  dayIndex,
                                  hour,
                                  slot,
                                  studyBlocks: studyBlocksByPosition.get(
                                    `${dayIndex}-${hour}`
                                  ) ?? [],
                                })
                              }
                              onOpenDetails={() =>
                                setSlotDetail({
                                  dayIndex,
                                  dayLabel: day.label,
                                  dateLabel: day.dateLabel,
                                  hour,
                                  slot,
                                  studyBlocks: studyBlocksByPosition.get(
                                    `${dayIndex}-${hour}`
                                  ) ?? [],
                                })
                              }
                              slot={slot}
                              studyBlocks={
                                studyBlocksByPosition.get(`${dayIndex}-${hour}`) ?? []
                              }
                            />
                          ) : (
                            studyBlocksByPosition.get(`${dayIndex}-${hour}`)?.length ? (
                              <SlotCell
                                disabled={isSavingStudySchedule}
                                onDelete={() => deleteCell(undefined, dayIndex, hour)}
                                onEdit={() =>
                                  setSlotDialog({
                                    dayIndex,
                                    hour,
                                    studyBlocks:
                                      studyBlocksByPosition.get(
                                        `${dayIndex}-${hour}`
                                      ) ?? [],
                                  })
                                }
                                onOpenDetails={() =>
                                  setSlotDetail({
                                    dayIndex,
                                    dayLabel: day.label,
                                    dateLabel: day.dateLabel,
                                    hour,
                                    studyBlocks:
                                      studyBlocksByPosition.get(
                                        `${dayIndex}-${hour}`
                                      ) ?? [],
                                  })
                                }
                                studyBlocks={
                                  studyBlocksByPosition.get(
                                    `${dayIndex}-${hour}`
                                  ) ?? []
                                }
                              />
                            ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setSlotDialog({ dayIndex, hour, studyBlocks: [] })
                              }
                              className="flex h-full min-h-[38px] w-full items-center justify-center rounded-md border border-dashed border-border/70 bg-background/60 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/35"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            )
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
                    const studyBlocks =
                      studyBlocksByPosition.get(`${dayIndex}-${hour}`) ?? [];

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
                            disabled={isDeleting || isSavingStudySchedule}
                            onDelete={() => deleteCell(slot, dayIndex, hour)}
                            onEdit={() =>
                              setSlotDialog({
                                dayIndex,
                                hour,
                                slot,
                                studyBlocks,
                              })
                            }
                            onOpenDetails={() =>
                              setSlotDetail({
                                dayIndex,
                                dayLabel: day.label,
                                dateLabel: day.dateLabel,
                                hour,
                                slot,
                                studyBlocks,
                              })
                            }
                            slot={slot}
                            studyBlocks={studyBlocks}
                          />
                        ) : (
                          studyBlocks.length ? (
                            <SlotCell
                              disabled={isSavingStudySchedule}
                              onDelete={() => deleteCell(undefined, dayIndex, hour)}
                              onEdit={() =>
                                setSlotDialog({ dayIndex, hour, studyBlocks })
                              }
                              onOpenDetails={() =>
                                setSlotDetail({
                                  dayIndex,
                                  dayLabel: day.label,
                                  dateLabel: day.dateLabel,
                                  hour,
                                  studyBlocks,
                                })
                              }
                              studyBlocks={studyBlocks}
                            />
                          ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSlotDialog({ dayIndex, hour, studyBlocks: [] })
                            }
                            className="flex min-h-9 min-w-0 items-center justify-center rounded-md border border-dashed border-border/70 bg-background/60 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/35"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                          )
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
        onDelete={(detail) => {
          deleteCell(detail.slot, detail.dayIndex, detail.hour);
          setSlotDetail(null);
        }}
        onEdit={(detail) => {
          setSlotDialog({
            dayIndex: detail.dayIndex,
            hour: detail.hour,
            slot: detail.slot,
            studyBlocks: detail.studyBlocks,
          });
          setSlotDetail(null);
        }}
        slotDetail={slotDetail}
      />

      {slotDialog ? (
        <SlotDialog
          boardMode={boardMode}
          habits={habits}
          isSaving={isCreating || isUpdating || isSavingStudySchedule}
          onClose={() => setSlotDialog(null)}
          onSave={(data) => saveSlot(data, slotDialog.slot?.id)}
          projects={projects}
          slotDialog={slotDialog}
          studySubjects={studySubjects}
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
  studyBlocks = [],
}: {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onOpenDetails: () => void;
  slot?: WeeklyPlanSlot;
  studyBlocks?: StudyScheduleBlock[];
}) {
  const slotHabits = (slot?.habits ?? [])
    .map((item) => item.habit)
    .filter((habit): habit is Habit => Boolean(habit));
  const slotTasks =
    slot?.tasks
      ?.map((item) => item.task)
      .filter((task): task is Task => Boolean(task)) ?? [];
  const slotSubjects = studyBlocks
    .map((block) => block.subject)
    .filter((subject): subject is StudySubject => Boolean(subject));
  const totalItems = slotHabits.length + slotTasks.length + slotSubjects.length;
  const firstItem =
    slotSubjects[0]?.name ?? slotHabits[0]?.title ?? slotTasks[0]?.title;
  const displayHour = slot?.hour ?? studyBlocks[0]?.hour ?? 0;

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
            <span className="truncate">{formatHour(displayHour)}</span>
            <span className="shrink-0 text-muted-foreground">
              {totalItems}
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
        {totalItems ? (
          <>
            <div className="truncate rounded bg-secondary/35 px-1.5 py-1 text-[11px] font-medium">
              {firstItem}
            </div>
            {slotSubjects.length ? (
              <div className="truncate text-[10px] text-primary">
                {slotSubjects.length} study
              </div>
            ) : null}
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
  const slotSubjects =
    slotDetail?.studyBlocks
      .map((block) => block.subject)
      .filter((subject): subject is StudySubject => Boolean(subject)) ?? [];

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
          {slotSubjects.length || slotHabits.length || slotTasks.length ? (
            <>
            {slotSubjects.map((subject) => (
              <div
                key={subject.id}
                className="min-w-0 rounded-lg border border-border/70 bg-background/75 p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color ?? "#38bdf8" }}
                  />
                  <div className="truncate font-medium">{subject.name}</div>
                </div>
                <div className="mt-1 truncate text-sm text-muted-foreground">
                  Study subject - {subject.plannedHoursPerWeek}h planned/week
                </div>
              </div>
            ))}
            {slotHabits.map((habit) => (
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
            ))}
            {slotTasks.map((task) => (
              <Link
                href={`/tasks/${task.id}`}
                key={task.id}
                onClick={onClose}
                className="min-w-0 rounded-lg border border-border/70 bg-background/75 p-3 transition-colors hover:bg-secondary/35"
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
              No study subjects, habits, or tasks assigned.
            </div>
          )}
        </div>

        {slotDetail ? (
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(slotDetail)}
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
            <Button type="button" onClick={() => onEdit(slotDetail)}>
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
  boardMode,
  habits,
  isSaving,
  onClose,
  onSave,
  projects,
  slotDialog,
  studySubjects,
  tasks,
  week,
  weekStartKey,
}: {
  boardMode: WeeklyBoardMode;
  habits: Habit[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: SlotSaveInput) => void;
  projects: Project[];
  slotDialog: Exclude<SlotDialogState, null>;
  studySubjects: StudySubject[];
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
  const [taskIds, setTaskIds] = useState<string[]>(getSlotTaskIds(slotDialog.slot));
  const [studySubjectIds, setStudySubjectIds] = useState<string[]>(
    getStudySubjectIds(slotDialog.studyBlocks)
  );
  const filteredHabits =
    projectId === "all"
      ? habits
      : habits.filter((habit) => habit.projectId === projectId);
  const filteredTasks =
    projectId === "all" ? tasks : tasks.filter((task) => task.projectId === projectId);

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

  const toggleStudySubject = (subjectId: string, checked: boolean) => {
    setStudySubjectIds((current) =>
      checked
        ? Array.from(new Set([...current, subjectId]))
        : current.filter((id) => id !== subjectId)
    );
  };

  const handleSave = () => {
    onSave({
      dayIndex: Number(dayIndex),
      habitIds,
      hour: Number(hour),
      studySubjectIds,
      taskIds,
      weekStartKey,
    });
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {boardMode === "study"
              ? "Edit study block"
              : slotDialog.slot
                ? "Edit weekly slot"
                : "Add weekly slot"}
          </DialogTitle>
          <DialogDescription>
            {boardMode === "study"
              ? "Assign one or more subjects to a repeating weekday hour."
              : "Assign habits and tasks to one hour in the selected week."}
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

          {boardMode === "weekly" ? (
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
          ) : null}

          <div className="grid max-h-[45vh] min-w-0 gap-4 overflow-y-auto pr-1">
            {boardMode === "study" ? (
              <div className="grid gap-2">
              <div className="text-sm font-semibold">Study subjects</div>
              {studySubjects.length ? (
                studySubjects.map((subject) => {
                  const checked = studySubjectIds.includes(subject.id);

                  return (
                    <label
                      key={subject.id}
                      className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/75 p-3 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleStudySubject(subject.id, value === true)
                        }
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: subject.color ?? "#38bdf8",
                            }}
                          />
                          <span className="block truncate font-medium">
                            {subject.name}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {subject.plannedHoursPerWeek}h planned/week
                        </span>
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground">
                  Create a study subject before assigning study time.
                </div>
              )}
            </div>
            ) : null}

            {boardMode === "weekly" ? (
              <>
            <div className="grid gap-2">
              <div className="text-sm font-semibold">Habits</div>
              {filteredHabits.length ? (
                filteredHabits.map((habit) => {
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
                      key={task.id}
                      className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/75 p-3 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleTask(task.id, value === true)
                        }
                        className="mt-0.5"
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
              </>
            ) : null}
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
