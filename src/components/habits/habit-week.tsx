import { Check } from "lucide-react";

import type { HabitDay } from "@/lib/life-habits";
import { cn } from "@/lib/utils";

export function HabitWeek({ days }: { days: HabitDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-1.5" aria-label="Últimos sete dias">
      {days.map((day) => (
        <div className="grid justify-items-center gap-1" key={day.dayKey}>
          <span
            className={cn(
              "text-[10px] font-medium text-text-tertiary",
              day.isToday && "text-primary",
            )}
          >
            {day.label}
          </span>
          <span
            aria-label={`${day.dayKey}: ${day.isCompleted ? "concluído" : "pendente"}`}
            className={cn(
              "grid size-6 place-items-center rounded-full border text-transparent transition-all duration-200",
              day.isCompleted
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border-strong bg-background",
              day.isToday && "ring-2 ring-primary/20 ring-offset-1 ring-offset-background",
              day.isRelapse && !day.isCompleted && "border-destructive/50 bg-destructive/5",
            )}
            title={`${day.dayKey}: ${day.isCompleted ? "concluído" : day.isRelapse ? "nova sequência" : "pendente"}`}
          >
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
        </div>
      ))}
    </div>
  );
}
