"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Pencil,
  Plus,
  Save,
  Trash,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateStudyPlanBlock,
  useCreateStudySession,
  useCreateStudySubject,
  useDeleteStudyPlanBlock,
  useDeleteStudySession,
  useStudyPlanBoard,
  useStudySessions,
  useStudySubjects,
  useUpdateStudyPlanBlock,
} from "@/hooks/useStudyMutations";
import type {
  StudyPlanBlock,
  StudySession,
  StudySubject,
} from "@/types/BaseInterfaces";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const chartConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  studied: {
    label: "Studied",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type SessionFormState = {
  endedAt: string;
  notes: string;
  startedAt: string;
  subjectName: string;
};

type BlockFormState = {
  dayIndex: string;
  durationMinutes: string;
  notes: string;
  startTime: string;
  subjectId: string;
};

const emptySessionForm: SessionFormState = {
  endedAt: "",
  notes: "",
  startedAt: "",
  subjectName: "",
};

const emptyBlockForm: BlockFormState = {
  dayIndex: "0",
  durationMinutes: "60",
  notes: "",
  startTime: "08:00",
  subjectId: "",
};

function formatStudyDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours) {
    return `${remainingMinutes}m`;
  }

  if (!remainingMinutes) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function toLocalDayKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getWeek(referenceDate = new Date()) {
  const selectedDate = new Date(referenceDate);
  selectedDate.setHours(0, 0, 0, 0);
  const mondayOffset =
    selectedDate.getDay() === 0 ? -6 : 1 - selectedDate.getDay();
  const start = new Date(selectedDate);
  start.setDate(selectedDate.getDate() + mondayOffset);

  return DAYS.map((label, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      dateLabel: date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
      }),
      key: toLocalDayKey(date),
      label,
    };
  });
}

function getSessionSubjectName(session: StudySession) {
  return session.subject?.name ?? "Subject";
}

function getBlockSubjectName(block: StudyPlanBlock) {
  return block.subject?.name ?? "Subject";
}

function getMinutesBetween(startedAt: string, endedAt: string) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
}

function findSubjectByName(subjects: StudySubject[], name: string) {
  const normalizedName = name.trim().toLowerCase();
  return subjects.find(
    (subject) => subject.name.trim().toLowerCase() === normalizedName
  );
}

export default function StudyPlannerPage() {
  "use no memo";

  const { data: subjects = [] } = useStudySubjects();
  const { data: sessions = [] } = useStudySessions();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [sessionForm, setSessionForm] =
    useState<SessionFormState>(emptySessionForm);
  const [blockForm, setBlockForm] = useState<BlockFormState>(emptyBlockForm);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectNotes, setNewSubjectNotes] = useState("");
  const createSubject = useCreateStudySubject();
  const createSession = useCreateStudySession();
  const deleteSession = useDeleteStudySession();
  const createBlock = useCreateStudyPlanBlock();
  const updateBlock = useUpdateStudyPlanBlock();
  const deleteBlock = useDeleteStudyPlanBlock();

  const referenceDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + weekOffset * 7);
    return date;
  }, [weekOffset]);
  const week = getWeek(referenceDate);
  const weekStartKey = week[0].key;
  const weekRange = `${week[0].dateLabel} - ${week[week.length - 1].dateLabel}`;
  const { data: board } = useStudyPlanBoard(weekStartKey);
  const blocks = board?.blocks ?? [];
  const weekKeys = week.map((day) => day.key);
  const filteredBlocks =
    subjectFilter === "all"
      ? blocks
      : blocks.filter((block) => block.subjectId === subjectFilter);
  const filteredSessions =
    subjectFilter === "all"
      ? sessions
      : sessions.filter((session) => session.subjectId === subjectFilter);
  const weekSessions = filteredSessions.filter((session) =>
    weekKeys.includes(toLocalDayKey(session.startedAt))
  );
  const plannedMinutes = filteredBlocks.reduce(
    (total, block) => total + block.durationMinutes,
    0
  );
  const studiedMinutes = weekSessions.reduce(
    (total, session) => total + session.durationMinutes,
    0
  );
  const totalStudiedMinutes = sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0
  );
  const sessionDurationPreview = getMinutesBetween(
    sessionForm.startedAt,
    sessionForm.endedAt
  );
  const chartData = week.map((day, index) => {
    const dayBlocks = filteredBlocks.filter((block) => block.dayIndex === index);
    const daySessions = weekSessions.filter(
      (session) => toLocalDayKey(session.startedAt) === day.key
    );

    return {
      day: day.label,
      planned: Number(
        (
          dayBlocks.reduce((total, block) => total + block.durationMinutes, 0) /
          60
        ).toFixed(2)
      ),
      studied: Number(
        (
          daySessions.reduce(
            (total, session) => total + session.durationMinutes,
            0
          ) / 60
        ).toFixed(2)
      ),
    };
  });

  const seedSessionTimes = () => {
    const start = new Date();
    start.setSeconds(0, 0);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 60);
    setSessionForm((current) => ({
      ...current,
      endedAt: toDateTimeInputValue(end),
      startedAt: toDateTimeInputValue(start),
    }));
  };

  const handleSubjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = newSubjectName.trim();

    if (!name) {
      return;
    }

    await createSubject.mutateAsync({
      name,
      notes: newSubjectNotes.trim() || null,
      plannedHoursPerWeek: 1,
    });

    setNewSubjectName("");
    setNewSubjectNotes("");
    setIsSubjectDialogOpen(false);
  };

  const handleSessionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subjectName = sessionForm.subjectName.trim();

    if (!subjectName || !sessionDurationPreview) {
      return;
    }

    const subject =
      findSubjectByName(subjects, subjectName) ??
      (await createSubject.mutateAsync({
        name: subjectName,
        notes: "",
        plannedHoursPerWeek: 1,
      }));

    await createSession.mutateAsync({
      endedAt: new Date(sessionForm.endedAt).toISOString(),
      notes: sessionForm.notes.trim() || null,
      startedAt: new Date(sessionForm.startedAt).toISOString(),
      subjectId: subject.id,
    });

    setSessionForm(emptySessionForm);
  };

  const resetBlockForm = () => {
    setBlockForm({
      ...emptyBlockForm,
      subjectId: subjects[0]?.id ?? "",
    });
    setEditingBlockId(null);
  };

  const handleBlockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!blockForm.subjectId) {
      return;
    }

    const payload = {
      dayIndex: Number(blockForm.dayIndex),
      durationMinutes: Number(blockForm.durationMinutes),
      notes: blockForm.notes.trim() || null,
      startTime: blockForm.startTime,
      subjectId: blockForm.subjectId,
      weekStartKey,
    };

    if (editingBlockId) {
      await updateBlock.mutateAsync({ data: payload, id: editingBlockId });
    } else {
      await createBlock.mutateAsync(payload);
    }

    resetBlockForm();
    setIsBlockDialogOpen(false);
  };

  const editBlock = (block: StudyPlanBlock) => {
    setEditingBlockId(block.id);
    setBlockForm({
      dayIndex: String(block.dayIndex),
      durationMinutes: String(block.durationMinutes),
      notes: block.notes ?? "",
      startTime: block.startTime,
      subjectId: block.subjectId,
    });
    setIsBlockDialogOpen(true);
  };

  const openNewBlockDialog = () => {
    setBlockForm({
      ...emptyBlockForm,
      subjectId: subjects[0]?.id ?? "",
    });
    setEditingBlockId(null);
    setIsBlockDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHero
        badgeIcon={GraduationCap}
        badgeLabel="Study planning"
        title="Study Plan"
        description="Plan this specific week, register manual study time, and compare what was planned against what actually happened."
        stats={[
          { label: "Subjects", value: subjects.length },
          { label: "Week planned", value: formatStudyDuration(plannedMinutes) },
          { label: "Week studied", value: formatStudyDuration(studiedMinutes) },
          { label: "All studied", value: formatStudyDuration(totalStudiedMinutes) },
        ]}
      />

      <section className="grid gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm md:p-5">
        <div className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold">Register studied time</h2>
            <p className="text-sm text-muted-foreground">
              Type an existing or new subject, set begin and finish, and LifeUp
              saves the calculated duration.
            </p>
          </div>
          <div className="grid gap-3 rounded-lg border border-border/70 bg-background/70 p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,16rem)_auto_auto] sm:items-center">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge className="justify-center py-1.5" variant="outline">
                {formatStudyDuration(plannedMinutes)} planned
              </Badge>
              <Badge className="justify-center py-1.5" variant="outline">
                {formatStudyDuration(studiedMinutes)} studied
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:justify-end">
            <Dialog
              open={isSubjectDialogOpen}
              onOpenChange={setIsSubjectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button type="button" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Add subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add subject</DialogTitle>
                  <DialogDescription>
                    Create a subject with optional notes.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-3" onSubmit={handleSubjectSubmit}>
                  <Input
                    onChange={(event) => setNewSubjectName(event.target.value)}
                    placeholder="Subject name"
                    value={newSubjectName}
                  />
                  <Input
                    onChange={(event) => setNewSubjectNotes(event.target.value)}
                    placeholder="Optional notes"
                    value={newSubjectNotes}
                  />
                  <DialogFooter>
                    <Button
                      disabled={
                        !newSubjectName.trim() || createSubject.isPending
                      }
                      type="submit"
                    >
                      <Plus className="h-4 w-4" />
                      Add subject
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog
              open={isBlockDialogOpen}
              onOpenChange={(open) => {
                setIsBlockDialogOpen(open);
                if (!open) {
                  setEditingBlockId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openNewBlockDialog} type="button">
                  <Plus className="h-4 w-4" />
                  Add planned block
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingBlockId ? "Edit planned block" : "Add planned block"}
                  </DialogTitle>
                  <DialogDescription>
                    Planned blocks belong only to {weekRange}.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-3" onSubmit={handleBlockSubmit}>
                  <Select
                    value={blockForm.subjectId}
                    onValueChange={(value) =>
                      setBlockForm((current) => ({
                        ...current,
                        subjectId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Select
                      value={blockForm.dayIndex}
                      onValueChange={(value) =>
                        setBlockForm((current) => ({
                          ...current,
                          dayIndex: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day, index) => (
                          <SelectItem key={day} value={String(index)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      onChange={(event) =>
                        setBlockForm((current) => ({
                          ...current,
                          startTime: event.target.value,
                        }))
                      }
                      type="time"
                      value={blockForm.startTime}
                    />
                    <Input
                      min="1"
                      onChange={(event) =>
                        setBlockForm((current) => ({
                          ...current,
                          durationMinutes: event.target.value,
                        }))
                      }
                      placeholder="Minutes"
                      type="number"
                      value={blockForm.durationMinutes}
                    />
                  </div>
                  <Input
                    onChange={(event) =>
                      setBlockForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional notes"
                    value={blockForm.notes}
                  />
                  {!subjects.length ? (
                    <p className="rounded-md bg-secondary/35 p-3 text-sm text-muted-foreground">
                      Add a subject before planning a block.
                    </p>
                  ) : null}
                  <DialogFooter>
                    <Button
                      disabled={
                        !blockForm.subjectId ||
                        createBlock.isPending ||
                        updateBlock.isPending
                      }
                      type="submit"
                    >
                      {editingBlockId ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {editingBlockId ? "Update block" : "Add block"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>

        <form
          className="grid gap-3 rounded-lg border border-border/70 bg-background/70 p-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]"
          onSubmit={handleSessionSubmit}
        >
          <Input
            list="study-subjects"
            onChange={(event) =>
              setSessionForm((current) => ({
                ...current,
                subjectName: event.target.value,
              }))
            }
            placeholder="Subject name"
            value={sessionForm.subjectName}
          />
          <datalist id="study-subjects">
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name} />
            ))}
          </datalist>
          <Input
            onChange={(event) =>
              setSessionForm((current) => ({
                ...current,
                startedAt: event.target.value,
              }))
            }
            type="datetime-local"
            value={sessionForm.startedAt}
          />
          <Input
            onChange={(event) =>
              setSessionForm((current) => ({
                ...current,
                endedAt: event.target.value,
              }))
            }
            type="datetime-local"
            value={sessionForm.endedAt}
          />
          <Input
            onChange={(event) =>
              setSessionForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            placeholder="Optional notes"
            value={sessionForm.notes}
          />
          <div className="grid gap-2 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-[auto_auto] xl:justify-end">
            <Button onClick={seedSessionTimes} type="button" variant="outline">
              <CalendarPlus className="h-4 w-4" />
              Now
            </Button>
            <Button
              disabled={
                !sessionForm.subjectName.trim() ||
                !sessionDurationPreview ||
                createSubject.isPending ||
                createSession.isPending
              }
              type="submit"
            >
              <Save className="h-4 w-4" />
              Save studied time
            </Button>
          </div>
        </form>

        <div className="grid gap-4">
          <div className="min-w-0 rounded-lg border border-border/70 bg-background/70 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">Planned vs studied</h3>
                <p className="text-sm text-muted-foreground">
                  Week totals use the active subject filter.
                </p>
              </div>
              <Badge variant="outline">{weekRange}</Badge>
            </div>
            <ChartContainer
              config={chartConfig}
              className="h-[240px] w-full sm:h-[280px]"
            >
              <RechartsBarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex min-w-36 items-center justify-between gap-3">
                          <span>{String(name)}</span>
                          <span className="font-medium">{value}h</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="planned"
                  fill="var(--color-planned)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="studied"
                  fill="var(--color-studied)"
                  radius={[6, 6, 0, 0]}
                />
              </RechartsBarChart>
            </ChartContainer>
          </div>

        </div>
      </section>

      <StudyWeekBoard
        blocks={filteredBlocks}
        deleteBlock={(id) => deleteBlock.mutate(id)}
        deleteSession={(id) => deleteSession.mutate(id)}
        editBlock={editBlock}
        sessions={weekSessions}
        setWeekOffset={setWeekOffset}
        week={week}
        weekOffset={weekOffset}
        weekRange={weekRange}
      />
    </div>
  );
}

function StudyWeekBoard({
  blocks,
  deleteBlock,
  deleteSession,
  editBlock,
  sessions,
  setWeekOffset,
  week,
  weekOffset,
  weekRange,
}: {
  blocks: StudyPlanBlock[];
  deleteBlock: (id: string) => void;
  deleteSession: (id: string) => void;
  editBlock: (block: StudyPlanBlock) => void;
  sessions: StudySession[];
  setWeekOffset: Dispatch<SetStateAction<number>>;
  week: ReturnType<typeof getWeek>;
  weekOffset: number;
  weekRange: string;
}) {
  const blocksByDay = week.map((_, index) =>
    blocks
      .filter((block) => block.dayIndex === index)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  );
  const sessionsByDay = week.map((day) =>
    sessions
      .filter((session) => toLocalDayKey(session.startedAt) === day.key)
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      )
  );

  return (
    <section className="grid gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm md:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <h2 className="text-xl font-semibold">Week board</h2>
          <p className="text-sm text-muted-foreground">
            Planned blocks and manually registered study sessions for {weekRange}.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/70 bg-background/70 p-1">
          <Button
            className="justify-center"
            onClick={() => setWeekOffset((current) => current - 1)}
            type="button"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            className="justify-center"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(0)}
            type="button"
            variant="ghost"
          >
            Current
          </Button>
          <Button
            className="justify-center"
            onClick={() => setWeekOffset((current) => current + 1)}
            type="button"
            variant="outline"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-background/70">
        <div className="border-b border-border/70 px-3 py-2 text-sm font-medium">
          {weekRange}
        </div>
        <div className="overflow-x-auto">
        <div className="grid min-w-[72rem] grid-cols-7">
          {week.map((day, index) => {
            const dayBlocks = blocksByDay[index];
            const daySessions = sessionsByDay[index];
            const plannedMinutes = dayBlocks.reduce(
              (total, block) => total + block.durationMinutes,
              0
            );
            const studiedMinutes = daySessions.reduce(
              (total, session) => total + session.durationMinutes,
              0
            );

            return (
              <div
                className="min-w-0 border-b border-border/70 p-3 lg:border-b-0 lg:border-r last:lg:border-r-0"
                key={day.key}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{day.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {day.dateLabel}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Planned
                    </div>
                    <div className="grid gap-2">
                      {dayBlocks.length ? (
                        dayBlocks.map((block) => (
                          <div
                            className="grid min-w-0 gap-2 rounded-md bg-secondary/35 p-2 text-sm"
                            key={block.id}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {getBlockSubjectName(block)}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {block.startTime} -{" "}
                                {formatStudyDuration(block.durationMinutes)}
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                aria-label="Edit planned block"
                                className="h-7 w-7"
                                onClick={() => editBlock(block)}
                                size="icon"
                                type="button"
                                variant="ghost"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                aria-label="Delete planned block"
                                className="h-7 w-7"
                                onClick={() => deleteBlock(block.id)}
                                size="icon"
                                type="button"
                                variant="ghost"
                              >
                                <Trash className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-md bg-secondary/25 p-2 text-sm text-muted-foreground">
                          No plan.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Studied
                    </div>
                    <div className="grid gap-2">
                      {daySessions.length ? (
                        daySessions.map((session) => (
                          <div
                            className="grid min-w-0 gap-2 rounded-md bg-secondary/35 p-2 text-sm"
                            key={session.id}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {getSessionSubjectName(session)}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {new Date(session.startedAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}{" "}
                                -{" "}
                                {new Date(session.endedAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold">
                                {formatStudyDuration(session.durationMinutes)}
                              </span>
                              <Button
                                aria-label="Delete study session"
                                className="h-7 w-7"
                                onClick={() => deleteSession(session.id)}
                                size="icon"
                                type="button"
                                variant="ghost"
                              >
                                <Trash className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-md bg-secondary/25 p-2 text-sm text-muted-foreground">
                          No study.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-1 rounded-md border border-border/60 bg-background/80 p-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Planned</span>
                    <span className="font-semibold">
                      {formatStudyDuration(plannedMinutes)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Studied</span>
                    <span className="font-semibold">
                      {formatStudyDuration(studiedMinutes)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
