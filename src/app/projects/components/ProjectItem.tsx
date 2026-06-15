"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit,
  Flame,
  FolderKanban,
  Repeat,
  Target,
  Trash,
  X,
} from "lucide-react";
import { Project, ProjectCreateInput } from "@/types/BaseInterfaces";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjectMutations";
import { Button } from "@/components/ui/button";

function formatShortDate(value?: Date | string | null) {
  if (!value) {
    return "No activity";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No activity";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

export default function ProjectItem({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<ProjectCreateInput>({
    defaultValues: {
      title: project.title,
      color: project.color,
      dailyStreakTarget: project.dailyStreakTarget ?? 1,
    },
  });

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject(project.id);

  const taskCount = project.tasks?.length ?? 0;
  const habitCount = project.habits?.length ?? 0;
  const completedTasks =
    project.tasks?.filter((task) => task.completed).length ?? 0;
  const pendingTasks = taskCount - completedTasks;
  const completionRate =
    taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;
  const lastActivity = project.lastActivityDate ?? project.createdAt;

  const onUpdate = (data: ProjectCreateInput) => {
    updateProject(
      { id: project.id, data },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete ${project.title}? This also removes its habits and tasks.`
    );

    if (confirmed) {
      deleteProject(project.id);
    }
  };

  if (isEditing) {
    return (
      <div
        className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm"
        style={{
          boxShadow: `inset 4px 0 0 ${project.color || "#94a3b8"}`,
        }}
      >
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div
              className="h-9 w-2 rounded-full"
              style={{ backgroundColor: project.color || "#94a3b8" }}
            />
            <input
              {...register("title", { required: true })}
              className="h-10 min-w-44 flex-1 rounded-lg border bg-background px-3 text-sm outline-none ring-0"
            />
            <input
              {...register("color")}
              type="color"
              className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent p-1"
            />
            <input
              {...register("dailyStreakTarget", {
                min: 1,
                valueAsNumber: true,
              })}
              aria-label="Daily completed task target"
              className="h-10 w-28 rounded-lg border bg-background px-3 text-sm outline-none ring-0"
              min={1}
              title="Daily completed task target"
              type="number"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
            >
              <Check size={16} />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <article
      className="group min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, var(--card) 84%, white 16%), var(--card))",
        boxShadow: `inset 4px 0 0 ${project.color || "#94a3b8"}`,
      }}
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.36fr)] lg:items-stretch">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-start gap-3">
            <div
              className="mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background/60"
              style={{ backgroundColor: project.color || "#94a3b8" }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="min-w-0 break-words text-base font-semibold tracking-tight [overflow-wrap:anywhere]">
                  {project.title}
                </h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  {pendingTasks ? `${pendingTasks} open` : "Clear"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>Last activity {formatShortDate(lastActivity)}</span>
                <span>{completedTasks}/{taskCount} tasks done</span>
                <span>{habitCount} habits</span>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-3">
            <div className="min-w-0 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Repeat size={14} />
                Habits
              </div>
              <div className="mt-1 text-lg font-semibold">{habitCount}</div>
            </div>
            <div className="min-w-0 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Target size={14} />
                Target
              </div>
              <div className="mt-1 text-lg font-semibold">
                {project.dailyStreakTarget ?? 1}/day
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Flame size={14} />
                Streak
              </div>
              <div className="mt-1 text-lg font-semibold">
                {project.streakGlobal ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background/80 p-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
              <FolderKanban size={16} />
                <span className="truncate">Progress</span>
              </div>
              <span className="shrink-0 font-semibold text-foreground">
                {completionRate}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{completedTasks} done</span>
              <span>{pendingTasks} open</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Button
              onClick={() => router.push(`/projects/${project.id}`)}
              type="button"
            >
              View
            </Button>
            <Button
              aria-label={`Edit ${project.title}`}
              onClick={() => setIsEditing(true)}
              size="icon"
              type="button"
              variant="outline"
            >
              <Edit size={16} />
            </Button>
            <Button
              aria-label={`Delete ${project.title}`}
              onClick={handleDelete}
              size="icon"
              type="button"
              variant="outline"
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
