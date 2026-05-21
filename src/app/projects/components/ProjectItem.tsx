"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit,
  Flame,
  FolderKanban,
  ListChecks,
  Repeat,
  Trash,
  X,
} from "lucide-react";
import { Project, ProjectCreateInput } from "@/types/BaseInterfaces";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjectMutations";

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

  const onUpdate = (data: ProjectCreateInput) => {
    updateProject(
      { id: project.id, data },
      { onSuccess: () => setIsEditing(false) }
    );
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
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground transition hover:bg-muted"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-yevox-primary px-3 text-sm text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <Check size={16} />
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="group min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, var(--card) 84%, white 16%), var(--card))",
        boxShadow: `inset 4px 0 0 ${project.color || "#94a3b8"}`,
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start gap-2.5">
            <div
              className="mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-background/60"
              style={{ backgroundColor: project.color || "#94a3b8" }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold tracking-tight">
                  {project.title}
                </h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  Project
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Open habits and tasks together for this project.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
            <div className="min-w-0 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Repeat size={14} />
                Habits
              </div>
              <div className="mt-1 text-lg font-semibold">{habitCount}</div>
            </div>
            <div className="min-w-0 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <ListChecks size={14} />
                Tasks
              </div>
              <div className="mt-1 text-lg font-semibold">{taskCount}</div>
            </div>
            <div className="min-w-0 rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Flame size={14} />
                Streak
              </div>
              <div className="mt-1 text-lg font-semibold">
                {project.streakGlobal ?? 0}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                target {project.dailyStreakTarget ?? 1}/day
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 lg:w-[190px]">
          <div className="rounded-lg border border-border/70 bg-background/80 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderKanban size={16} />
              Delivery progress
            </div>
            <div className="mt-2 text-2xl font-semibold">{completedTasks}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              completed of {taskCount} tasks
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/projects/${project.id}`)}
              className="inline-flex h-9 min-w-24 flex-1 items-center justify-center rounded-lg bg-yevox-primary px-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              View
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              aria-label={`Edit ${project.title}`}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition hover:border-red-300 hover:text-red-600"
              aria-label={`Delete ${project.title}`}
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
