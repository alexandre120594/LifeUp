"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  TimerReset,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useCreatePomodoroSession,
  useDeletePomodoroSession,
  usePomodoroDashboard,
  useUpdatePomodoroSession,
} from "@/hooks/usePomodoroMutations";
import {
  useCreateStudySubject,
  useStudySubjects,
} from "@/hooks/useStudyMutations";
import { formatFocusDuration } from "@/lib/pomodoro";
import type {
  PomodoroSession,
  PomodoroSummaryItem,
} from "@/types/BaseInterfaces";

type FocusPhase = "focus" | "break";

const defaultFocusMinutes = 25;
const defaultBreakMinutes = 5;
const defaultTargetCycles = 4;
const focusTimerStorageKey = "lifeup:study-focus-timer";
const legacyPomodoroStorageKey = "lifeup:pomodoro-timer";
const focusHistoryPageSize = 6;
const subjectHoursPageSize = 3;

type PersistedFocusTimer = {
  breakMinutes: number;
  completedCycles: number;
  focusMinutes: number;
  focusStartedAt: string | null;
  isRunning: boolean;
  notes: string;
  phase: FocusPhase;
  phaseEndsAt: string | null;
  remainingSeconds: number;
  selectedSubjectId?: string;
  sessionName: string;
  targetCycles: number;
};

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export function PomodoroPanel() {
  "use no memo";

  const [focusMinutes, setFocusMinutes] = useState(defaultFocusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(defaultBreakMinutes);
  const [targetCycles, setTargetCycles] = useState(defaultTargetCycles);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [phase, setPhase] = useState<FocusPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultFocusMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectNotes, setNewSubjectNotes] = useState("");
  const [hasRestoredTimer, setHasRestoredTimer] = useState(false);
  const focusStartedAtRef = useRef<Date | null>(null);
  const phaseEndsAtRef = useRef<Date | null>(null);
  const autoSaveInProgressRef = useRef(false);
  const { data: subjects = [] } = useStudySubjects();
  const createSubject = useCreateStudySubject();
  const { data: pomodoro } = usePomodoroDashboard();
  const { mutate: createSession, isPending } = useCreatePomodoroSession();

  const phaseTotalSeconds =
    phase === "focus" ? focusMinutes * 60 : breakMinutes * 60;
  const elapsedPhaseSeconds = Math.max(phaseTotalSeconds - remainingSeconds, 0);
  const progressPercent =
    phaseTotalSeconds > 0
      ? Math.round((elapsedPhaseSeconds / phaseTotalSeconds) * 100)
      : 0;
  const canSavePartial = phase === "focus" && elapsedPhaseSeconds >= 60;
  const hasSubjects = subjects.length > 0;
  const canSaveFocus = Boolean(selectedSubjectId) && hasSubjects;

  useEffect(() => {
    const savedTimer =
      window.localStorage.getItem(focusTimerStorageKey) ??
      window.localStorage.getItem(legacyPomodoroStorageKey);

    if (!savedTimer) {
      setHasRestoredTimer(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedTimer) as Partial<
        PersistedFocusTimer & { workMinutes: number }
      >;
      let savedRemainingSeconds =
        typeof parsed.remainingSeconds === "number"
          ? parsed.remainingSeconds
          : defaultFocusMinutes * 60;
      const savedPhaseEndsAt =
        typeof parsed.phaseEndsAt === "string" ? new Date(parsed.phaseEndsAt) : null;

      if (
        parsed.isRunning &&
        savedPhaseEndsAt &&
        !Number.isNaN(savedPhaseEndsAt.getTime())
      ) {
        savedRemainingSeconds = Math.max(
          Math.ceil((savedPhaseEndsAt.getTime() - Date.now()) / 1000),
          0
        );
        phaseEndsAtRef.current = savedPhaseEndsAt;
      }

      const savedFocusMinutes =
        typeof parsed.focusMinutes === "number"
          ? parsed.focusMinutes
          : parsed.workMinutes;

      setFocusMinutes(
        typeof savedFocusMinutes === "number"
          ? Math.min(Math.max(savedFocusMinutes, 1), 180)
          : defaultFocusMinutes
      );
      setBreakMinutes(
        typeof parsed.breakMinutes === "number"
          ? Math.min(Math.max(parsed.breakMinutes, 1), 60)
          : defaultBreakMinutes
      );
      setTargetCycles(
        typeof parsed.targetCycles === "number"
          ? Math.min(Math.max(parsed.targetCycles, 1), 12)
          : defaultTargetCycles
      );
      setCompletedCycles(
        typeof parsed.completedCycles === "number"
          ? Math.max(parsed.completedCycles, 0)
          : 0
      );
      setPhase(parsed.phase === "break" ? "break" : "focus");
      setRemainingSeconds(savedRemainingSeconds);
      setIsRunning(Boolean(parsed.isRunning));
      setNotes(typeof parsed.notes === "string" ? parsed.notes : "");
      setSessionName(
        typeof parsed.sessionName === "string" ? parsed.sessionName : ""
      );
      setSelectedSubjectId(
        typeof parsed.selectedSubjectId === "string"
          ? parsed.selectedSubjectId
          : ""
      );
      focusStartedAtRef.current = parsed.focusStartedAt
        ? new Date(parsed.focusStartedAt)
        : null;
      window.localStorage.removeItem(legacyPomodoroStorageKey);
    } catch {
      window.localStorage.removeItem(focusTimerStorageKey);
      window.localStorage.removeItem(legacyPomodoroStorageKey);
    } finally {
      setHasRestoredTimer(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredTimer) {
      return;
    }

    const timerSnapshot: PersistedFocusTimer = {
      breakMinutes,
      completedCycles,
      focusMinutes,
      focusStartedAt: focusStartedAtRef.current?.toISOString() ?? null,
      isRunning,
      notes,
      phase,
      phaseEndsAt: phaseEndsAtRef.current?.toISOString() ?? null,
      remainingSeconds,
      selectedSubjectId,
      sessionName,
      targetCycles,
    };

    window.localStorage.setItem(
      focusTimerStorageKey,
      JSON.stringify(timerSnapshot)
    );
  }, [
    breakMinutes,
    completedCycles,
    focusMinutes,
    hasRestoredTimer,
    isRunning,
    notes,
    phase,
    remainingSeconds,
    selectedSubjectId,
    sessionName,
    targetCycles,
  ]);

  useEffect(() => {
    if (!subjects.length) {
      setSelectedSubjectId("");
      return;
    }

    if (!selectedSubjectId || !subjects.some((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  const saveFocusSession = useCallback(
    ({
      durationMinutes,
      endedAt,
      onSuccess,
    }: {
      durationMinutes: number;
      endedAt: Date;
      onSuccess: () => void;
    }) => {
      if (!selectedSubjectId) {
        return;
      }

      const startedAt =
        focusStartedAtRef.current ??
        new Date(endedAt.getTime() - durationMinutes * 60 * 1000);

      createSession(
        {
          durationMinutes,
          endedAt: endedAt.toISOString(),
          focusType: "study",
          notes,
          title:
            sessionName.trim() ||
            subjects.find((subject) => subject.id === selectedSubjectId)?.name ||
            "Study focus",
          startedAt: startedAt.toISOString(),
          subjectId: selectedSubjectId,
        },
        {
          onError: () => {
            autoSaveInProgressRef.current = false;
          },
          onSuccess,
        }
      );
    },
    [createSession, notes, selectedSubjectId, sessionName, subjects]
  );

  const resetTimer = useCallback(
    (nextPhase: FocusPhase = "focus") => {
      setIsRunning(false);
      setPhase(nextPhase);
      setRemainingSeconds(
        nextPhase === "focus" ? focusMinutes * 60 : breakMinutes * 60
      );
      focusStartedAtRef.current = null;
      phaseEndsAtRef.current = null;
    },
    [breakMinutes, focusMinutes]
  );

  const pauseTimer = () => {
    setIsRunning(false);
    phaseEndsAtRef.current = null;
  };

  const completeFocusCycle = useCallback(() => {
    if (autoSaveInProgressRef.current || isPending || !canSaveFocus) {
      return;
    }

    setIsRunning(false);
    phaseEndsAtRef.current = null;
    autoSaveInProgressRef.current = true;
    saveFocusSession({
      durationMinutes: focusMinutes,
      endedAt: new Date(),
      onSuccess: () => {
        autoSaveInProgressRef.current = false;
        const nextCompletedCycles = completedCycles + 1;
        setCompletedCycles(nextCompletedCycles);
        focusStartedAtRef.current = null;
        setNotes("");

        if (nextCompletedCycles >= targetCycles) {
          setIsRunning(false);
          setPhase("focus");
          setRemainingSeconds(focusMinutes * 60);
          return;
        }

        setPhase("break");
        setRemainingSeconds(breakMinutes * 60);
        phaseEndsAtRef.current = new Date(Date.now() + breakMinutes * 60 * 1000);
        setIsRunning(true);
      },
    });
  }, [
    breakMinutes,
    completedCycles,
    focusMinutes,
    isPending,
    saveFocusSession,
    targetCycles,
    canSaveFocus,
  ]);

  const completeBreak = useCallback(() => {
    setPhase("focus");
    setRemainingSeconds(focusMinutes * 60);
    focusStartedAtRef.current = null;
    phaseEndsAtRef.current = new Date(Date.now() + focusMinutes * 60 * 1000);
  }, [focusMinutes]);

  useEffect(() => {
    if (!isRunning || remainingSeconds > 0) {
      return;
    }

    if (phase === "focus") {
      completeFocusCycle();
      return;
    }

    completeBreak();
  }, [completeBreak, completeFocusCycle, isRunning, phase, remainingSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (!phaseEndsAtRef.current) {
      phaseEndsAtRef.current = new Date(Date.now() + remainingSeconds * 1000);
    }

    const interval = window.setInterval(() => {
      const endsAt = phaseEndsAtRef.current?.getTime() ?? Date.now();
      setRemainingSeconds(Math.max(Math.ceil((endsAt - Date.now()) / 1000), 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const updateFocusMinutes = (value: number) => {
    const nextValue = Math.min(Math.max(value || defaultFocusMinutes, 1), 180);
    setFocusMinutes(nextValue);
    if (!isRunning && phase === "focus") {
      setRemainingSeconds(nextValue * 60);
    }
  };

  const updateBreakMinutes = (value: number) => {
    const nextValue = Math.min(Math.max(value || defaultBreakMinutes, 1), 60);
    setBreakMinutes(nextValue);
    if (!isRunning && phase === "break") {
      setRemainingSeconds(nextValue * 60);
    }
  };

  const updateTargetCycles = (value: number) => {
    setTargetCycles(Math.min(Math.max(value || defaultTargetCycles, 1), 12));
  };

  const startTimer = () => {
    if (!canSaveFocus) {
      return;
    }

    if (phase === "focus") {
      focusStartedAtRef.current = focusStartedAtRef.current ?? new Date();
    }

    phaseEndsAtRef.current = new Date(Date.now() + remainingSeconds * 1000);
    setIsRunning(true);
  };

  const handleStartClick = () => {
    if (focusStartedAtRef.current || phase === "break") {
      startTimer();
      return;
    }

    setIsSetupDialogOpen(true);
  };

  const startConfiguredSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sessionName.trim() || !canSaveFocus) {
      return;
    }

    setIsSetupDialogOpen(false);
    startTimer();
  };

  const savePartialSession = () => {
    if (!canSavePartial || !canSaveFocus) {
      return;
    }

    pauseTimer();
    const durationMinutes = Math.max(Math.round(elapsedPhaseSeconds / 60), 1);

    saveFocusSession({
      durationMinutes,
      endedAt: new Date(),
      onSuccess: () => {
        setNotes("");
        resetTimer("focus");
      },
    });
  };

  const handleCreateSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newSubjectName.trim();

    if (!name) {
      return;
    }

    const subject = await createSubject.mutateAsync({
      name,
      notes: newSubjectNotes.trim() || null,
      plannedHoursPerWeek: 1,
    });

    setSelectedSubjectId(subject.id);
    setNewSubjectName("");
    setNewSubjectNotes("");
    setIsSubjectDialogOpen(false);
  };

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-background/85 shadow-sm backdrop-blur">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex min-w-0 items-center gap-2">
            <TimerReset className="h-5 w-5 text-primary" />
            <span className="min-w-0 truncate">Study focus timer</span>
          </CardTitle>
          <div className="min-w-0 truncate text-sm text-muted-foreground">
            Subject-based study sessions
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-5 px-4 sm:px-6">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <section className="grid min-h-[420px] min-w-0 content-start gap-3 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-4 sm:p-5">
            <div className="min-w-0 overflow-hidden rounded-lg bg-secondary/40 p-5 text-center sm:p-7">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground">
                {phase === "focus" ? (
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Pause className="h-3.5 w-3.5 text-primary" />
                )}
                <span className="min-w-0 truncate">
                  {phase === "focus" ? "Study focus" : "Break"}
                </span>
              </div>
              <div className="mt-4 text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl lg:text-7xl">
                {formatTimer(remainingSeconds)}
              </div>
              <p className="mx-auto mt-4 max-w-2xl break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                Save study time by subject.
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Cycle {Math.min(completedCycles + 1, targetCycles)} of{" "}
                {targetCycles} / {completedCycles} completed
              </div>
            </div>

            <div className="grid min-w-0 gap-2 pt-1 sm:grid-cols-4">
              <Button
                className="min-w-0 gap-2"
                disabled={isRunning || isPending}
                onClick={handleStartClick}
                type="button"
              >
                <Play className="h-4 w-4" />
                <span className="min-w-0 truncate">Start</span>
              </Button>
              <Button
                className="min-w-0 gap-2"
                disabled={!isRunning}
                onClick={pauseTimer}
                type="button"
                variant="outline"
              >
                <Pause className="h-4 w-4" />
                <span className="min-w-0 truncate">Pause</span>
              </Button>
              <Button
                className="min-w-0 gap-2"
                onClick={() => {
                  setCompletedCycles(0);
                  resetTimer("focus");
                }}
                type="button"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="min-w-0 truncate">Reset</span>
              </Button>
              <Button
                className="min-w-0 gap-2"
                disabled={!canSavePartial || isPending || !canSaveFocus}
                onClick={savePartialSession}
                type="button"
                variant="secondary"
              >
                <Save className="h-4 w-4" />
                <span className="min-w-0 truncate">Save</span>
              </Button>
            </div>
          </section>

          <aside className="min-w-0">
            <SubjectHoursChart subjects={pomodoro?.bySubject ?? []} />
          </aside>
        </div>

        <section className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <FocusMetric
              label="Total focused"
              value={formatFocusDuration(pomodoro?.totalMinutes ?? 0)}
            />
            <FocusMetric
              label="Studied"
              value={formatFocusDuration(pomodoro?.studyMinutes ?? 0)}
            />
          </div>

          <FocusHistory
            sessions={pomodoro?.sessions ?? []}
            subjectSummaries={pomodoro?.bySubject ?? []}
            subjects={subjects}
          />
        </section>
      </CardContent>
      <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up focus session</DialogTitle>
            <DialogDescription>
              Choose the name, subject, timing, and cycle target before starting.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={startConfiguredSession}>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Session name</span>
              <Input
                autoFocus
                maxLength={120}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder="Example: Calculus chapter 4"
                value={sessionName}
              />
            </label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">Subject</label>
                <Dialog
                  open={isSubjectDialogOpen}
                  onOpenChange={setIsSubjectDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="h-8 gap-1 px-2" type="button" variant="outline">
                      <Plus className="h-3.5 w-3.5" />
                      Add subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add subject</DialogTitle>
                    </DialogHeader>
                    <form className="grid gap-3" onSubmit={handleCreateSubject}>
                      <Input
                        onChange={(event) => setNewSubjectName(event.target.value)}
                        placeholder="Subject name"
                        value={newSubjectName}
                      />
                      <Input
                        onChange={(event) => setNewSubjectNotes(event.target.value)}
                        placeholder="Notes"
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
              </div>
              <Select
                disabled={!subjects.length}
                onValueChange={setSelectedSubjectId}
                value={selectedSubjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberSetting
                label="Focus"
                max={180}
                min={1}
                onChange={updateFocusMinutes}
                value={focusMinutes}
              />
              <NumberSetting
                label="Break"
                max={60}
                min={1}
                onChange={updateBreakMinutes}
                value={breakMinutes}
              />
              <NumberSetting
                label="Cycles"
                max={12}
                min={1}
                onChange={updateTargetCycles}
                value={targetCycles}
              />
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Note</span>
              <Input
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional note"
                value={notes}
              />
            </label>
            {!subjects.length ? (
              <div className="rounded-md bg-secondary/35 p-3 text-sm text-muted-foreground">
                Add a subject before starting.
              </div>
            ) : null}
            <DialogFooter>
              <Button
                disabled={!sessionName.trim() || !canSaveFocus}
                type="submit"
              >
                <Play className="h-4 w-4" />
                Start session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SubjectHoursChart({ subjects }: { subjects: PomodoroSummaryItem[] }) {
  const [page, setPage] = useState(0);
  const sortedSubjects = [...subjects].sort((a, b) => b.minutes - a.minutes);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedSubjects.length / subjectHoursPageSize)
  );
  const currentPage = Math.min(page, totalPages - 1);
  const visibleSubjects = sortedSubjects.slice(
    currentPage * subjectHoursPageSize,
    (currentPage + 1) * subjectHoursPageSize
  );
  const totalMinutes = sortedSubjects.reduce(
    (total, subject) => total + subject.minutes,
    0
  );
  const maxMinutes = Math.max(
    ...sortedSubjects.map((subject) => subject.minutes),
    1
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-4">
      <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="min-w-0 truncate">Hours by subject</span>
        </div>
        <div className="shrink-0 rounded-md bg-secondary/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {formatFocusDuration(totalMinutes)} total
        </div>
      </div>
      {sortedSubjects.length ? (
        <div className="grid min-w-0 gap-2">
          {visibleSubjects.map((subject, index) => {
            const share = totalMinutes
              ? Math.round((subject.minutes / totalMinutes) * 100)
              : 0;
            const width = Math.max((subject.minutes / maxMinutes) * 100, 6);

            return (
              <div
                className="grid min-w-0 gap-1.5 rounded-lg border border-border/50 bg-secondary/20 p-2.5 transition hover:border-primary/30 hover:bg-secondary/30"
                key={subject.id}
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background text-xs font-semibold text-muted-foreground">
                      {currentPage * subjectHoursPageSize + index + 1}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium">
                      {subject.title}
                    </span>
                  </div>
                  <div className="shrink-0 text-right text-sm font-semibold">
                    {formatFocusDuration(subject.minutes)}
                  </div>
                </div>
                <div className="grid min-w-0 gap-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        backgroundColor: subject.color ?? undefined,
                        width: `${width}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{share}% of saved focus</span>
                    <span>{Math.round(subject.minutes / 60 * 10) / 10}h</span>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedSubjects.length > subjectHoursPageSize ? (
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
              <span className="text-xs text-muted-foreground">
                {currentPage * subjectHoursPageSize + 1}–
                {Math.min(
                  (currentPage + 1) * subjectHoursPageSize,
                  sortedSubjects.length
                )}{" "}
                of {sortedSubjects.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Previous subject hours page"
                  className="h-8 w-8"
                  disabled={currentPage === 0}
                  onClick={() =>
                    setPage((current) => Math.max(0, current - 1))
                  }
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-12 text-center text-xs font-medium">
                  {currentPage + 1}/{totalPages}
                </span>
                <Button
                  aria-label="Next subject hours page"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages - 1, current + 1)
                    )
                  }
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
          Save a focus session to see subject hours.
        </div>
      )}
    </div>
  );
}

function NumberSetting({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="grid min-w-0 gap-1 text-sm">
      <span className="text-xs font-medium text-muted-foreground">
        {label} min
      </span>
      <Input
        className="min-w-0"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function FocusMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="truncate text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-semibold [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}

function FocusHistory({
  sessions,
  subjectSummaries,
  subjects,
}: {
  sessions: PomodoroSession[];
  subjectSummaries: PomodoroSummaryItem[];
  subjects: Array<{ id: string; name: string }>;
}) {
  const [page, setPage] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [editingSession, setEditingSession] = useState<PomodoroSession | null>(
    null
  );
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubjectId, setEditedSubjectId] = useState("");
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeletePomodoroSession();
  const updateSession = useUpdatePomodoroSession();
  const filteredSessions =
    selectedSubjectId === "all"
      ? sessions
      : sessions.filter(
          (session) => (session.subjectId ?? "unknown") === selectedSubjectId
        );
  const totalPages = Math.max(
    Math.ceil(filteredSessions.length / focusHistoryPageSize),
    1
  );
  const currentPage = Math.min(page, totalPages);
  const visibleSessions = filteredSessions.slice(
    (currentPage - 1) * focusHistoryPageSize,
    currentPage * focusHistoryPageSize
  );

  const handleDeleteSession = (session: PomodoroSession) => {
    const confirmed = window.confirm(
      `Delete ${formatFocusDuration(session.durationMinutes)} from ${
        session.subject?.name ?? "No subject"
      }?`
    );

    if (confirmed) {
      deleteSession(session.id);
    }
  };

  const openEditSession = (session: PomodoroSession) => {
    setEditingSession(session);
    setEditedTitle(
      session.title?.trim() || session.subject?.name || "Study focus"
    );
    setEditedSubjectId(session.subjectId ?? "");
  };

  const handleUpdateSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSession || !editedTitle.trim() || !editedSubjectId) {
      return;
    }

    updateSession.mutate(
      {
        id: editingSession.id,
        subjectId: editedSubjectId,
        title: editedTitle.trim(),
      },
      {
        onSuccess: () => {
          setEditingSession(null);
          setEditedTitle("");
          setEditedSubjectId("");
        },
      }
    );
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-background/70">
      <div className="flex flex-col gap-3 border-b border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <Clock3 className="h-4 w-4 text-primary" />
            <span className="truncate">Study focus history</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {filteredSessions.length
              ? `${filteredSessions.length} saved sessions`
              : "No saved sessions yet"}
          </div>
        </div>
        {filteredSessions.length ? (
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                aria-label="Previous study focus history page"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => setPage(Math.max(currentPage - 1, 1))}
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Next study focus history page"
                className="h-8 w-8"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {subjectSummaries.length > 1 ? (
        <div className="flex min-w-0 gap-2 overflow-x-auto border-b border-border/70 p-3">
          <Button
            className="h-8 shrink-0"
            onClick={() => {
              setSelectedSubjectId("all");
              setPage(1);
            }}
            type="button"
            variant={selectedSubjectId === "all" ? "default" : "outline"}
          >
            All
          </Button>
          {subjectSummaries.map((subject) => (
            <Button
              className="h-8 shrink-0"
              key={subject.id}
              onClick={() => {
                setSelectedSubjectId(subject.id);
                setPage(1);
              }}
              type="button"
              variant={selectedSubjectId === subject.id ? "default" : "outline"}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: subject.color ?? undefined }}
              />
              {subject.title}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="grid min-w-0 gap-2 p-3">
        {filteredSessions.length ? (
          visibleSessions.map((session) => (
            <div
              className="grid min-w-0 gap-3 rounded-lg border border-border/50 bg-secondary/30 px-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
              key={session.id}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="min-w-0 truncate font-medium">
                    {session.title?.trim() ||
                      session.subject?.name ||
                      "Study focus"}
                  </span>
                  <span className="rounded-md bg-background/75 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {session.subject?.name ?? "No subject"}
                  </span>
                </div>
                <div className="mt-1 min-w-0 truncate text-xs text-muted-foreground">
                  {new Date(session.startedAt).toLocaleString()} -{" "}
                  {new Date(session.endedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {session.notes ? (
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {session.notes}
                  </div>
                ) : null}
              </div>
              <div className="rounded-md bg-background/75 px-3 py-2 text-right font-semibold tabular-nums">
                {formatFocusDuration(session.durationMinutes)}
              </div>
              <Button
                aria-label={`Edit ${
                  session.title?.trim() || session.subject?.name || "focus session"
                }`}
                className="h-9 w-full sm:w-9"
                disabled={updateSession.isPending}
                onClick={() => openEditSession(session)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                aria-label={`Delete focus session from ${
                  session.subject?.name ?? "No subject"
                }`}
                className="h-9 w-full sm:w-9"
                disabled={isDeleting}
                onClick={() => handleDeleteSession(session)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
            Complete a study focus cycle to build your history.
          </p>
        )}
      </div>
      <Dialog
        open={Boolean(editingSession)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSession(null);
            setEditedTitle("");
            setEditedSubjectId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit focus session</DialogTitle>
            <DialogDescription>
              Change the session name and the subject used in study totals.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleUpdateSession}>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Session name</span>
              <Input
                autoFocus
                maxLength={120}
                onChange={(event) => setEditedTitle(event.target.value)}
                value={editedTitle}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Subject</span>
              <Select
                onValueChange={setEditedSubjectId}
                value={editedSubjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <DialogFooter>
              <Button
                disabled={
                  !editedTitle.trim() ||
                  !editedSubjectId ||
                  updateSession.isPending
                }
                type="submit"
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
