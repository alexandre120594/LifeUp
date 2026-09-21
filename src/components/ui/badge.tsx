import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border px-2 text-[11px] font-semibold leading-[var(--leading-ui)] transition-[background-color,border-color,color,box-shadow] before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:opacity-80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:pointer-events-none [&:has(svg)]:before:hidden",
  {
    variants: {
      variant: {
        default:
          "border-border bg-secondary text-text-secondary [a&]:hover:bg-hover",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a&]:hover:bg-pressed",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15 focus-visible:ring-destructive/20",
        outline:
          "border-border bg-panel text-text-secondary [a&]:hover:bg-hover [a&]:hover:text-foreground",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        info: "border-info/30 bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
