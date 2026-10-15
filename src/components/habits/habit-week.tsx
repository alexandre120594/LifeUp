import { Check, Minus, RotateCcw } from "lucide-react";
import type { HabitDay } from "@/lib/life-habits";
import { cn } from "@/lib/utils";

export function HabitWeek({ days }: { days: HabitDay[] }) {
  return <div className="grid grid-cols-7 gap-1.5" aria-label="Últimos sete dias">{days.map((day) => {
    const neutral = day.isPaused || !day.isScheduled;
    const state = neutral ? "neutro" : day.isRelapse ? "recaída" : day.isCompleted ? "concluído" : "pendente";
    return <div className="grid justify-items-center gap-1" key={day.dayKey}><span className={cn("text-[10px] font-medium text-text-tertiary", day.isToday && "text-primary")}>{day.label}</span><span aria-label={`${day.dayKey}: ${state}`} className={cn("grid size-6 place-items-center rounded-full border text-transparent", day.isCompleted && !day.isRelapse ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-background", day.isToday && "ring-2 ring-primary/20 ring-offset-1 ring-offset-background", day.isRelapse && "border-destructive/50 bg-destructive/10 text-destructive", neutral && "border-dashed bg-secondary/40 text-text-tertiary opacity-60")} title={`${day.dayKey}: ${state}`}>{neutral ? <Minus className="size-3" /> : day.isRelapse ? <RotateCcw className="size-3" /> : <Check className="size-3.5" strokeWidth={2.5} />}</span></div>;
  })}</div>;
}
