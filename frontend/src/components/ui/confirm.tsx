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

/** Result of a three-button business-rule prompt (legacy credit-limit / overdue Yes/No/Cancel MsgBox). */
export type BusinessRuleAnswer = "yes" | "no" | "cancel";

export interface BusinessRuleConfirmOptions {
  title: string;
  description: ReactNode;
  yesLabel?: string;
  noLabel?: string;
  cancelLabel?: string;
  /** Yes requires an elevated role (credit/overdue override) — rendered as destructive to signal risk. */
  yesIsOverride?: boolean;
}

export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [ruleState, setRuleState] = useState<(BusinessRuleConfirmOptions & { resolve: (a: BusinessRuleAnswer) => void }) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setState({ ...opts, resolve })),
    []
  );

  /** Three-button business-rule prompt — see docs/modules/shared/ui-foundation/dialog-patterns.md #4/#5. */
  const confirmBusinessRule = useCallback(
    (opts: BusinessRuleConfirmOptions) =>
      new Promise<BusinessRuleAnswer>((resolve) => setRuleState({ ...opts, resolve })),
    []
  );

  const close = (ok: boolean) => {
    if (!state) return;
    state.resolve(ok);
    setState(null);
  };

  const closeRule = (answer: BusinessRuleAnswer) => {
    if (!ruleState) return;
    ruleState.resolve(answer);
    setRuleState(null);
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

  const businessRuleDialog = ruleState && (
    <Dialog open onOpenChange={(o) => { if (!o) closeRule("cancel"); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ruleState.title}</DialogTitle>
          <DialogDescription>{ruleState.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" size="lg" onClick={() => closeRule("cancel")} autoFocus>
            {ruleState.cancelLabel ?? "Cancel"}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={() => closeRule("no")}>
              {ruleState.noLabel ?? "No"}
            </Button>
            <Button
              variant={ruleState.yesIsOverride ? "destructive" : "default"}
              size="lg"
              onClick={() => closeRule("yes")}
            >
              {ruleState.yesLabel ?? "Yes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmBusinessRule, dialog, businessRuleDialog };
}
