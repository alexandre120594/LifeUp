"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, FieldError, LoadingState, RetryButton } from "@/components/ui/app-state";
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
import { useCreateStudySubject, useStudyWorkspace } from "@/hooks/useStudyWorkspace";
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
  const [setupNameError, setSetupNameError] = useState("");
  const [subjectNameError, setSubjectNameError] = useState("");
  const [hasRestoredTimer, setHasRestoredTimer] = useState(false);
  const focusStartedAtRef = useRef<Date | null>(null);
  const phaseEndsAtRef = useRef<Date | null>(null);
  const autoSaveInProgressRef = useRef(false);
  const studyWorkspace = useStudyWorkspace();
  const subjects = useMemo(() => studyWorkspace.data?.subjects ?? [], [studyWorkspace.data?.subjects]);
  const areSubjectsLoading = studyWorkspace.isLoading;
  const createSubject = useCreateStudySubject();
  const {
    data: pomodoro,
    isError: isPomodoroError,
    isLoading: isPomodoroLoading,
    refetch: refetchPomodoro,
  } = usePomodoroDashboard();
  const { mutate: createSession, isPending } = useCreatePomodoroSession();

  const phaseTotalSeconds =
    phase === "focus" ? focusMinutes * 60 : breakMinutes * 60;
  const elapsedPhaseSeconds = Math.max(phaseTotalSeconds - remainingSeconds, 0);
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
            "Foco de estudo",
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

    if (!sessionName.trim()) {
      setSetupNameError("Informe um nome para a sessao.");
      return;
    }

    if (!canSaveFocus) {
      return;
    }

    setSetupNameError("");
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
      setSubjectNameError("Informe o nome da materia.");
      return;
    }

    setSubjectNameError("");
    const subject = await createSubject.mutateAsync({
      name,
      plannedMinutesPerWeek: 60,
    });

    setSelectedSubjectId(subject.id);
    setNewSubjectName("");
    setIsSubjectDialogOpen(false);
  };

  const todayFocusMinutes = (pomodoro?.sessions ?? [])
    .filter((session) => new Date(session.startedAt).toDateString() === new Date().toDateString())
    .reduce((total, session) => total + session.durationMinutes, 0);
  const averageFocusMinutes = pomodoro?.sessions.length
    ? Math.round((pomodoro.totalMinutes ?? 0) / pomodoro.sessions.length)
    : 0;

  return (
    <>
      <div className="grid h-full min-h-0 min-w-0 gap-3 overflow-y-auto xl:grid-cols-[minmax(25rem,0.88fr)_minmax(34rem,1.35fr)] xl:overflow-hidden">
        <div className="grid min-h-0 min-w-0 gap-3 xl:grid-rows-[330px_112px_minmax(0,1fr)]">
          <section className="flex min-h-[330px] min-w-0 flex-col overflow-hidden rounded-2xl border border-primary/25 bg-[radial-gradient(circle_at_70%_20%,color-mix(in_srgb,var(--primary)_13%,transparent),transparent_42%)] p-4 shadow-snow-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em]"><span className="size-2 rounded-full bg-primary" />Timer de foco</div>
              <div className="flex min-w-0 items-center gap-1.5">
                <Select disabled={!subjects.length || isRunning} onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
                  <SelectTrigger aria-label="Matéria da sessão" className="h-8 w-[48vw] min-w-0 max-w-52 bg-secondary/35 text-xs"><SelectValue placeholder="Escolha uma matéria" /></SelectTrigger>
                  <SelectContent>{subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}</SelectContent>
                </Select>
                <Button aria-label="Adicionar matéria" className="size-8 shrink-0" onClick={() => setIsSubjectDialogOpen(true)} size="icon" type="button" variant="outline"><Plus className="size-3.5" /></Button>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-4">
              <div className="text-[clamp(4.5rem,8vw,5.5rem)] font-semibold leading-[0.9] tabular-nums tracking-[-0.065em]">{formatTimer(remainingSeconds)}</div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-text-tertiary">{phase === "focus" ? <BookOpen className="size-3.5 text-primary" /> : <Pause className="size-3.5 text-primary" />}Ciclo {Math.min(completedCycles + 1, targetCycles)} de {targetCycles} · {phase === "focus" ? "Foco" : "Pausa"}</div>
              <div className="mt-3 flex gap-1.5" aria-label={`${completedCycles} ciclos concluídos`}>
                {Array.from({ length: targetCycles }, (_, index) => <span className={`h-1 w-6 rounded-full ${index <= completedCycles ? "bg-primary" : "bg-border"}`} key={index} />)}
              </div>
            </div>

            <div className="grid grid-cols-[1.7fr_1fr_1fr] gap-2">
              <Button disabled={isRunning || isPending} onClick={handleStartClick} type="button"><Play className="size-4" />{phase === "break" ? "Continuar" : "Iniciar foco"}</Button>
              <Button disabled={!isRunning} onClick={pauseTimer} type="button" variant="outline"><Pause className="size-4" />Pausar</Button>
              <Button onClick={() => { setCompletedCycles(0); resetTimer("focus"); }} type="button" variant="outline"><RotateCcw className="size-4" />Reiniciar</Button>
            </div>
            {canSavePartial ? <Button className="mt-2 h-8" disabled={isPending || !canSaveFocus} onClick={savePartialSession} size="sm" type="button" variant="ghost"><Save className="size-3.5" />Salvar sessão parcial</Button> : null}
          </section>

          <section className="grid grid-cols-3 gap-2.5">
            <FocusMetric label="Total focado" value={formatFocusDuration(pomodoro?.totalMinutes ?? 0)} caption={`${pomodoro?.sessions.length ?? 0} sessões`} />
            <FocusMetric label="Hoje" value={formatFocusDuration(todayFocusMinutes)} caption={`${completedCycles} ciclos neste timer`} />
            <FocusMetric label="Média" value={formatFocusDuration(averageFocusMinutes)} caption="por sessão" />
          </section>

          {isPomodoroLoading ? <LoadingState title="Carregando horas" /> : isPomodoroError ? <ErrorState action={<RetryButton onClick={() => refetchPomodoro()} />} description="Não foi possível buscar o resumo de foco." title="Resumo indisponível." /> : <SubjectHoursChart subjects={pomodoro?.bySubject ?? []} />}
        </div>

        <div className="min-h-[520px] min-w-0 xl:min-h-0">
          {isPomodoroLoading ? <LoadingState className="min-h-0" title="Carregando histórico" /> : isPomodoroError ? <ErrorState className="min-h-0" action={<RetryButton onClick={() => refetchPomodoro()} />} description="As sessões salvas não puderam ser carregadas." title="Histórico indisponível." /> : <FocusHistory sessions={pomodoro?.sessions ?? []} subjectSummaries={pomodoro?.bySubject ?? []} subjects={subjects} />}
        </div>
      </div>
      <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar sessao de foco</DialogTitle>
            <DialogDescription>
              Escolha nome, materia, tempos e ciclos antes de iniciar.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={startConfiguredSession}>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Nome da sessao</span>
              <Input
                aria-describedby={setupNameError ? "focus-session-name-error" : undefined}
                aria-invalid={Boolean(setupNameError)}
                autoFocus
                maxLength={120}
                onChange={(event) => {
                  setSessionName(event.target.value);
                  if (setupNameError) {
                    setSetupNameError("");
                  }
                }}
                placeholder="Ex.: Capitulo 4 de calculo"
                value={sessionName}
              />
              <FieldError id="focus-session-name-error">{setupNameError}</FieldError>
            </label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium" htmlFor="focus-subject">
                  Materia
                </label>
                <Button
                  className="h-8 gap-1 px-2"
                  onClick={() => setIsSubjectDialogOpen(true)}
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>
              <Select
                disabled={!subjects.length}
                onValueChange={setSelectedSubjectId}
                value={selectedSubjectId}
              >
                <SelectTrigger id="focus-subject">
                  <SelectValue placeholder="Escolha uma materia" />
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
                label="Foco"
                max={180}
                min={1}
                onChange={updateFocusMinutes}
                value={focusMinutes}
              />
              <NumberSetting
                label="Pausa"
                max={60}
                min={1}
                onChange={updateBreakMinutes}
                value={breakMinutes}
              />
              <NumberSetting
                label="Ciclos"
                max={12}
                min={1}
                onChange={updateTargetCycles}
                value={targetCycles}
              />
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Nota</span>
              <Input
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Nota opcional"
                value={notes}
              />
            </label>
            {areSubjectsLoading ? (
              <LoadingState className="min-h-16" title="Carregando materias" />
            ) : !subjects.length ? (
              <EmptyState
                className="p-3"
                description="Crie uma materia para salvar sessoes de foco."
                title="Nenhuma materia cadastrada."
              />
            ) : null}
            <DialogFooter>
              <Button
                disabled={!sessionName.trim() || !canSaveFocus}
                type="submit"
              >
                <Play className="h-4 w-4" />
                Iniciar sessao
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isSubjectDialogOpen}
        onOpenChange={(open) => {
          setIsSubjectDialogOpen(open);
          if (!open) {
            setSubjectNameError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar matéria</DialogTitle>
            <DialogDescription>
              A nova matéria ficará disponível para esta sessão de foco.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={handleCreateSubject}>
            <Input
              aria-describedby={subjectNameError ? "focus-subject-name-error" : undefined}
              aria-invalid={Boolean(subjectNameError)}
              autoFocus
              onChange={(event) => {
                setNewSubjectName(event.target.value);
                if (subjectNameError) {
                  setSubjectNameError("");
                }
              }}
              placeholder="Nome da matéria"
              value={newSubjectName}
            />
            <FieldError id="focus-subject-name-error">{subjectNameError}</FieldError>
            <DialogFooter>
              <Button
                disabled={!newSubjectName.trim() || createSubject.isPending}
                type="submit"
              >
                <Plus className="h-4 w-4" />
                Adicionar matéria
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-panel p-3 shadow-snow-1">
      <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="min-w-0 truncate">Horas por materia</span>
        </div>
        <div className="shrink-0 text-xs text-text-tertiary">
          {formatFocusDuration(totalMinutes)} total
        </div>
      </div>
      {sortedSubjects.length ? (
        <div className="grid min-h-0 min-w-0 flex-1 content-start gap-1.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {visibleSubjects.map((subject, index) => {
            const share = totalMinutes
              ? Math.round((subject.minutes / totalMinutes) * 100)
              : 0;
            const width = Math.max((subject.minutes / maxMinutes) * 100, 6);

            return (
              <div
                className="grid min-w-0 gap-1.5 border-t border-border/70 py-2 first:border-t-0 first:pt-0"
                key={subject.id}
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-4 shrink-0 text-xs text-text-tertiary">
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
                  <div className="h-1 overflow-hidden rounded-full bg-surface-subtle">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        backgroundColor: subject.color ?? undefined,
                        width: `${width}%`,
                      }}
                    />
                  </div>
                  <span className="sr-only">{share}% do foco salvo</span>
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
                de {sortedSubjects.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Pagina anterior de horas por materia"
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
                  aria-label="Proxima pagina de horas por materia"
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
          Salve uma sessao de foco para ver horas por materia.
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
  caption,
  label,
  value,
}: {
  caption: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-panel p-3.5 shadow-snow-1">
      <div className="truncate text-[9px] uppercase tracking-[0.08em] text-text-tertiary">{label}</div>
      <div className="mt-1.5 break-words text-lg font-semibold [overflow-wrap:anywhere]">
        {value}
      </div>
      <div className="mt-0.5 truncate text-[9px] text-text-tertiary">{caption}</div>
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
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [editingSession, setEditingSession] = useState<PomodoroSession | null>(
    null
  );
  const [sessionToDelete, setSessionToDelete] = useState<PomodoroSession | null>(
    null
  );
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubjectId, setEditedSubjectId] = useState("");
  const [editedTitleError, setEditedTitleError] = useState("");
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeletePomodoroSession();
  const updateSession = useUpdatePomodoroSession();
  const subjectFilteredSessions =
    selectedSubjectId === "all"
      ? sessions
      : sessions.filter(
          (session) => (session.subjectId ?? "unknown") === selectedSubjectId
        );
  const monthGroups = Array.from(subjectFilteredSessions.reduce((groups, session) => {
    const startedAt = new Date(session.startedAt);
    const key = `${startedAt.getFullYear()}-${String(startedAt.getMonth() + 1).padStart(2, "0")}`;
    const current = groups.get(key) ?? { key, label: new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(startedAt), minutes: 0, sessions: 0 };
    current.minutes += session.durationMinutes;
    current.sessions += 1;
    groups.set(key, current);
    return groups;
  }, new Map<string, { key: string; label: string; minutes: number; sessions: number }>()).values()).sort((a, b) => b.key.localeCompare(a.key));
  const visibleSessions = selectedMonth === "all"
    ? subjectFilteredSessions
    : subjectFilteredSessions.filter((session) => {
        const startedAt = new Date(session.startedAt);
        return `${startedAt.getFullYear()}-${String(startedAt.getMonth() + 1).padStart(2, "0")}` === selectedMonth;
      });

  const handleDeleteSession = () => {
    if (!sessionToDelete) {
      return;
    }

    deleteSession(sessionToDelete.id, {
      onSuccess: () => setSessionToDelete(null),
    });
  };

  const openEditSession = (session: PomodoroSession) => {
    setEditingSession(session);
    setEditedTitle(
      session.title?.trim() || session.subject?.name || "Foco de estudo"
    );
    setEditedSubjectId(session.subjectId ?? "");
  };

  const handleUpdateSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSession || !editedSubjectId) {
      return;
    }

    if (!editedTitle.trim()) {
      setEditedTitleError("Informe um nome para a sessao.");
      return;
    }

    setEditedTitleError("");
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
    <div className="grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
      <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-panel p-3 shadow-snow-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-primary" /><span className="truncate">Histórico de foco</span></div>
          <p className="mt-1 text-[10px] text-text-tertiary">{subjectFilteredSessions.length ? `${subjectFilteredSessions.length} sessões salvas` : "Nenhuma sessão salva ainda"}</p>
        </div>
        <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5">
          <Button className="h-7 shrink-0 px-2.5 text-[10px]" onClick={() => { setSelectedSubjectId("all"); setSelectedMonth("all"); }} type="button" variant={selectedSubjectId === "all" ? "default" : "outline"}>Todas</Button>
          {subjectSummaries.map((subject) => <Button className="h-7 shrink-0 px-2.5 text-[10px]" key={subject.id} onClick={() => { setSelectedSubjectId(subject.id); setSelectedMonth("all"); }} type="button" variant={selectedSubjectId === subject.id ? "default" : "outline"}><span className="size-2 rounded-full" style={{ backgroundColor: subject.color ?? undefined }} />{subject.title}</Button>)}
        </div>
      </section>

      <section className="grid min-h-0 overflow-hidden rounded-2xl border border-border bg-panel shadow-snow-1 md:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="min-h-0 border-b border-border p-3 md:border-b-0 md:border-r">
          <h3 className="mb-2 text-xs font-semibold">Período</h3>
          <div className="flex gap-2 overflow-x-auto md:grid md:overflow-y-auto">
            <button className={`min-w-36 rounded-lg border p-2 text-left transition-colors md:min-w-0 ${selectedMonth === "all" ? "border-primary/30 bg-primary/10" : "border-transparent bg-secondary/25 hover:bg-hover"}`} onClick={() => setSelectedMonth("all")} type="button"><strong className="block text-[10px]">Todo o histórico</strong><span className="mt-1 block text-[9px] text-text-tertiary">{subjectFilteredSessions.length} sessões</span></button>
            {monthGroups.map((group) => <button className={`min-w-36 rounded-lg border p-2 text-left transition-colors md:min-w-0 ${selectedMonth === group.key ? "border-primary/30 bg-primary/10" : "border-transparent bg-secondary/25 hover:bg-hover"}`} key={group.key} onClick={() => setSelectedMonth(group.key)} type="button"><strong className="block text-[10px] capitalize">{group.label}</strong><span className="mt-1 block text-[9px] text-text-tertiary">{group.sessions} sessões · {formatFocusDuration(group.minutes)}</span></button>)}
          </div>
        </aside>

        <div className="grid min-h-0 content-start overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {visibleSessions.length ? visibleSessions.map((session) => <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 border-b border-border px-3 py-3 text-sm last:border-b-0" key={session.id}>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2"><span className="min-w-0 truncate text-xs font-semibold">{session.title?.trim() || session.subject?.name || "Foco de estudo"}</span><span className="rounded-md border border-border bg-secondary/35 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">{session.subject?.name ?? "Sem matéria"}</span></div>
              <div className="mt-1 truncate text-[10px] text-text-tertiary">{new Date(session.startedAt).toLocaleDateString("pt-BR")} · {new Date(session.startedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — {new Date(session.endedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
              {session.notes ? <div className="mt-1 line-clamp-1 text-[10px] text-text-secondary">{session.notes}</div> : null}
            </div>
            <strong className="px-1 text-xs tabular-nums">{formatFocusDuration(session.durationMinutes)}</strong>
            <Button aria-label={`Editar ${session.title?.trim() || session.subject?.name || "sessão de foco"}`} className="size-8" disabled={updateSession.isPending} onClick={() => openEditSession(session)} size="icon" type="button" variant="outline"><Pencil className="size-3.5" /></Button>
            <Button aria-label={`Excluir sessão de foco de ${session.subject?.name ?? "sem matéria"}`} className="size-8" disabled={isDeleting} onClick={() => setSessionToDelete(session)} size="icon" type="button" variant="outline"><Trash2 className="size-3.5" /></Button>
          </div>) : <EmptyState className="h-full" title="Nenhuma sessão neste período" description="Conclua um ciclo de foco ou escolha outro filtro." />}
        </div>
      </section>
      <Dialog
        open={Boolean(editingSession)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSession(null);
            setEditedTitle("");
            setEditedSubjectId("");
            setEditedTitleError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar sessao de foco</DialogTitle>
            <DialogDescription>
              Altere o nome e a materia usada nos totais de estudo.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleUpdateSession}>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Nome da sessao</span>
              <Input
                aria-describedby={editedTitleError ? "focus-edit-title-error" : undefined}
                aria-invalid={Boolean(editedTitleError)}
                autoFocus
                maxLength={120}
                onChange={(event) => {
                  setEditedTitle(event.target.value);
                  if (editedTitleError) {
                    setEditedTitleError("");
                  }
                }}
                value={editedTitle}
              />
              <FieldError id="focus-edit-title-error">{editedTitleError}</FieldError>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Materia</span>
              <Select
                onValueChange={setEditedSubjectId}
                value={editedSubjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma materia" />
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
                Salvar alteracoes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        description={
          sessionToDelete
            ? `A sessao de ${formatFocusDuration(
                sessionToDelete.durationMinutes
              )} sera removida do historico.`
            : "Esta sessao sera removida do historico."
        }
        isPending={isDeleting}
        onConfirm={handleDeleteSession}
        onOpenChange={(open) => {
          if (!open) {
            setSessionToDelete(null);
          }
        }}
        open={Boolean(sessionToDelete)}
        title="Excluir sessao?"
      />
    </div>
  );
}
