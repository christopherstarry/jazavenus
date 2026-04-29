import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Button sizing for warehouse use:
  - default: 48px tall, 16px text — comfortable for mouse + touchscreen.
  - lg: 56px — primary call-to-action on forms.
  - sm: 40px — secondary actions in tables.
  - Always at least 48px wide so they don't feel "cramped".
  - Strong focus ring is provided globally in index.css.
*/

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-semibold ring-offset-background transition-colors disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm",
        outline:     "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:       "hover:bg-accent hover:text-accent-foreground",
        link:        "text-primary underline-offset-4 hover:underline px-0",
        success:     "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
      },
      size: {
        default: "h-12 px-5 text-base min-w-[6rem]",
        lg:      "h-14 px-7 text-lg min-w-[8rem]",
        sm:      "h-10 px-4 text-sm min-w-[5rem]",
        icon:    "h-12 w-12",
        iconsm:  "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { buttonVariants };
