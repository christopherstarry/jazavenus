import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

/**
 * Horizontal tab strip styled for older eyes:
 * - 48px tall touch targets (matches Button)
 * - Big, semibold labels
 * - Active tab uses the primary colour with a thick underline
 * - Scrolls horizontally on small screens, never wraps mid-label
 */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // overflow-y-hidden is intentional: in CSS, setting overflow-x:auto on its
      // own implicitly switches overflow-y to "auto" too, which causes a stray
      // vertical scrollbar on long tab strips (Customer has 10 tabs, Product 9).
      // Pinning Y to hidden means the strip ONLY ever scrolls left/right.
      "relative flex w-full items-stretch gap-1 overflow-x-auto overflow-y-hidden border-b-2 -mb-px scroll-smooth",
      "scrollbar-thin",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 sm:px-5 py-3",
      "text-base font-semibold text-muted-foreground",
      "border-b-[3px] border-transparent -mb-[2px]",
      "transition-colors hover:text-foreground hover:bg-accent/50",
      "data-[state=active]:text-primary data-[state=active]:border-primary",
      "focus-visible:outline-none focus-visible:bg-accent",
      "disabled:pointer-events-none disabled:opacity-50",
      "min-h-[3rem]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-5 sm:mt-6 focus-visible:outline-none",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
