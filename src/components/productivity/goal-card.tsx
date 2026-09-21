import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type GoalCardProps = {
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  color?: string | null;
  description?: ReactNode;
  footer?: ReactNode;
  icon?: LucideIcon;
  meta?: ReactNode;
  progress: number;
  title: ReactNode;
};

export function GoalCard({
  actions,
  badge,
  className,
  color,
  description,
  footer,
  icon: Icon,
  meta,
  progress,
  title,
}: GoalCardProps) {
  return (
    <Card className={cn("min-w-0 border-border shadow-none", className)}>
      <CardContent className="grid gap-3 p-3.5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className="grid size-[34px] shrink-0 place-items-center rounded-[var(--r-10)] bg-secondary text-info"
              style={color ? { color } : undefined}
            >
              {Icon ? <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} /> : <span className="size-2.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold">{title}</h3>
              {meta ? <div className="mt-0.5 text-[11px] text-text-tertiary">{meta}</div> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">{badge}{actions}</div>
        </div>
        {description ? <div className="line-clamp-2 text-xs text-text-secondary">{description}</div> : null}
        <Progress value={progress} />
        <div className="flex min-w-0 items-center justify-between gap-3 text-[11px] text-text-tertiary">
          <span>{footer}</span>
          <Badge variant="secondary">{Math.round(progress)}%</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
