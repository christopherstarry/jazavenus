import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Sheet = slide-in panel built on Radix Dialog.
  Used for the mobile-only sidebar drawer. Radix gives us focus trap, escape-to-close,
  click-outside-to-close, and ARIA wiring for free. We layer simple Tailwind transforms
  on top of the data-state attribute Radix exposes for the open/close animation.
*/

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "left" | "right";
  showClose?: boolean;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, side = "left", showClose = true, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "transition-opacity duration-200",
        "data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-0 z-50 h-full w-80 max-w-[85vw] bg-card shadow-2xl flex flex-col",
        "transition-transform duration-200 ease-out",
        side === "left" && "left-0 border-r-2 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
        side === "right" && "right-0 border-l-2 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          aria-label="Close menu"
          className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

/* Required for screen-readers; keep visually hidden if you don't want a visible header. */
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;
