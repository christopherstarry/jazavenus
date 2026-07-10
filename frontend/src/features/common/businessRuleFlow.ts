import type { TFunction } from "i18next";
import { classifyBusinessRule, getProblemDetail } from "#/lib/apiErrors";
import type { BusinessRuleAnswer } from "#/components/ui/confirm";

export interface BusinessRuleFlowDeps {
  confirmBusinessRule: (opts: {
    title: string;
    description: string;
    yesLabel?: string;
    noLabel?: string;
    cancelLabel?: string;
    yesIsOverride?: boolean;
  }) => Promise<BusinessRuleAnswer>;
  t: TFunction;
}

/**
 * Runs `action`; if it fails with a credit-limit or overdue DomainException, shows the legacy
 * Yes/No/Cancel prompt (docs/modules/shared/ui-foundation/dialog-patterns.md #4/#5) and re-runs
 * `action` once if the user picks "Yes". Admin/SuperAdmin retries succeed automatically because
 * the server-side credit check already grants them an override (see OutboundController
 * .EnsureCreditAsync); for everyone else the retry fails again with the same reason, which is the
 * correct outcome for a non-privileged user.
 *
 * Returns `true` if the action ultimately succeeded, `false` if the user declined/cancelled or the
 * retry also failed (the caller should surface `err` via its own catch/toast in that case).
 */
export async function runWithBusinessRuleConfirm(
  action: () => Promise<void>,
  { confirmBusinessRule, t }: BusinessRuleFlowDeps,
): Promise<boolean> {
  try {
    await action();
    return true;
  } catch (err) {
    const problem = await getProblemDetail(err);
    if (!problem?.detail) throw err;

    const kind = classifyBusinessRule(problem.detail);
    if (kind !== "creditLimit" && kind !== "overdue") throw err;

    const answer = await confirmBusinessRule({
      title: t("dialog:validationError"),
      description: kind === "creditLimit" ? t("dialog:creditLimit") : t("dialog:overdue"),
      yesLabel: t("dialog:yes"),
      noLabel: t("dialog:no"),
      cancelLabel: t("dialog:cancel"),
      yesIsOverride: true,
    });

    if (answer !== "yes") return false;
    await action();
    return true;
  }
}
