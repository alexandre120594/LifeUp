import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FocusCardProps = {
  actions?: ReactNode;
  className?: string;
  label: ReactNode;
  meta?: ReactNode;
  time: ReactNode;
};

export function FocusCard({ actions, className, label, meta, time }: FocusCardProps) {
  return (
    <Card className={cn("relative min-h-36 overflow-hidden border-border-strong bg-foreground text-background shadow-snow-1", className)}>
      <CardContent className="relative z-10 flex h-full min-h-36 flex-col justify-between gap-4 p-4">
        <div>
          <div className="text-[11px] text-background/65">{label}</div>
          <div className="mt-2 text-[34px] font-semibold tracking-[-0.05em] tabular-nums">{time}</div>
          {meta ? <div className="mt-1 text-[11px] text-background/65">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </CardContent>
      <span aria-hidden="true" className="absolute -right-12 -top-16 size-36 rounded-full bg-background/10 blur-xl" />
    </Card>
  );
}
