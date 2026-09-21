import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  className?: string;
  delta?: ReactNode;
  icon?: LucideIcon;
  label: ReactNode;
  value: ReactNode;
};

export function StatCard({ className, delta, icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className={cn("min-w-0 border-border shadow-none", className)}>
      <CardContent className="flex min-h-[88px] items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] text-text-secondary">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold tracking-[-0.04em]">{value}</p>
          {delta ? <div className="mt-1 text-[11px] font-semibold text-success">{delta}</div> : null}
        </div>
        {Icon ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-[var(--r-10)] bg-secondary text-text-secondary">
            <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
