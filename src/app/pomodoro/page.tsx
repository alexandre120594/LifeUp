"use client";

import { PomodoroPanel } from "@/components/pomodoro-panel";
import { useTask } from "@/hooks/useTaskMutation";

export default function PomodoroPage() {
  const { data: tasks } = useTask();

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 sm:p-4 md:p-6">
      <section className="relative grid min-h-[calc(100vh-6rem)] content-start gap-5 overflow-hidden rounded-xl border border-border/70 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_34%),linear-gradient(135deg,hsl(var(--secondary)/0.72),hsl(var(--background))_48%,hsl(var(--accent)/0.16))] p-3 sm:p-5 md:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <header className="flex min-w-0 flex-col gap-3 rounded-lg border border-border/60 bg-background/55 p-4 backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Focus cycles
            </div>
            <h1 className="mt-2 break-words text-3xl font-semibold leading-tight text-foreground [overflow-wrap:anywhere] sm:text-5xl">
              Pomodoro
            </h1>
            <p className="mt-2 max-w-3xl break-words text-sm text-muted-foreground [overflow-wrap:anywhere] sm:text-base">
              Run task-linked work and study sessions with a large timer, quick controls, and focus history in one organized workspace.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-background/75 px-3 py-1 text-xs font-medium text-muted-foreground">
            Timer persists while navigating
          </div>
        </header>

        <PomodoroPanel tasks={tasks} />
      </section>
    </div>
  );
}
