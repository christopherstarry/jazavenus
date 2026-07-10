import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "#/components/ui/toast";
import { dismissToast, useToasts } from "#/components/ui/use-toast";

/** Mount once near the app root. Toasts are pushed via `toast()` from #/components/ui/use-toast. */
export function Toaster() {
  const items = useToasts();
  return (
    <ToastProvider swipeDirection="right">
      {items.map(({ id, title, description, variant, durationMs }) => (
        <Toast key={id} variant={variant} duration={durationMs} onOpenChange={(open) => !open && dismissToast(id)}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
