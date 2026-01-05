"use client";
import { useTaskStore } from "@/store/useTaskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Edit, Send } from "lucide-react";
import { useCreateTask, useTask } from "@/hooks/useTaskMutation";
import { Controller, useForm } from "react-hook-form";
import { TaskCreateInput } from "@/types/BaseInterfaces";
import { useProjectsById } from "@/hooks/useProjectMutations";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { SelectItem } from "@/components/ui/select";

export default function TaskInput({ projectId }: { projectId: string }) {
  const { register, reset, setValue, handleSubmit, control } =
    useForm<TaskCreateInput>();
  const { mutate, isPending } = useCreateTask();
  const { data: project } = useProjectsById(projectId);

  const onSubmit = (data: TaskCreateInput) => {
    if (!data) {
      console.log("Erro");
    } else {
      const dataSubmit: TaskCreateInput = {
        title: data.title,
        projectId: projectId,
        habitId: data.habitId,
      };
      mutate(dataSubmit, {
        onSuccess: () => {
          setValue("title", "");
          setValue("habitId", "");
        },
      });
    }
  };

  return (
    <div>
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Add Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="gap-3">
              <Input
                {...register("title", {
                  required: "Campo não pode ser vazio!",
                })}
                title="Adicione uma task"
                placeholder="Ex: Resolver 20 questões de Crase..."
              ></Input>
              <div className="my-4">
                <Controller
                  name="habitId"
                  control={control}
                  rules={{ required: "Selecione um hábito" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full h-10 px-3 py-2 text-sm bg-white border border-input rounded-md ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between">
                        <SelectValue placeholder="Em qual hábito isso vai somar?" />
                      </SelectTrigger>
                      <SelectContent className=" w-lg bg-popover text-popover-foreground border border-border shadow-md">
                        <SelectGroup>
                          <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-slate-500">
                            Selecione o Hábito:
                          </SelectLabel>
                          {project?.habits?.map((habit) => (
                            <SelectItem
                              key={habit.id}
                              value={habit.id}
                              className="cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                              {habit.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="submit">Adicionar task</Button>
            </form>
          </CardContent>
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  );
}
