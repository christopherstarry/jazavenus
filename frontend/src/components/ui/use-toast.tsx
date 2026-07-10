import { useEffect, useState } from "react";
import type { ToastVariant } from "#/components/ui/toast";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l([...toasts]);
}

/** Fire-and-forget toast — usable from anywhere (event handlers, mutation callbacks) without a hook. */
export function toast(item: Omit<ToastItem, "id">) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, durationMs: 4000, ...item }];
  emit();
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** Subscribes the <Toaster/> to the module-level toast queue. */
export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>(toasts);
  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  return items;
}
