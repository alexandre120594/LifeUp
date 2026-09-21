import { Check, Flame } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StreakDay = { completed?: boolean; label: string; value?: ReactNode };

type StreakCardProps = {
  badge?: ReactNode;
  className?: string;
  days?: StreakDay[];
  label: ReactNode;
  value: ReactNode;
};

export function StreakCard({ badge, className, days = [], label, value }: StreakCardProps) {
  return (
    <Card className={cn("border-border bg-[color-mix(in_srgb,var(--orange)_10%,var(--panel))] shadow-none", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] text-text-tertiary">{label}</div>
            <div className="mt-1 flex items-center gap-1.5 text-2xl font-semibold tracking-[-0.04em]">
              <Flame aria-hidden="true" className="size-5 text-warning" />{value}
            </div>
          </div>
          {badge ? <Badge variant="warning">{badge}</Badge> : null}
        </div>
        {days.length ? (
          <div className="mt-3.5 grid grid-cols-7 gap-1.5">
            {days.map((day, index) => (
              <div className="grid place-items-center gap-1.5" key={`${day.label}-${index}`}>
                <small className="text-[9px] text-text-tertiary">{day.label}</small>
                <span className={cn("grid size-7 place-items-center rounded-lg bg-secondary text-[10px] text-text-tertiary", day.completed && "bg-[color-mix(in_srgb,var(--orange)_22%,transparent)] text-warning")}>
                  {day.completed ? <Check className="size-3" /> : day.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
