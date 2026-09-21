import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[38px] w-full min-w-0 rounded-[var(--r-10)] border border-border-strong bg-panel px-[11px] text-[13px] text-foreground shadow-none transition-[background-color,border-color,box-shadow] duration-[var(--fast)] ease-[var(--ease)] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-text-tertiary selection:bg-[var(--blue)] selection:text-[#111] hover:border-foreground/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-panel-subtle disabled:opacity-[0.42]",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
