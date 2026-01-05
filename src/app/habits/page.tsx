"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import HabitItem from "./components/HabitItem";
import { useHabitStore, useTaskStore } from "@/store/useTaskStore";
import { useState } from "react";
import InputHabit from "./components/InputHabit";
import { useHabit, useHabitDetail } from "@/hooks/useHabitMutations";
// Só é permitido tarefas recentes e diarias.
export default function Habits({ id }: { id: string }) {
  const { data: habit, isLoading } = useHabitDetail(id);

  if (isLoading) return <div>Carregando hábito...</div>;
  if (!habit) return <div>Hábito não encontrado.</div>;
  return (
    <>
      <Card>
        <CardHeader className="text-center font-bold text-[20px]">
          Habit Tracker
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-12">
            {/* {habits?.map((habit) => ( */}
            <HabitItem habit={habit} key={habit?.id}></HabitItem>
            {/* ))} */}
          </div>
        </CardContent>

        <CardContent>
          <InputHabit></InputHabit>
        </CardContent>
      </Card>
    </>
  );
}
