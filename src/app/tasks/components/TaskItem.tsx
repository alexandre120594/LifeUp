"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Edit, Check, X } from "lucide-react";
import { Task, TaskCreateInput } from "@/types/BaseInterfaces";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTaskMutation"; // Assuming these hooks exist

export default function TaskItem({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit } = useForm<Task>({
    defaultValues: { title: task.title },
  });

  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  // Handle Title Update
  const onSaveTitle = (data: Task) => {
    updateTask(
      { id: task.id, data: { ...data } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  // Handle Completion Toggle
  const onToggleComplete = (checked: boolean) => {
    const taskFinishedAt = new Date();
    const formattedTime = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(taskFinishedAt);
    updateTask({
      id: task.id,
      data: {
        id: task.id,
        completed: checked,
        dateFinish: taskFinishedAt,
        time: formattedTime,
      },
    });
  };

  return (
    <div className="flex items-center justify-between my-3 mx-4 p-2 hover:bg-slate-50 rounded-lg group transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggleComplete(!!checked)}
          className="data-[state=checked]:bg-yevox-primary data-[state=checked]:border-green-500 border-slate-300"
        />

        {isEditing ? (
          <form
            onSubmit={handleSubmit(onSaveTitle)}
            className="flex items-center gap-2 flex-1"
          >
            <Input {...register("title")} className="h-8 py-0" autoFocus />
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
          <span
            className={`${
              task.completed ? "line-through text-slate-400" : "text-slate-700"
            }`}
          >
            {task.title}
          </span>
        )}
      </div>

      {!isEditing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
