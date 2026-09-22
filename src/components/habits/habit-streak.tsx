import { Flame } from "lucide-react";

import { getStreakMessage } from "@/lib/life-habits";
import { cn } from "@/lib/utils";

export function HabitStreak({ compact = false, streak }: { compact?: boolean; streak: number }) {
  return (
    <div className={cn("flex items-center gap-2", compact ? "justify-end" : "justify-start")}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Flame className="size-4" aria-hidden="true" />
      </span>
      <div className={cn(compact && "text-right")}>
        <div className="text-xl font-bold leading-none tracking-tight">
          {streak} <span className="text-xs font-medium text-text-secondary">dia{streak === 1 ? "" : "s"}</span>
        </div>
        <p className="mt-1 text-[10px] text-text-tertiary">{getStreakMessage(streak)}</p>
      </div>
    </div>
  );
}
