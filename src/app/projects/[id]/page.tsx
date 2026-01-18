"use client";

import { use, useState } from "react"; // Hook para desempacotar a Promise dos params
import HabitItem from "@/app/habits/components/HabitItem";
import { useHabit, useHabitDetail } from "@/hooks/useHabitMutations";
import { useProjectsById } from "@/hooks/useProjectMutations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import InputHabit from "@/app/habits/components/InputHabit";
import TaskInput from "@/app/tasks/components/TaskInput";
import { useDeleteTask } from "@/hooks/useTaskMutation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import TaskItem from "@/app/tasks/components/TaskItem";
import { HabitList } from "@/app/habits/components/HabitList";
import { TaskPomodoro } from "@/app/pomodoro/page";
import { Dialog } from "@radix-ui/react-dialog";
import DialogForms from "@/components/Forms/DialogForms";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // No cliente, usamos o hook use() para obter o ID da Promise
  const { id } = use(params);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTask, setisOpenTask] = useState(false);

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const { data: project, isLoading, isError } = useProjectsById(id);

  const { mutate } = useDeleteTask("");

  const { data: habits } = useHabit(id);

  const handleHabitClick = (habitId: string) => {
    setSelectedHabitId((prev) => (prev === habitId ? null : habitId));
  };

  const onSubmitDelete = (id: string) => {
    mutate(id);
  };

  if (isLoading) return <div>Carregando hábito...</div>;
  if (isError || !project)
    return <div>Erro ao carregar ou hábito não encontrado.</div>;

  return (
    <>
      <div className="p-4">
        <div className="flex gap-9 justify-end my-6">
          <DialogForms
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            dialogContent={
              <>
                <InputHabit projectId={project.id} />
              </>
            }
            dialogTitle="Adicionar habito"
            trigger={
              <Button size="sm" className="bg-yevox-primary">
                Adicionar Habito
              </Button>
            }
          />

          <DialogForms
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            dialogContent={
              <>
                <TaskInput projectId={project.id} />
              </>
            }
            dialogTitle="Adicionar Task"
            trigger={
              <Button size="sm" className="bg-yevox-primary">
                Adicionar Task
              </Button>
            }
          />
        </div>
        <Card>
          <CardHeader className="text-center font-bold text-[20px]">
            {project.title}
          </CardHeader>
          <CardContent className="">
            <div className="">
              <HabitList
                habits={project?.habits}
                colorHabit={project.color ?? "#ccc"}
                onHabitClick={(id) => handleHabitClick(id)}
              ></HabitList>
              {selectedHabitId && (
                <Card className="mt-4">
                  <CardHeader className="py-3 font-semibold text-center">
                    Tasks do hábito
                  </CardHeader>

                  <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {project.tasks
                      ?.filter((task) => task.habitId === selectedHabitId)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex flex-col justify-between gap-2 p-3 border rounded-lg"
                        >
                          <TaskItem task={task} />

                          <TaskPomodoro taskId={task.id} />
                        </div>
                      ))}

                    {project.tasks?.filter((t) => t.habitId === selectedHabitId)
                      .length === 0 && (
                      <p className="col-span-full text-sm text-muted-foreground text-center">
                        Nenhuma task para este hábito
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
