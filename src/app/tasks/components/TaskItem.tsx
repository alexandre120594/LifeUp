"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Edit, Eye, Trash, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/BaseInterfaces";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTaskMutation";
import { formatFocusDuration } from "@/lib/pomodoro";

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
      0
    ) ?? 0;

  const onSaveTitle = (data: Task) => {
    updateTask(
      { id: task.id, data: { ...data } },
      { onSuccess: () => setIsEditing(false) }
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
    <div className="group mx-2 my-3 flex min-w-0 flex-col gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 sm:mx-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggleComplete(!!checked)}
          className="border-slate-300 data-[state=checked]:border-green-500 data-[state=checked]:bg-yevox-primary"
        />

        {isEditing ? (
          <form
            onSubmit={handleSubmit(onSaveTitle)}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          >
            <Input
              {...register("title")}
              className="h-8 min-w-40 flex-1 py-0"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="h-8 w-8 text-green-600"
            >
              <Check size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-8 w-8 text-slate-400"
            >
              <X size={16} />
            </Button>
          </form>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className={
                task.completed
                  ? "break-words text-slate-400 line-through"
                  : "break-words text-slate-700"
              }
            >
              {task.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {task.time ? `${task.time} - ` : ""}
              {task.project?.title ?? "Project task"}
              {focusMinutes > 0
                ? ` - ${formatFocusDuration(focusMinutes)} focused`
                : ""}
            </span>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-primary"
          >
            <Link href={`/tasks/${task.id}`}>
              <Eye size={16} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-600"
            onClick={() => deleteTask(task.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
