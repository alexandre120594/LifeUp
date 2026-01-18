"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import {
  useStartPomodoro,
  useFinishPomodoro,
  useInterruptPomodoro,
  usePomodoroHistory,
  usePatchPomodoro,
} from "@/hooks/usePomodoroMutation";
import { time } from "console";
import { PomodoroStatus } from "@/generated/client";
import DialogForms from "@/components/Forms/DialogForms";
import { useUpdateProject } from "@/hooks/useProjectMutations";
import { Project } from "@/types/BaseInterfaces";

function formatTimeFull(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h == 0) {
    return `${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  } else {
    return `${h.toString().padStart(2, "0")} : ${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  }
}

export function TaskPomodoro({
  taskId,
  project,
}: {
  taskId: string;
  project: Project;
}) {
  const [activePomodoroId, setActivePomodoroId] = useState<string | null>(null);
  const [timerCount, setTimer] = useState<number>(1200);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCount, setIsOpenCount] = useState(false);
  const startPomodoro = useStartPomodoro(taskId);
  const finishPomodoro = useFinishPomodoro(taskId);
  const updatePomodoro = usePatchPomodoro();

  const { data: pomodoro } = usePomodoroHistory(taskId);
  const interruptPomodoro = useInterruptPomodoro(pomodoro?.[0]?.id);

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const updateStreak = (currentProject: Project) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0)).getTime();

    const lastDate = currentProject.lastActivityDate
      ? new Date(
          new Date(currentProject.lastActivityDate).setHours(0, 0, 0, 0),
        ).getTime()
      : 0;

    const diffInDays = Math.floor((today - lastDate) / (1000 * 3600 * 24));

    if (diffInDays === 1 || lastDate === 0) {
      updateProject({
        id: currentProject.id,
        data: {
          streakGlobal: (currentProject.streakGlobal || 0) + 1,
          lastActivityDate: new Date(),
        },
      });
    } else if (diffInDays === 0) {
      updateProject({
        id: currentProject.id,
        data: { lastActivityDate: new Date() },
      });
    }
  };

  const timer = usePomodoroTimer(timerCount, () => {
    if (activePomodoroId) {
      finishPomodoro.mutate(activePomodoroId, {
        onSuccess: () => {
          updateStreak(project);
          setActivePomodoroId(null);

          setIsOpenCount(false);
        },
        onError: (error) => {
          console.error("Erro ao finalizar pomodoro:", error);
        },
      });
    }
  });

  const handleStartSession = async (seconds: number) => {
    setTimer(seconds);
    timer.forceReset(seconds);
    setIsOpen(false);
  };

  const handleStart = async () => {
    if (activePomodoroId) {
      timer.start();
      const POMODORO_STATUS = PomodoroStatus.IN_PROGRESS;
      const actualDuration = (timerCount - timer.secondsLeft).toString();
      const pomodoro = await updatePomodoro.mutateAsync({
        duration: actualDuration,
        idPomodoro: activePomodoroId,
        status: POMODORO_STATUS,
      });
      setIsOpenCount(true);
      return;
    } else {
      try {
        const pomodoro = await startPomodoro.mutateAsync(timerCount.toString());
        setActivePomodoroId(pomodoro.id);
        setIsOpenCount(true);
        timer.start();
      } catch (error) {
        console.error("Erro ao iniciar sessão no banco:", error);
      }
    }
  };

  const handleInterrupt = async () => {
    if (!activePomodoroId) return;
    const actualDuration = (timerCount - timer.secondsLeft).toString();
    const pomodoro = await interruptPomodoro.mutateAsync({
      duration: actualDuration,
      idPomodoro: activePomodoroId,
    });
    timer.stop();
  };

  return (
    <main>
      <div className="flex items-center gap-2 mb-3">
        <>
          <>
            <DialogForms
              isOpen={isOpenCount}
              setIsOpen={setIsOpenCount}
              dialogContent={
                <>
                  <div className="text-2xl md:text-5xl font-mono tracking-tighter text-center my-2">
                    {formatTimeFull(timer.secondsLeft)}
                  </div>
                  {!timer.running ? (
                    <Button
                      size="sm"
                      className="bg-yevox-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleStart();
                      }}
                    >
                      {timer.secondsLeft != timerCount && !timer.running
                        ? "Resume"
                        : "Iniciar"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleInterrupt}
                    >
                      Parar
                    </Button>
                  )}
                </>
              }
              dialogTitle="Pomodoro"
              trigger={
                !timer.running ? (
                  <Button
                    size="sm"
                    className="bg-yevox-primary"
                    onClick={() => setIsOpenCount(true)}
                  >
                    {timer.secondsLeft != timerCount && !timer.running
                      ? "Resume"
                      : "Iniciar"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleInterrupt}
                  >
                    Parar
                  </Button>
                )
              }
            />
          </>

          <>
            <DialogForms
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              dialogContent={
                <>
                  {" "}
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStartSession(1500)}
                    >
                      25 min
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStartSession(3000)}
                    >
                      50 min
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStartSession(60)}
                    >
                      1 min (Teste)
                    </Button>
                  </div>
                </>
              }
              dialogTitle="Iniciar Sessão de Foco"
              trigger={
                <Button size="sm" disabled={timerCount !== timer.secondsLeft}>
                  Configurar
                </Button>
              }
            />
          </>
        </>
      </div>
    </main>
  );
}
