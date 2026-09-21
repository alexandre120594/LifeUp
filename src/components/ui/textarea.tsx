import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-[var(--r-10)] border border-border-strong bg-panel px-3 py-2.5 text-[13px] leading-[var(--leading-body)] text-foreground shadow-none transition-[background-color,border-color,box-shadow] duration-[var(--fast)] ease-[var(--ease)] outline-none placeholder:text-text-tertiary hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-panel-subtle disabled:opacity-[0.42]",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };

