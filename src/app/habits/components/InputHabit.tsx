"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateHabits } from "@/hooks/useHabitMutations";
import { useHabitStore } from "@/store/useTaskStore";
import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

function InputHabit() {
  const [habitInput, setHabitInput] = useState("");

  const { register, handleSubmit, reset } = useForm<HabitCreateInput>();

  const { mutate, isPending } = useCreateHabits();

  const onSubmit = (data: HabitCreateInput) => {
    const dataSubmit: HabitCreateInput = {
      title: data.title,
      projectId: "cmjof086d0000h0uu0l59g7p5"
    }
    mutate(dataSubmit, {
      onSuccess: () => reset,
    });
  };

  return (
    <div>
      <Card className="w-full max-w-md mt-4">
        <CardHeader>Insira um habito:</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("title", { required: "Insira algum habito" })}
              onChange={(e) => {
                setHabitInput(e.target.value);
              }}
              placeholder="Insira um habito"
            ></Input>
            <Button type="submit" className="text-center mt-4">
              Adicionar Habito
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default InputHabit;
