"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Pause,
  Play,
  RotateCcw,
  Save,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  usePomodoroDashboard,
} from "@/hooks/usePomodoroMutations";
import { formatFocusDuration } from "@/lib/pomodoro";
import type { PomodoroSession, Task } from "@/types/BaseInterfaces";

type FocusPhase = "focus" | "break";
type FocusType = "work" | "study";

const defaultWorkMinutes = 25;
const defaultBreakMinutes = 5;
const defaultTargetCycles = 4;
const pomodoroTimerStorageKey = "lifeup:pomodoro-timer";

type PersistedPomodoroTimer = {
  breakMinutes: number;
  completedCycles: number;
  focusStartedAt: string | null;
  focusType: FocusType;
  isRunning: boolean;
  notes: string;
  phase: FocusPhase;
  phaseEndsAt: string | null;
  remainingSeconds: number;
  selectedTaskId: string;
  targetCycles: number;
  workMinutes: number;
};

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export function PomodoroPanel({ tasks = [] }: { tasks?: Task[] }) {
  "use no memo";

  const availableTasks = tasks.filter((task) => !task.completed);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [focusType, setFocusType] = useState<FocusType>("work");
  const [workMinutes, setWorkMinutes] = useState(defaultWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(defaultBreakMinutes);
  const [targetCycles, setTargetCycles] = useState(defaultTargetCycles);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [phase, setPhase] = useState<FocusPhase>("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultWorkMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [hasRestoredTimer, setHasRestoredTimer] = useState(false);
  const focusStartedAtRef = useRef<Date | null>(null);
  const phaseEndsAtRef = useRef<Date | null>(null);
  const autoSaveInProgressRef = useRef(false);
  const { data: pomodoro } = usePomodoroDashboard();
  const { mutate: createSession, isPending } = useCreatePomodoroSession();

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const phaseTotalSeconds =
    phase === "focus" ? workMinutes * 60 : breakMinutes * 60;
  const elapsedPhaseSeconds = Math.max(phaseTotalSeconds - remainingSeconds, 0);
  const progressPercent =
    phaseTotalSeconds > 0
      ? Math.round((elapsedPhaseSeconds / phaseTotalSeconds) * 100)
      : 0;
  const canSavePartial =
    phase === "focus" && selectedTaskId && elapsedPhaseSeconds >= 60;

  useEffect(() => {
    const savedTimer = window.localStorage.getItem(pomodoroTimerStorageKey);

    if (!savedTimer) {
      setHasRestoredTimer(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedTimer) as Partial<PersistedPomodoroTimer>;
      let savedRemainingSeconds =
        typeof parsed.remainingSeconds === "number"
          ? parsed.remainingSeconds
          : defaultWorkMinutes * 60;
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

      setSelectedTaskId(
        typeof parsed.selectedTaskId === "string" ? parsed.selectedTaskId : ""
      );
      setFocusType(parsed.focusType === "study" ? "study" : "work");
      setWorkMinutes(
        typeof parsed.workMinutes === "number"
          ? Math.min(Math.max(parsed.workMinutes, 1), 180)
          : defaultWorkMinutes
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
      focusStartedAtRef.current = parsed.focusStartedAt
        ? new Date(parsed.focusStartedAt)
        : null;
    } catch {
      window.localStorage.removeItem(pomodoroTimerStorageKey);
    } finally {
      setHasRestoredTimer(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredTimer) {
      return;
    }

    const timerSnapshot: PersistedPomodoroTimer = {
      breakMinutes,
      completedCycles,
      focusStartedAt: focusStartedAtRef.current?.toISOString() ?? null,
      focusType,
      isRunning,
      notes,
      phase,
      phaseEndsAt: phaseEndsAtRef.current?.toISOString() ?? null,
      remainingSeconds,
      selectedTaskId,
      targetCycles,
      workMinutes,
    };

    window.localStorage.setItem(
      pomodoroTimerStorageKey,
      JSON.stringify(timerSnapshot)
    );
  }, [
    breakMinutes,
    completedCycles,
    focusType,
    hasRestoredTimer,
    isRunning,
    notes,
    phase,
    remainingSeconds,
    selectedTaskId,
    targetCycles,
    workMinutes,
  ]);

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
      const startedAt =
        focusStartedAtRef.current ??
        new Date(endedAt.getTime() - durationMinutes * 60 * 1000);

      createSession(
        {
          durationMinutes,
          endedAt: endedAt.toISOString(),
          focusType,
          notes,
          startedAt: startedAt.toISOString(),
          taskId: selectedTaskId,
        },
        {
          onError: () => {
            autoSaveInProgressRef.current = false;
          },
          onSuccess,
        }
      );
    },
    [createSession, focusType, notes, selectedTaskId]
  );

  const resetTimer = useCallback((nextPhase: FocusPhase = "focus") => {
    setIsRunning(false);
    setPhase(nextPhase);
    setRemainingSeconds(
      nextPhase === "focus" ? workMinutes * 60 : breakMinutes * 60
    );
    focusStartedAtRef.current = null;
    phaseEndsAtRef.current = null;
  }, [breakMinutes, workMinutes]);

  const pauseTimer = () => {
    setIsRunning(false);
    phaseEndsAtRef.current = null;
  };

  const completeFocusCycle = useCallback(() => {
    if (autoSaveInProgressRef.current || isPending) {
      return;
    }

    if (!selectedTaskId) {
      resetTimer("focus");
      return;
    }

    setIsRunning(false);
    phaseEndsAtRef.current = null;
    autoSaveInProgressRef.current = true;
    saveFocusSession({
      durationMinutes: workMinutes,
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
          setRemainingSeconds(workMinutes * 60);
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
    isPending,
    resetTimer,
    saveFocusSession,
    selectedTaskId,
    targetCycles,
    workMinutes,
  ]);

  const completeBreak = useCallback(() => {
    setPhase("focus");
    setRemainingSeconds(workMinutes * 60);
    focusStartedAtRef.current = null;
    phaseEndsAtRef.current = new Date(Date.now() + workMinutes * 60 * 1000);
  }, [workMinutes]);

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

  const updateWorkMinutes = (value: number) => {
    const nextValue = Math.min(Math.max(value || defaultWorkMinutes, 1), 180);
    setWorkMinutes(nextValue);
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
    if (phase === "focus") {
      focusStartedAtRef.current = focusStartedAtRef.current ?? new Date();
    }

    phaseEndsAtRef.current = new Date(Date.now() + remainingSeconds * 1000);
    setIsRunning(true);
  };

  const savePartialSession = () => {
    if (!canSavePartial) {
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

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-background/85 shadow-sm backdrop-blur">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex min-w-0 items-center gap-2">
            <TimerReset className="h-5 w-5 text-primary" />
            <span className="min-w-0 truncate">Pomodoro focus</span>
          </CardTitle>
          <div className="min-w-0 truncate text-sm text-muted-foreground">
            {selectedTask
              ? `${selectedTask.project?.title ?? "Project"} / ${
                  selectedTask.habit?.title ?? "No habit"
                }`
              : "Choose a task to start"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-5 px-4 sm:px-6">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <section className="grid min-h-[460px] min-w-0 content-start gap-3 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-4 sm:p-5">
            <div className="min-w-0 overflow-hidden rounded-lg bg-secondary/40 p-5 text-center sm:p-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground">
              {phase === "focus" ? (
                focusType === "study" ? (
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                )
              ) : (
                <Pause className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="min-w-0 truncate">
                {phase === "focus"
                  ? focusType === "study"
                    ? "Study focus"
                    : "Work focus"
                  : "Break"}
              </span>
            </div>
            <div className="mt-4 text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl lg:text-7xl">
              {formatTimer(remainingSeconds)}
            </div>
            <div className="mx-auto mt-4 max-w-2xl min-w-0 text-sm text-muted-foreground">
              {selectedTask ? (
                <>
                  <p className="truncate font-medium text-foreground">
                    {selectedTask.title ?? "Selected task"}
                  </p>
                  <p className="truncate text-xs">
                    {selectedTask.project?.title ?? "Project"} /{" "}
                    {selectedTask.habit?.title ?? "No habit"}
                  </p>
                </>
              ) : (
                <p className="break-words [overflow-wrap:anywhere]">
                  Pick a task to associate this focus block.
                </p>
              )}
            </div>
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
              disabled={!selectedTaskId || isRunning || isPending}
              onClick={startTimer}
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
              disabled={!canSavePartial || isPending}
              onClick={savePartialSession}
              type="button"
              variant="secondary"
            >
              <Save className="h-4 w-4" />
              <span className="min-w-0 truncate">Save</span>
            </Button>
          </div>
          </section>

          <aside className="grid min-w-0 content-start gap-4 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-4 sm:p-5">
            <div className="min-w-0">
              <div className="text-sm font-medium">Session setup</div>
              <div className="mt-3 grid min-w-0 gap-3">
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger className="w-full min-w-0 overflow-hidden [&>span]:min-w-0 [&>span]:truncate">
                    <SelectValue placeholder="Choose a task" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[var(--radix-select-trigger-width)]">
                    {availableTasks.map((task) => (
                      <SelectItem
                        className="max-w-[calc(100vw-2rem)] overflow-hidden sm:max-w-[var(--radix-select-trigger-width)]"
                        key={task.id}
                        value={task.id}
                      >
                        <span className="block min-w-0 max-w-full truncate">
                          {task.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={focusType}
                  onValueChange={(value) => setFocusType(value as FocusType)}
                >
                  <SelectTrigger className="min-w-0 [&>span]:truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <NumberSetting
                label="Work"
                max={180}
                min={1}
                onChange={updateWorkMinutes}
                value={workMinutes}
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

            <Input
              className="min-w-0"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional note for saved focus sessions"
              value={notes}
            />
          </aside>
        </div>

        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <FocusMetric
              label="Total focused"
              value={formatFocusDuration(pomodoro?.totalMinutes ?? 0)}
            />
            <FocusMetric
              label="Worked"
              value={formatFocusDuration(pomodoro?.workMinutes ?? 0)}
            />
            <FocusMetric
              label="Studied"
              value={formatFocusDuration(pomodoro?.studyMinutes ?? 0)}
            />
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            <FocusBreakdown
              emptyLabel="No project focus time yet."
              items={pomodoro?.byProject ?? []}
              title="Time by project"
            />
            <FocusBreakdown
              emptyLabel="No habit focus time yet."
              items={pomodoro?.byHabit ?? []}
              title="Time by habit"
            />
            <FocusHistory sessions={pomodoro?.sessions ?? []} />
          </div>
        </section>
      </CardContent>
    </Card>
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

function FocusBreakdown({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: Array<{ id: string; minutes: number; title: string }>;
  title: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="truncate text-sm font-medium">{title}</div>
      <div className="mt-2 grid min-w-0 gap-2">
        {items.length ? (
          items.slice(0, 5).map((item) => (
            <div
              className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-secondary/35 px-3 py-2 text-sm"
              key={item.id}
            >
              <span className="min-w-0 truncate text-muted-foreground">
                {item.title}
              </span>
              <span className="shrink-0 font-medium">
                {formatFocusDuration(item.minutes)}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function FocusHistory({ sessions }: { sessions: PomodoroSession[] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="truncate text-sm font-medium">Productivity history</div>
      <div className="mt-2 grid min-w-0 gap-2">
        {sessions.length ? (
          sessions.slice(0, 6).map((session) => (
            <div
              className="grid min-w-0 gap-2 rounded-lg bg-secondary/35 px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={session.id}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {session.task?.title ?? "Focus session"}
                </div>
                <div className="min-w-0 truncate text-xs text-muted-foreground">
                  {session.task?.project?.title
                    ? `${session.task.project.title} / `
                    : ""}
                  {session.focusType === "study" ? "Study" : "Work"} /{" "}
                  {new Date(session.endedAt).toLocaleString()}
                </div>
              </div>
              <div className="shrink-0 font-semibold">
                {formatFocusDuration(session.durationMinutes)}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
            Complete a focus cycle to build your history.
          </p>
        )}
      </div>
    </div>
  );
}
