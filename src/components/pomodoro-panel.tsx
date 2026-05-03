"use client";

/* eslint-disable react-hooks/preserve-manual-memoization */

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
  const focusStartedAtRef = useRef<Date | null>(null);
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
        { onSuccess }
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
  }, [breakMinutes, workMinutes]);

  const completeFocusCycle = useCallback(() => {
    if (!selectedTaskId) {
      resetTimer("focus");
      return;
    }

    setIsRunning(false);
    saveFocusSession({
      durationMinutes: workMinutes,
      endedAt: new Date(),
      onSuccess: () => {
        const nextCompletedCycles = completedCycles + 1;
        setCompletedCycles(nextCompletedCycles);
        focusStartedAtRef.current = null;

        if (nextCompletedCycles >= targetCycles) {
          setIsRunning(false);
          setPhase("focus");
          setRemainingSeconds(workMinutes * 60);
          return;
        }

        setPhase("break");
        setRemainingSeconds(breakMinutes * 60);
        setIsRunning(true);
      },
    });
  }, [
    breakMinutes,
    completedCycles,
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
  }, [workMinutes]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            if (phase === "focus") {
              completeFocusCycle();
              return;
            }

            completeBreak();
          }, 0);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [completeBreak, completeFocusCycle, isRunning, phase]);

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

    setIsRunning(true);
  };

  const savePartialSession = () => {
    if (!canSavePartial) {
      return;
    }

    setIsRunning(false);
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
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TimerReset className="h-5 w-5 text-primary" />
          Pomodoro focus
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="grid gap-4 rounded-lg border border-border/70 bg-background/70 p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={focusType}
              onValueChange={(value) => setFocusType(value as FocusType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="study">Study</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
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

          <div className="rounded-lg bg-secondary/40 p-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground">
              {phase === "focus" ? (
                focusType === "study" ? (
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                )
              ) : (
                <Pause className="h-3.5 w-3.5 text-primary" />
              )}
              {phase === "focus"
                ? focusType === "study"
                  ? "Study focus"
                  : "Work focus"
                : "Break"}
            </div>
            <div className="mt-4 text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
              {formatTimer(remainingSeconds)}
            </div>
            <p className="mt-3 truncate text-sm text-muted-foreground">
              {selectedTask
                ? `${selectedTask.project?.title ?? "Project"} / ${
                    selectedTask.habit?.title ?? "No habit"
                  }`
                : "Pick a task to associate this focus block."}
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-background">
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

          <Input
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional note for saved focus sessions"
            value={notes}
          />

          <div className="grid gap-2 sm:grid-cols-4">
            <Button
              className="gap-2"
              disabled={!selectedTaskId || isRunning || isPending}
              onClick={startTimer}
              type="button"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            <Button
              className="gap-2"
              disabled={!isRunning}
              onClick={() => setIsRunning(false)}
              type="button"
              variant="outline"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setCompletedCycles(0);
                resetTimer("focus");
              }}
              type="button"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              className="gap-2"
              disabled={!canSavePartial || isPending}
              onClick={savePartialSession}
              type="button"
              variant="secondary"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
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
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-medium text-muted-foreground">
        {label} min
      </span>
      <Input
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
    <div className="rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-semibold">{value}</div>
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
    <div className="rounded-lg border border-border/70 p-3">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-2 grid gap-2">
        {items.length ? (
          items.slice(0, 5).map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg bg-secondary/35 px-3 py-2 text-sm"
              key={item.id}
            >
              <span className="truncate text-muted-foreground">
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
    <div className="rounded-lg border border-border/70 p-3">
      <div className="text-sm font-medium">Productivity history</div>
      <div className="mt-2 grid gap-2">
        {sessions.length ? (
          sessions.slice(0, 6).map((session) => (
            <div
              className="grid gap-2 rounded-lg bg-secondary/35 px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={session.id}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {session.task?.title ?? "Focus session"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {session.focusType === "study" ? "Study" : "Work"} /{" "}
                  {new Date(session.endedAt).toLocaleString()}
                </div>
              </div>
              <div className="font-semibold">
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
