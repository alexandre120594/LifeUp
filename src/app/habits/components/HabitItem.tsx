"use client";

import Link from "next/link";
import { format, subDays } from "date-fns";
import { Edit, Eye, Flame, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteHabits, useUpdateHabits } from "@/hooks/useHabitMutations";
import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";

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
      className="cursor-pointer items-center justify-between border-l-4 p-4 shadow-sm"
      style={{ borderLeftColor: colorHabit || habit.project?.color || "#ccc" }}
      onClick={() => onClickHabit?.(habit.id)}
    >
      <div>
        {isEdit === habit.id ? (
          <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-4">
            <Input
              {...register("title", { required: "Enter a habit name" })}
              disabled={isPending}
              placeholder="Example: Workout after lunch"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Habit"}
            </Button>
          </form>
        ) : (
          <>
            <div className="font-medium">{habit.title}</div>
            <div
              className="font-bold"
              style={{ color: habit.project?.color ?? "#000" }}
            >
              Project: {NameProject || habit.project?.title || "Unassigned"}
            </div>

            <div className="mt-3 flex items-center gap-3">
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
          </>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            onClick={(event) => event.stopPropagation()}
          >
            <Link href={`/habits/${habit.id}`}>
              <Eye className="text-primary" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              deleteHabit(habit.id);
            }}
          >
            <Trash className="text-red-600" />
          </Button>
          {isEdit !== habit.id ? (
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                setIsEdit(habit.id);
              }}
            >
              <Edit className="text-red-600" />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </Card>
  );
}
