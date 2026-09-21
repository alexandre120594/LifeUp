import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TaskRowProps = {
  actions?: ReactNode;
  className?: string;
  completed?: boolean;
  leading?: ReactNode;
  meta?: ReactNode;
  onToggle?: () => void;
  title: ReactNode;
};

export function TaskRow({ actions, className, completed, leading, meta, onToggle, title }: TaskRowProps) {
  const marker = leading ?? (
    <span className={cn("grid size-[18px] place-items-center rounded-md border border-border-strong", completed && "border-primary bg-primary text-primary-foreground")}>
      {completed ? <Check aria-hidden="true" className="size-3" strokeWidth={2} /> : null}
    </span>
  );

  return (
    <div className={cn("grid min-h-12 min-w-0 grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[var(--r-10)] px-2.5 py-2 transition-colors hover:bg-hover", className)}>
      {onToggle ? (
        <button aria-label={completed ? "Marcar como pendente" : "Marcar como concluido"} className="grid size-7 place-items-center rounded-lg" onClick={onToggle} type="button">
          {marker}
        </button>
      ) : <span className="grid size-7 place-items-center">{marker}</span>}
      <div className="min-w-0">
        <div className={cn("truncate text-xs", completed && "text-text-tertiary line-through")}>{title}</div>
        {meta ? <div className="mt-0.5 truncate text-[11px] text-text-tertiary">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}
