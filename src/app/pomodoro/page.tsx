"use client";

import { BookOpen, BriefcaseBusiness, History, TimerReset } from "lucide-react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { PomodoroPanel } from "@/components/pomodoro-panel";
import { usePomodoroDashboard } from "@/hooks/usePomodoroMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { formatFocusDuration } from "@/lib/pomodoro";

export default function PomodoroPage() {
  const { data: tasks } = useTask();
  const { data: pomodoro } = usePomodoroDashboard();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader eyebrow="Focus cycles" title="Pomodoro" />

      <OverviewPanel
        title="Organize deep work with task-linked cycles"
        description="Run focused work or study blocks, take planned breaks, and keep a productivity history tied to your tasks, projects, and habits."
        stats={[
          {
            label: "Focused",
            value: formatFocusDuration(pomodoro?.totalMinutes ?? 0),
            icon: TimerReset,
          },
          {
            label: "Worked",
            value: formatFocusDuration(pomodoro?.workMinutes ?? 0),
            icon: BriefcaseBusiness,
          },
          {
            label: "Studied",
            value: formatFocusDuration(pomodoro?.studyMinutes ?? 0),
            icon: BookOpen,
          },
        ]}
        progress={{
          label: `${pomodoro?.sessions.length ?? 0} focus sessions`,
          value: Math.min((pomodoro?.sessions.length ?? 0) * 10, 100),
          detail: "Each completed work or study cycle is saved to history.",
          icon: History,
        }}
        focusTitle="Start with a task"
        focusDescription="Choose the task you are working on so time can roll up to its project and linked habit."
        focusItems={[
          {
            label: "Open tasks",
            value: tasks?.filter((task) => !task.completed).length ?? 0,
            icon: TimerReset,
          },
          {
            label: "History",
            value: pomodoro?.sessions.length ?? 0,
            icon: History,
          },
        ]}
      />

      <PomodoroPanel tasks={tasks} />
    </div>
  );
}
