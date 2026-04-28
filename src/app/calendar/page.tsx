"use client";

import { CalendarDays, CheckCircle2, Clock3, FolderKanban } from "lucide-react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { TaskCalendar } from "@/components/task-calendar";
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { getTaskSummary } from "@/lib/analytics";

export default function CalendarPage() {
  const { data: projects } = useProjects();
  const { data: tasks } = useTask();
  const { data: habits } = useHabit();
  const taskSummary = getTaskSummary(tasks ?? []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader eyebrow="Calendar" title="Task Calendar" />

      <OverviewPanel
        title="Plan work by day"
        description="Review the tasks on each date and schedule future work without leaving the calendar."
        stats={[
          {
            label: "Tasks",
            value: taskSummary.total,
            icon: CalendarDays,
          },
          {
            label: "Pending",
            value: taskSummary.pending,
            icon: Clock3,
          },
          {
            label: "Projects",
            value: projects?.length ?? 0,
            icon: FolderKanban,
          },
        ]}
        progress={{
          label: `${taskSummary.completionRate}% complete`,
          value: taskSummary.completionRate,
          detail: `${taskSummary.completed} done, ${taskSummary.pending} pending`,
          icon: CheckCircle2,
        }}
        focusTitle="Use the calendar"
        focusDescription="Select a day, review its tasks, then add another task to that exact date."
        focusItems={[
          {
            label: "Habits",
            value: habits?.length ?? 0,
            icon: CheckCircle2,
          },
          {
            label: "Open tasks",
            value: taskSummary.pending,
            icon: Clock3,
          },
        ]}
      />

      <TaskCalendar projects={projects} tasks={tasks} />
    </div>
  );
}
