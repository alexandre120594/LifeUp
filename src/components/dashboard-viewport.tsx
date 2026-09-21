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
        "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-background",
        className,
      )}
    >
      {header ? (
        <div className="w-full shrink-0 px-4 pt-4 md:px-7 md:pt-5">
          {header}
        </div>
      ) : null}
      <div
        className={cn(
          "min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border md:px-7",
          header ? "mt-3 pt-0" : "pt-4 md:pt-5",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
