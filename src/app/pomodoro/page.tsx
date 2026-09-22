"use client";

import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { PomodoroPanel } from "@/components/pomodoro-panel";

export default function PomodoroPage() {
  return (
    <DashboardViewport
      contentClassName="overflow-hidden pb-4"
      header={
        <MenuPageHeader
          action={
            <p className="hidden text-sm text-text-secondary md:block">
              Sessões organizadas por matéria
            </p>
          }
          eyebrow="Estudos"
          title="Foco"
        />
      }
    >
      <div className="h-full min-h-0 overflow-hidden">
        <PomodoroPanel />
      </div>
    </DashboardViewport>
  );
}
