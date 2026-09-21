import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-10)] border border-transparent text-[13px] font-semibold leading-[var(--leading-ui)] transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-[var(--fast)] ease-[var(--ease)] hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-[0.42] disabled:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-[0.88]",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/20",
        outline:
          "border-border-strong bg-panel text-foreground shadow-snow-1 hover:bg-hover",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-pressed",
        ghost:
          "hover:bg-hover hover:text-foreground dark:hover:bg-hover",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-[13px] has-[>svg]:px-3",
        sm: "h-[30px] gap-1.5 rounded-lg px-2.5 text-xs has-[>svg]:px-2",
        lg: "h-[42px] rounded-xl px-4 has-[>svg]:px-3.5",
        icon: "size-9 p-0",
        "icon-sm": "size-[30px] rounded-lg p-0",
        "icon-lg": "size-[42px] rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
