"use client";

import { format, subDays } from "date-fns";
import { Edit, Flame, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteHabits, useUpdateHabits } from "@/hooks/useHabitMutations";
import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";
import { useState } from "react";

export default function HabitItem({
  habit,
  colorHabit,
  NameProject,
  onClickHabit,
}: {
  habit: Habit;
  colorHabit?: string;
  NameProject?: string;
  onClickHabit?: (id: string) => void;
}) {
  const { register, handleSubmit } = useForm<HabitCreateInput>({
    defaultValues: { title: habit.title, projectId: habit.projectId },
  });
  const [isEdit, setIsEdit] = useState<string | null>(null);
  const { mutate: deleteHabit, isPending } = useDeleteHabits(habit.id);
  const { mutate: updateHabit } = useUpdateHabits();

  const last7Days = Array.from({ length: 7 })
    .map((_, index) => format(subDays(new Date(), index), "yyyy-MM-dd"))
    .reverse();

  const onSubmitUpdate = (data: HabitCreateInput) => {
    updateHabit(
      { id: habit.id, data },
      {
        onSuccess: () => {
          setIsEdit(null);
        },
      }
    );
  };

  return (
    <Card
      className="items-center justify-between border-l-4 p-4 shadow-sm"
      style={{ borderLeftColor: colorHabit || "#ccc" }}
      onClick={() => onClickHabit?.(habit.id)}
    >
      <div>
        <div>
          {isEdit === habit.id ? (
            <div className="flex gap-2 font-bold">
              <form onSubmit={handleSubmit(onSubmitUpdate)}>
                <Input
                  {...register("title", { required: "Insira algum habito" })}
                  disabled={isPending}
                  placeholder="Ex: Concurso Receita Federal..."
                />
                <Button type="submit" disabled={isPending} className="mt-4">
                  {isPending ? "Saving..." : "Save Habit"}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div>{habit.title}</div>
              <div
                className="font-bold"
                style={{ color: habit.project?.color ?? "#000" }}
              >
                Projeto: {NameProject}
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm font-medium text-orange-600">
              <Flame className="mr-1 h-4 w-4 fill-orange-500" />
              {habit.streak} day streak
            </div>

            <div className="flex gap-1">
              {last7Days.map((date) => {
                const isCompleted = habit.history.includes(date);

                return (
                  <div
                    key={date}
                    title={date}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      isCompleted ? "bg-orange-500" : "bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => deleteHabit(habit.id)}
          >
            <Trash className="text-red-600" />
          </Button>

          <div className="text-end">
            {isEdit !== habit.id && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEdit(habit.id)}
              >
                <Edit className="text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
