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
import { Habit, useHabitStore } from "@/store/useTaskStore";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChangeEventHandler, useState } from "react";
import { Input } from "@/components/ui/input";

export default function HabitItem({ habit }: { habit: Habit }) {
  const { toggleHabit, deleteHabit, editHabit } = useHabitStore();

  const [editarHabito, setEditarHabito] = useState(habit.title);
  const [isEdit, setisEdit] = useState("");

  const last7Days = Array.from({ length: 7 })
    .map((_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"))
    .reverse();

  return (
    <Card className="p-4 flex items-center justify-between border-l-4 border-l-orange-500 shadow-sm">
      <div className="flex items-center gap-10">
        <Checkbox
          checked={habit.completedToday}
          onCheckedChange={() => toggleHabit(habit.id)}
          className="h-6 w-6"
        />
        <div>
          <p
            className={`font-semibold ${
              habit.completedToday ? "line-through text-muted-foreground" : ""
            }`}
          >
            {isEdit === habit.id ? (
              <>
                <div className="flex gap-2">
                  <Input
                    onChange={(e) => {
                      setEditarHabito(e.target.value);
                    }}
                    value={editarHabito}
                  ></Input>

                  <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={() => {
                      editHabit(habit.id, editarHabito);
                      setisEdit("");
                    }}
                  >
                    <Send className="text-green-600"></Send>
                  </Button>
                </div>
              </>
            ) : (
              habit.title
            )}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-orange-600 font-medium">
              <Flame className="w-4 h-4 mr-1 fill-orange-500" />
              {habit.streak} day streak
            </div>

            <div className="flex gap-1">
              {last7Days.map((date) => {
                const isCompleted = habit.history.includes(date);
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
          onClick={() => deleteHabit(habit.id)}
        >
          <Trash className="text-red-600"></Trash>
        </Button>
        {isEdit !== habit.id && (
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={(e) => setisEdit(habit.id)}
          >
            <Edit className="text-red-600"></Edit>
          </Button>
        )}
      </div>
    </Card>
  );
}
