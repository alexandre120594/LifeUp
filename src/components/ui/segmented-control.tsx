import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  disabled?: boolean;
  label: ReactNode;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  "aria-label": string;
  className?: string;
  onValueChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  value: T;
};

function SegmentedControl<T extends string>({
  "aria-label": ariaLabel,
  className,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn("inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[var(--r-10)] bg-secondary p-[3px]", className)}
      data-slot="segmented-control"
      role="group"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "h-[30px] shrink-0 rounded-lg px-[11px] text-xs text-text-secondary transition-[background-color,color,box-shadow] duration-[var(--fast)] ease-[var(--ease)] hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-[0.42]",
              isActive && "bg-panel font-semibold text-foreground shadow-snow-1",
            )}
            disabled={option.disabled}
            key={option.value}
            onClick={() => onValueChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };

