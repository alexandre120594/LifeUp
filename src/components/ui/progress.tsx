import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  indicatorClassName?: string;
  max?: number;
  value?: number;
};

function Progress({
  className,
  indicatorClassName,
  max = 100,
  value = 0,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn("h-[7px] w-full overflow-hidden rounded-full bg-pressed", className)}
      data-slot="progress"
      role="progressbar"
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-[inherit] bg-primary transition-[width] duration-[var(--slow)] ease-[var(--ease)]",
          indicatorClassName,
        )}
        data-slot="progress-indicator"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };

