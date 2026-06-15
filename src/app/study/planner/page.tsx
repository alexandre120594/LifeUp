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
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Pencil,
  Plus,
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
  useCreateStudyQuestionPractice,
  useCreateStudySession,
  useCreateStudySubject,
  useDeleteStudySubject,
  useDeleteStudyPlanBlock,
  useDeleteStudyQuestionPractice,
  useDeleteStudySession,
  useStudyPlanBoard,
  useStudyQuestionPractice,
  useStudySessions,
  useStudySubjects,
  useUpdateStudyPlanBlock,
  useUpdateStudyQuestionPractice,
  useUpdateStudySession,
  useUpdateStudySubject,
} from "@/hooks/useStudyMutations";
import { getStudyQuestionSummary } from "@/lib/analytics";
import type {
  StudyPlanBlock,
  StudyQuestionPractice,
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

type BlockFormState = {
  dayIndex: string;
  durationMinutes: string;
  notes: string;
  startTime: string;
  subjectId: string;
};

type FinishStudyFormState = {
  endedAt: string;
  notes: string;
  correctQuestions: string;
  startedAt: string;
  totalQuestions: string;
  wrongQuestions: string;
};

type SessionFormState = {
  correctQuestions: string;
  endedAt: string;
  notes: string;
  questionPracticeId: string | null;
  startedAt: string;
  subjectId: string;
  totalQuestions: string;
  wrongQuestions: string;
};

type SubjectFormState = {
  name: string;
  notes: string;
  plannedHoursPerWeek: string;
};

const emptyBlockForm: BlockFormState = {
  dayIndex: "0",
  durationMinutes: "60",
  notes: "",
  startTime: "08:00",
  subjectId: "",
};

const emptyFinishStudyForm: FinishStudyFormState = {
  endedAt: "",
  notes: "",
  correctQuestions: "0",
  startedAt: "",
  totalQuestions: "0",
  wrongQuestions: "0",
};

const emptySessionForm: SessionFormState = {
  correctQuestions: "0",
  endedAt: "",
  notes: "",
  questionPracticeId: null,
  startedAt: "",
  subjectId: "",
  totalQuestions: "0",
  wrongQuestions: "0",
};

const emptySubjectForm: SubjectFormState = {
  name: "",
  notes: "",
  plannedHoursPerWeek: "1",
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

function getQuestionCounts(form: FinishStudyFormState) {
  const totalQuestions = Number(form.totalQuestions);
  const correctQuestions = Number(form.correctQuestions);
  const wrongQuestions = Number(form.wrongQuestions);

  return {
    correctQuestions: Number.isInteger(correctQuestions) ? correctQuestions : -1,
    isValid:
      Number.isInteger(totalQuestions) &&
      Number.isInteger(correctQuestions) &&
      Number.isInteger(wrongQuestions) &&
      totalQuestions >= 0 &&
      correctQuestions >= 0 &&
      wrongQuestions >= 0 &&
      correctQuestions + wrongQuestions === totalQuestions,
    totalQuestions: Number.isInteger(totalQuestions) ? totalQuestions : -1,
    wrongQuestions: Number.isInteger(wrongQuestions) ? wrongQuestions : -1,
  };
}

function getSessionQuestionCounts(form: SessionFormState) {
  return getQuestionCounts({
    endedAt: form.endedAt,
    notes: form.notes,
    correctQuestions: form.correctQuestions,
    startedAt: form.startedAt,
    totalQuestions: form.totalQuestions,
    wrongQuestions: form.wrongQuestions,
  });
}

function getBlockStartDate(
  block: StudyPlanBlock,
  week: ReturnType<typeof getWeek>
) {
  const day = week[block.dayIndex];
  const [hours = "0", minutes = "0"] = block.startTime.split(":");
  const date = new Date(day?.date ?? new Date());
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date;
}

function findQuestionPracticeForSession(
  session: StudySession,
  practices: StudyQuestionPractice[]
) {
  return (
    practices
      .filter(
        (practice) =>
          practice.subjectId === session.subjectId &&
          toLocalDayKey(practice.practiceDate) ===
            toLocalDayKey(session.startedAt)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0] ?? null
  );
}

function QuestionPerformancePanel({
  accuracyRate,
  correctQuestions,
  totalQuestions,
  wrongQuestions,
}: {
  accuracyRate: number;
  correctQuestions: number;
  totalQuestions: number;
  wrongQuestions: number;
}) {
  return (
    <div className="grid min-w-0 gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            Question performance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Right, wrong, and accuracy for the selected week and subject.
          </p>
        </div>
        <Badge className="shrink-0" variant="secondary">
          {accuracyRate}% accuracy
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-background/75 p-3">
          <div className="text-xs text-muted-foreground">Questions</div>
          <div className="mt-1 text-2xl font-semibold">{totalQuestions}</div>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/75 p-3">
          <div className="text-xs text-muted-foreground">Right</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-600">
            {correctQuestions}
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/75 p-3">
          <div className="text-xs text-muted-foreground">Wrong</div>
          <div className="mt-1 text-2xl font-semibold text-red-600">
            {wrongQuestions}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Accuracy</span>
          <span className="font-semibold">{accuracyRate}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(Math.max(accuracyRate, 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StudyPlannerPage() {
  "use no memo";

  const { data: subjects = [] } = useStudySubjects();
  const { data: sessions = [] } = useStudySessions();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [blockForm, setBlockForm] = useState<BlockFormState>(emptyBlockForm);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [finishingBlock, setFinishingBlock] = useState<StudyPlanBlock | null>(
    null
  );
  const [finishStudyForm, setFinishStudyForm] =
    useState<FinishStudyFormState>(emptyFinishStudyForm);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null
  );
  const [sessionForm, setSessionForm] =
    useState<SessionFormState>(emptySessionForm);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
  const [managedSubjectId, setManagedSubjectId] = useState("");
  const [subjectForm, setSubjectForm] =
    useState<SubjectFormState>(emptySubjectForm);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectNotes, setNewSubjectNotes] = useState("");
  const createSubject = useCreateStudySubject();
  const updateSubject = useUpdateStudySubject();
  const deleteSubject = useDeleteStudySubject();
  const createSession = useCreateStudySession();
  const updateSession = useUpdateStudySession();
  const createQuestionPractice = useCreateStudyQuestionPractice();
  const updateQuestionPractice = useUpdateStudyQuestionPractice();
  const deleteQuestionPractice = useDeleteStudyQuestionPractice();
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
  const { data: questionPractice = [] } = useStudyQuestionPractice({
    from: week[0].key,
    subjectId: subjectFilter === "all" ? undefined : subjectFilter,
    to: week[week.length - 1].key,
  });
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
  const questionSummary = getStudyQuestionSummary(questionPractice);
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

  const selectManagedSubject = (subject: StudySubject | undefined) => {
    setManagedSubjectId(subject?.id ?? "");
    setSubjectForm(
      subject
        ? {
            name: subject.name,
            notes: subject.notes ?? "",
            plannedHoursPerWeek: String(subject.plannedHoursPerWeek ?? 1),
          }
        : emptySubjectForm
    );
  };

  const openSubjectManager = () => {
    const subject =
      subjects.find((item) => item.id === subjectFilter) ?? subjects[0];

    selectManagedSubject(subject);
    setIsSubjectManagerOpen(true);
  };

  const handleSubjectUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!managedSubjectId || !subjectForm.name.trim()) {
      return;
    }

    await updateSubject.mutateAsync({
      id: managedSubjectId,
      data: {
        name: subjectForm.name.trim(),
        notes: subjectForm.notes.trim() || null,
        plannedHoursPerWeek: Math.max(
          1,
          Math.floor(Number(subjectForm.plannedHoursPerWeek) || 1)
        ),
      },
    });
  };

  const handleSubjectDelete = async () => {
    const subject = subjects.find((item) => item.id === managedSubjectId);

    if (!subject) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${subject.name}? This also deletes its plans, sessions, mistakes, and question logs.`
    );

    if (!confirmed) {
      return;
    }

    await deleteSubject.mutateAsync(subject.id);

    if (subjectFilter === subject.id) {
      setSubjectFilter("all");
    }

    const nextSubject = subjects.find((item) => item.id !== subject.id);
    selectManagedSubject(nextSubject);

    if (!nextSubject) {
      setIsSubjectManagerOpen(false);
    }
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

  const openFinishStudyDialog = (block: StudyPlanBlock) => {
    const startedAt = getBlockStartDate(block, week);
    const endedAt = new Date(startedAt);
    endedAt.setMinutes(startedAt.getMinutes() + block.durationMinutes);

    setFinishingBlock(block);
    setFinishStudyForm({
      endedAt: toDateTimeInputValue(endedAt),
      notes: block.notes ?? "",
      correctQuestions: "0",
      startedAt: toDateTimeInputValue(startedAt),
      totalQuestions: "0",
      wrongQuestions: "0",
    });
  };

  const handleFinishStudySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!finishingBlock) {
      return;
    }

    if (!getMinutesBetween(finishStudyForm.startedAt, finishStudyForm.endedAt)) {
      return;
    }

    const questionCounts = getQuestionCounts(finishStudyForm);

    if (!questionCounts.isValid) {
      return;
    }

    await createSession.mutateAsync({
      endedAt: new Date(finishStudyForm.endedAt).toISOString(),
      notes: finishStudyForm.notes.trim() || null,
      startedAt: new Date(finishStudyForm.startedAt).toISOString(),
      subjectId: finishingBlock.subjectId,
    });

    if (questionCounts.totalQuestions > 0) {
      await createQuestionPractice.mutateAsync({
        correctQuestions: questionCounts.correctQuestions,
        notes: finishStudyForm.notes.trim() || null,
        practiceDate: new Date(finishStudyForm.startedAt).toISOString(),
        subjectId: finishingBlock.subjectId,
        totalQuestions: questionCounts.totalQuestions,
        wrongQuestions: questionCounts.wrongQuestions,
      });
    }

    setFinishingBlock(null);
    setFinishStudyForm(emptyFinishStudyForm);
  };

  const openEditSessionDialog = (session: StudySession) => {
    const matchingPractice = findQuestionPracticeForSession(
      session,
      questionPractice
    );

    setEditingSession(session);
    setSessionForm({
      correctQuestions: String(matchingPractice?.correctQuestions ?? 0),
      endedAt: toDateTimeInputValue(new Date(session.endedAt)),
      notes: session.notes ?? "",
      questionPracticeId: matchingPractice?.id ?? null,
      startedAt: toDateTimeInputValue(new Date(session.startedAt)),
      subjectId: session.subjectId,
      totalQuestions: String(matchingPractice?.totalQuestions ?? 0),
      wrongQuestions: String(matchingPractice?.wrongQuestions ?? 0),
    });
  };

  const handleSessionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const questionCounts = getSessionQuestionCounts(sessionForm);

    if (
      !editingSession ||
      !sessionForm.subjectId ||
      !getMinutesBetween(sessionForm.startedAt, sessionForm.endedAt) ||
      !questionCounts.isValid
    ) {
      return;
    }

    await updateSession.mutateAsync({
      id: editingSession.id,
      data: {
        endedAt: new Date(sessionForm.endedAt).toISOString(),
        notes: sessionForm.notes.trim() || null,
        startedAt: new Date(sessionForm.startedAt).toISOString(),
        subjectId: sessionForm.subjectId,
      },
    });

    if (questionCounts.totalQuestions > 0) {
      const questionPracticePayload = {
        correctQuestions: questionCounts.correctQuestions,
        notes: sessionForm.notes.trim() || null,
        practiceDate: new Date(sessionForm.startedAt).toISOString(),
        subjectId: sessionForm.subjectId,
        totalQuestions: questionCounts.totalQuestions,
        wrongQuestions: questionCounts.wrongQuestions,
      };

      if (sessionForm.questionPracticeId) {
        await updateQuestionPractice.mutateAsync({
          data: questionPracticePayload,
          id: sessionForm.questionPracticeId,
        });
      } else {
        await createQuestionPractice.mutateAsync(questionPracticePayload);
      }
    } else if (sessionForm.questionPracticeId) {
      await deleteQuestionPractice.mutateAsync(sessionForm.questionPracticeId);
    }

    setEditingSession(null);
    setSessionForm(emptySessionForm);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHero
        badgeIcon={GraduationCap}
        badgeLabel="Study planning"
        compact
        title="Study Plan"
        description="Plan the week, finish blocks, and track studied time plus question accuracy."
        stats={[
          { label: "Subjects", value: subjects.length },
          { label: "Planned", value: formatStudyDuration(plannedMinutes) },
          { label: "Studied", value: formatStudyDuration(studiedMinutes) },
        ]}
      />

      <section className="grid gap-4">
        <div className="grid gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,18rem)_auto_auto] sm:items-center">
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
          <div className="flex flex-wrap gap-2 lg:justify-end">
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
                      disabled={!newSubjectName.trim() || createSubject.isPending}
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
              open={isSubjectManagerOpen}
              onOpenChange={setIsSubjectManagerOpen}
            >
              <Button
                disabled={!subjects.length}
                onClick={openSubjectManager}
                type="button"
                variant="outline"
              >
                <Pencil className="h-4 w-4" />
                Manage subjects
              </Button>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Manage subjects</DialogTitle>
                </DialogHeader>
                <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
                  <div className="grid max-h-[22rem] min-w-0 content-start gap-2 overflow-y-auto rounded-lg border border-border/70 bg-secondary/20 p-2">
                    {subjects.map((subject) => (
                      <Button
                        className="h-auto min-w-0 justify-start px-3 py-2 text-left"
                        key={subject.id}
                        onClick={() => selectManagedSubject(subject)}
                        type="button"
                        variant={
                          managedSubjectId === subject.id
                            ? "secondary"
                            : "ghost"
                        }
                      >
                        <span className="min-w-0 truncate">{subject.name}</span>
                      </Button>
                    ))}
                  </div>
                  <form
                    className="grid min-w-0 content-start gap-3"
                    onSubmit={handleSubjectUpdate}
                  >
                    <Input
                      className="min-w-0"
                      onChange={(event) =>
                        setSubjectForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Subject name"
                      value={subjectForm.name}
                    />
                    <Input
                      className="min-w-0"
                      min="1"
                      onChange={(event) =>
                        setSubjectForm((current) => ({
                          ...current,
                          plannedHoursPerWeek: event.target.value,
                        }))
                      }
                      placeholder="Hours per week"
                      type="number"
                      value={subjectForm.plannedHoursPerWeek}
                    />
                    <Input
                      className="min-w-0"
                      onChange={(event) =>
                        setSubjectForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Notes"
                      value={subjectForm.notes}
                    />
                    <DialogFooter className="gap-2 sm:justify-between">
                      <Button
                        disabled={!managedSubjectId || deleteSubject.isPending}
                        onClick={handleSubjectDelete}
                        type="button"
                        variant="destructive"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </Button>
                      <Button
                        disabled={
                          !managedSubjectId ||
                          !subjectForm.name.trim() ||
                          updateSubject.isPending
                        }
                        type="submit"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Update
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
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

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="min-w-0 rounded-lg border border-border/70 bg-card p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">Planned vs studied</h3>
                <p className="text-sm text-muted-foreground">
                  Compare planned hours against recorded study sessions.
                </p>
              </div>
              <Badge variant="outline">{weekRange}</Badge>
            </div>
            <ChartContainer
              config={chartConfig}
              className="h-[230px] w-full sm:h-[260px]"
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

          <QuestionPerformancePanel
            accuracyRate={questionSummary.accuracyRate}
            correctQuestions={questionSummary.correctQuestions}
            totalQuestions={questionSummary.totalQuestions}
            wrongQuestions={questionSummary.wrongQuestions}
          />
        </div>
      </section>

      <StudyWeekBoard
        blocks={filteredBlocks}
        deleteBlock={(id) => deleteBlock.mutate(id)}
        deleteSession={(id) => deleteSession.mutate(id)}
        editBlock={editBlock}
        editSession={openEditSessionDialog}
        finishBlock={openFinishStudyDialog}
        sessions={weekSessions}
        setWeekOffset={setWeekOffset}
        week={week}
        weekOffset={weekOffset}
        weekRange={weekRange}
      />

      <Dialog
        open={Boolean(finishingBlock)}
        onOpenChange={(open) => {
          if (!open) {
            setFinishingBlock(null);
            setFinishStudyForm(emptyFinishStudyForm);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish planned study</DialogTitle>
            <DialogDescription>
              Save studied time for{" "}
              {finishingBlock
                ? getBlockSubjectName(finishingBlock)
                : "this subject"}
              .
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={handleFinishStudySubmit}>
            <Input
              onChange={(event) =>
                setFinishStudyForm((current) => ({
                  ...current,
                  startedAt: event.target.value,
                }))
              }
              type="datetime-local"
              value={finishStudyForm.startedAt}
            />
            <Input
              onChange={(event) =>
                setFinishStudyForm((current) => ({
                  ...current,
                  endedAt: event.target.value,
                }))
              }
              type="datetime-local"
              value={finishStudyForm.endedAt}
            />
            <Input
              onChange={(event) =>
                setFinishStudyForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Optional notes"
              value={finishStudyForm.notes}
            />
            <div className="grid gap-2 rounded-lg border border-border/70 bg-background/70 p-3">
              <div>
                <h4 className="text-sm font-semibold">Question practice</h4>
                <p className="text-xs text-muted-foreground">
                  Optional. Save how many questions you got right and wrong for
                  the dashboard graph.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 text-sm font-medium">
                  Total questions
                  <Input
                    min="0"
                    onChange={(event) =>
                      setFinishStudyForm((current) => ({
                        ...current,
                        totalQuestions: event.target.value,
                      }))
                    }
                    type="number"
                    value={finishStudyForm.totalQuestions}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Right
                  <Input
                    min="0"
                    onChange={(event) =>
                      setFinishStudyForm((current) => ({
                        ...current,
                        correctQuestions: event.target.value,
                      }))
                    }
                    type="number"
                    value={finishStudyForm.correctQuestions}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Wrong
                  <Input
                    min="0"
                    onChange={(event) =>
                      setFinishStudyForm((current) => ({
                        ...current,
                        wrongQuestions: event.target.value,
                      }))
                    }
                    type="number"
                    value={finishStudyForm.wrongQuestions}
                  />
                </label>
              </div>
            </div>
            {!getQuestionCounts(finishStudyForm).isValid ? (
              <p className="rounded-md bg-secondary/35 p-3 text-sm text-muted-foreground">
                Right plus wrong must equal total questions.
              </p>
            ) : null}
            <DialogFooter>
              <Button
                disabled={
                  !getMinutesBetween(
                    finishStudyForm.startedAt,
                    finishStudyForm.endedAt
                  ) ||
                  !getQuestionCounts(finishStudyForm).isValid ||
                  createSession.isPending ||
                  createQuestionPractice.isPending
                }
                type="submit"
              >
                <CheckCircle2 className="h-4 w-4" />
                Add studied time
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingSession)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSession(null);
            setSessionForm(emptySessionForm);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit studied time</DialogTitle>
            <DialogDescription>
              Update the subject, start time, finish time, or notes for this
              week board study entry.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={handleSessionSubmit}>
            <Select
              value={sessionForm.subjectId}
              onValueChange={(value) =>
                setSessionForm((current) => ({
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
            <div className="grid gap-2 rounded-lg border border-border/70 bg-background/70 p-3">
              <div>
                <h4 className="text-sm font-semibold">Question practice</h4>
                <p className="text-xs text-muted-foreground">
                  Update the matching question tracker entry for this study
                  session. Use zero total questions to remove it.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 text-sm font-medium">
                  Total questions
                  <Input
                    min="0"
                    onChange={(event) =>
                      setSessionForm((current) => ({
                        ...current,
                        totalQuestions: event.target.value,
                      }))
                    }
                    type="number"
                    value={sessionForm.totalQuestions}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Right
                  <Input
                    min="0"
                    onChange={(event) =>
                      setSessionForm((current) => ({
                        ...current,
                        correctQuestions: event.target.value,
                      }))
                    }
                    type="number"
                    value={sessionForm.correctQuestions}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Wrong
                  <Input
                    min="0"
                    onChange={(event) =>
                      setSessionForm((current) => ({
                        ...current,
                        wrongQuestions: event.target.value,
                      }))
                    }
                    type="number"
                    value={sessionForm.wrongQuestions}
                  />
                </label>
              </div>
            </div>
            {!getMinutesBetween(sessionForm.startedAt, sessionForm.endedAt) ? (
              <p className="rounded-md bg-secondary/35 p-3 text-sm text-muted-foreground">
                Finish time must be after start time.
              </p>
            ) : null}
            {!getSessionQuestionCounts(sessionForm).isValid ? (
              <p className="rounded-md bg-secondary/35 p-3 text-sm text-muted-foreground">
                Right plus wrong must equal total questions.
              </p>
            ) : null}
            <DialogFooter>
              <Button
                disabled={
                  !sessionForm.subjectId ||
                  !getMinutesBetween(sessionForm.startedAt, sessionForm.endedAt) ||
                  !getSessionQuestionCounts(sessionForm).isValid ||
                  updateSession.isPending ||
                  createQuestionPractice.isPending ||
                  updateQuestionPractice.isPending ||
                  deleteQuestionPractice.isPending
                }
                type="submit"
              >
                <CheckCircle2 className="h-4 w-4" />
                Update studied time
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function StudyWeekBoard({
  blocks,
  deleteBlock,
  deleteSession,
  editBlock,
  editSession,
  finishBlock,
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
  editSession: (session: StudySession) => void;
  finishBlock: (block: StudyPlanBlock) => void;
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
        <div className="p-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
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
                  className="min-w-0 rounded-lg border border-border/70 bg-card p-3"
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
                            <div className="grid gap-1">
                              <Button
                                className="h-8 justify-center"
                                onClick={() => finishBlock(block)}
                                type="button"
                                variant="outline"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Finish
                              </Button>
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
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  aria-label="Edit study session"
                                  className="h-7 w-7"
                                  onClick={() => editSession(session)}
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
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
