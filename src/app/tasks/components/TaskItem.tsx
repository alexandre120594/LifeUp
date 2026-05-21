"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  Check,
  Clock3,
  Edit,
  Eye,
  FolderKanban,
  TimerReset,
  Trash,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/BaseInterfaces";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTaskMutation";
import { formatFocusDuration } from "@/lib/pomodoro";

function formatTaskDate(date?: Date | string) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export default function TaskItem({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit } = useForm<Task>({
    defaultValues: { title: task.title },
  });

  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const focusMinutes =
    task.pomodoroSessions?.reduce(
      (total, session) => total + session.durationMinutes,
      0,
    ) ?? 0;

  const onSaveTitle = (data: Task) => {
    updateTask(
      { id: task.id, data: { ...data } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const onToggleComplete = (checked: boolean) => {
    const taskFinishedAt = new Date();

    updateTask({
      id: task.id,
      data: {
        id: task.id,
        completed: checked,
        dateFinish: taskFinishedAt,
      },
    });
  };

  return (
    <article className="group min-w-0 rounded-lg border border-border/70 bg-background/75 p-3 transition-colors hover:border-primary/30 hover:bg-background sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => onToggleComplete(!!checked)}
            className="mt-1 shrink-0 border-slate-300 data-[state=checked]:border-green-500 data-[state=checked]:bg-yevox-primary"
          />

          {isEditing ? (
            <form
              onSubmit={handleSubmit(onSaveTitle)}
              className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"
            >
              <Input
                {...register("title")}
                className="h-9 min-w-0 flex-1 py-0"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  type="submit"
                  className="h-9 w-9 text-green-600"
                  aria-label="Save task title"
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-9 w-9 text-slate-400"
                  aria-label="Cancel task edit"
                >
                  <X size={16} />
                </Button>
              </div>
            </form>
          ) : (
            <div className="min-w-0 flex-1">
              <span
                className={
                  task.completed
                    ? "block break-words text-sm font-medium text-muted-foreground line-through sm:text-base"
                    : "block break-words text-sm font-semibold text-foreground sm:text-base"
                }
              >
                {task.title}
              </span>
              <div className="mt-2 flex min-w-0 flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-secondary/60 px-2 py-1">
                  <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {task.project?.title ?? "Project task"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatTaskDate(task.date)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {task.time || "Anytime"}
                </span>
                {focusMinutes > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1">
                    <TimerReset className="h-3.5 w-3.5" />
                    {formatFocusDuration(focusMinutes)} focused
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex shrink-0 justify-end gap-1 sm:opacity-80 sm:transition-opacity sm:group-hover:opacity-100">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-primary"
              aria-label="Open task details"
            >
              <Link href={`/tasks/${task.id}`}>
                <Eye size={16} />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-blue-600"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-red-600"
              onClick={() => deleteTask(task.id)}
              aria-label="Delete task"
            >
              <Trash size={16} />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
