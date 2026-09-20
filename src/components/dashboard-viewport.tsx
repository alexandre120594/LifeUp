import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DashboardViewport({
  children,
  className,
  contentClassName,
  header,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  header?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden p-3 md:p-4",
        className,
      )}
    >
      {header ? <div className="shrink-0">{header}</div> : null}
      <div
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1",
          header ? "mt-3" : null,
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
