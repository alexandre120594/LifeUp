"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateHabits } from "@/hooks/useHabitMutations";
import { useHabitStore } from "@/store/useTaskStore";
import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

function InputHabit({ projectId }: { projectId?: string }) {
  const { register, handleSubmit, reset, setValue } =
    useForm<HabitCreateInput>();

  const { mutate, isPending } = useCreateHabits();

  const onSubmit = (data: HabitCreateInput) => {
    const dataSubmit: HabitCreateInput = {
      title: data.title,
      projectId: projectId,
    };

    mutate(dataSubmit, {
      onSuccess: () => {
        setValue("title", "");
      },
    });
  };

  return (
    <div>
      <Card className="w-full mt-4">
        <CardHeader>Insira um habito:</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("title", { required: "Insira algum habito" })}
              disabled={isPending}
              placeholder="Insira um habito"
            ></Input>
            <Button type="submit" disabled={isPending} className="mt-4">
              {isPending ? "Adicionando..." : "Adicionar Hábito"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default InputHabit;
