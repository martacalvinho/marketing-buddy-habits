import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background transition-brutal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-4 border-foreground uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 active:shadow-brutal-small",
        destructive:
          "bg-destructive text-destructive-foreground shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 active:shadow-brutal-small",
        outline:
          "bg-background text-foreground shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 active:shadow-brutal-small",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 active:shadow-brutal-small",
        ghost: "border-0 shadow-none hover:bg-accent hover:text-accent-foreground",
        link: "border-0 shadow-none text-primary underline-offset-4 hover:underline",
        hero: "bg-accent text-accent-foreground shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 active:shadow-brutal-small",
        success: "bg-success text-success-foreground shadow-brutal hover:shadow-brutal-hover active:translate-x-1 active:translate-y-1 active:shadow-brutal-small",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
