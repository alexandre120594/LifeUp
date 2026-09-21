"use client";

import { DashboardViewport } from "@/components/dashboard-viewport";
import { PomodoroPanel } from "@/components/pomodoro-panel";

export default function PomodoroPage() {
  return (
    <DashboardViewport contentClassName="overflow-hidden pr-0">
      <section className="grid h-full min-h-0 content-start gap-4 overflow-y-auto rounded-[var(--r-16)] border border-border bg-panel-subtle p-3 sm:p-5">
        <header className="flex min-w-0 flex-col gap-3 rounded-[var(--r-16)] border border-border bg-panel p-4 shadow-snow-1 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Foco de estudo
            </div>
            <h1 className="mt-1 break-words text-2xl font-semibold leading-tight text-foreground [overflow-wrap:anywhere] sm:text-3xl">
              Foco
            </h1>
            <p className="mt-2 max-w-3xl break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
              Rode sessoes com timer amplo, controles rapidos e historico sem vincular a projetos, tarefas ou habitos.
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-text-secondary">
            Timer persiste ao navegar
          </div>
        </header>

        <PomodoroPanel />
      </section>
    </DashboardViewport>
  );
}
