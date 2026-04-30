import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "#/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-w-xs rounded-md border-2 bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Inline jargon explainer. Hovering or focusing the (?) icon shows a plain-language definition.
 *
 *   <Term name="GRN">Goods Receipt Note — proof we received goods from a supplier.</Term>
 */
export function Term({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label={`What does ${name} mean?`}
        >
          {name}
          <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="font-semibold">{name}</div>
        <div className="mt-1">{children}</div>
      </TooltipContent>
    </Tooltip>
  );
}
