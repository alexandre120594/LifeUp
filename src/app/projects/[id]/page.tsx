"use client";

import { use } from "react"; // Hook para desempacotar a Promise dos params
import HabitItem from "@/app/habits/components/HabitItem";
import { useHabitDetail } from "@/hooks/useHabitMutations";
import { useProjectsById } from "@/hooks/useProjectMutations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import InputHabit from "@/app/habits/components/InputHabit";
import TaskInput from "@/app/tasks/components/TaskInput";
import { useDeleteTask } from "@/hooks/useTaskMutation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import TaskItem from "@/app/tasks/components/TaskItem";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // No cliente, usamos o hook use() para obter o ID da Promise
  const { id } = use(params);

  const { data: project, isLoading, isError } = useProjectsById(id);

  const { mutate } = useDeleteTask("");

  const onSubmitDelete = (id: string) => {
    mutate(id);
  };

  if (isLoading) return <div>Carregando hábito...</div>;
  if (isError || !project)
    return <div>Erro ao carregar ou hábito não encontrado.</div>;

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="text-center font-bold text-[20px]">
            Habit Tracker
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-12">
              {project?.habits?.map((habit) => (
                <div key={habit.id} className="space-y-2">
                  <HabitItem
                    habit={habit}
                    colorHabit={project.color ?? "#ccc"}
                  />
                  <div className="grid grid-cols-2 gap-2 border">
                    {project.tasks
                      ?.filter((t) => t.habitId === habit.id)
                      .map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center font-bold text-[20px]">
            Habit Insert
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4">
            <InputHabit key={project.id} projectId={project.id}></InputHabit>

            <TaskInput key={"task-input"} projectId={project.id}></TaskInput>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
