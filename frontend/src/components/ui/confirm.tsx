import { useState, useCallback, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

/*
  Forgiving destructive actions: every Delete / Void must go through this dialog.
  Pattern: Title that names the OBJECT, body that explains WHAT WILL HAPPEN, two equally-sized buttons,
  Cancel on the LEFT (so muscle memory doesn't accidentally confirm), destructive on the right.
*/

export interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setState({ ...opts, resolve })),
    []
  );

  const close = (ok: boolean) => {
    if (!state) return;
    state.resolve(ok);
    setState(null);
  };

  const dialog = state && (
    <Dialog open onOpenChange={(o) => { if (!o) close(false); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          <DialogDescription>{state.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="lg" onClick={() => close(false)} autoFocus>
            {state.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            variant={state.destructive ? "destructive" : "default"}
            size="lg"
            onClick={() => close(true)}
          >
            {state.confirmLabel ?? (state.destructive ? "Yes, delete" : "Confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, dialog };
}
