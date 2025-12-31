"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  DeleteIcon,
  Edit,
  Flame,
  LucideDelete,
  Send,
  Trash,
} from "lucide-react";
import { useHabitStore } from "@/store/useTaskStore";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChangeEventHandler, useState } from "react";
import { Input } from "@/components/ui/input";
import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";
import { useDeleteHabits, useUpdateHabits } from "@/hooks/useHabitMutations";
import { useForm } from "react-hook-form";

export default function HabitItem({
  habit,
  colorHabit,
}: {
  habit: Habit;
  colorHabit?: string;
}) {
  const { register, handleSubmit, reset, setValue } = useForm<HabitCreateInput>(
    {
      defaultValues: { title: habit.title, projectId: habit.projectId },
    }
  );

  const [isEdit, setisEdit] = useState<any>();

  const { mutate, isPending } = useDeleteHabits(habit?.id);

  const { mutate: mutateTaskUpdate } = useUpdateHabits();

  const onSubmitUpdate = (data: HabitCreateInput) => {
    mutateTaskUpdate(
      { id: habit?.id, data },
      {
        onSuccess: () => {
          setisEdit(false);
        },
      }
    );
  };

  const onSubmitDelete = (id?: string) => {
    mutate(id);
  };
  const last7Days = Array.from({ length: 7 })
    .map((_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"))
    .reverse();
  return (
    <Card
      className="p-4 flex items-center justify-between border-l-4 shadow-sm"
      style={{ borderLeftColor: colorHabit || "#ccc" }}
    >
      <div className="flex items-center gap-10">
        {/* <Checkbox
          checked={habit?.completedToday}
          onCheckedChange={() => toggleHabit(habit?.id)}
          className="h-6 w-6"
        /> */}
        <div>
          {/* <p
            className={`font-semibold ${
              habit.completedToday ? "line-through text-muted-foreground" : ""
            }`}
          > */}
          {isEdit === habit?.id ? (
            <>
              <div className="flex gap-2 font-bold">
                <form onSubmit={handleSubmit(onSubmitUpdate)}>
                  <Input
                    {...register("title", { required: "Insira algum habito" })}
                    disabled={isPending}
                    placeholder="Insira um habito"
                  ></Input>
                  <Button type="submit" disabled={isPending} className="mt-4">
                    {isPending ? "Adicionando..." : "Adicionar Hábito"}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              {habit?.title}
              <div
                className="font-bold text-[16px]"
                style={{ color: habit?.project?.color ?? "#000" }}
              >
                Projeto: {habit?.project?.title}
              </div>
            </>
          )}
          {/* </p> */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-orange-600 font-medium">
              <Flame className="w-4 h-4 mr-1 fill-orange-500" />
              {habit?.streak} day streak
            </div>

            <div className="flex gap-1">
              {last7Days.map((date) => {
                const isCompleted = habit?.history.includes(date);
                return (
                  <div
                    key={date}
                    title={date} // Shows date on hover
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isCompleted ? "bg-orange-500" : "bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => onSubmitDelete(habit?.id)}
        >
          <Trash className="text-red-600"></Trash>
        </Button>
        {isEdit !== habit?.id && (
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={(e) => setisEdit(habit?.id)}
          >
            <Edit className="text-red-600"></Edit>
          </Button>
        )}
      </div>
    </Card>
  );
}
