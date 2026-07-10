import { HTTPError } from "ky";

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

/**
 * Reads the RFC-7807 `detail` field from an API error response. `ky`'s global `beforeError` hook
 * (see #/lib/api.ts) already rewrites `error.message` to the generic `title` ("Business rule
 * violated" for every DomainException), so this is the only reliable way to recover the specific
 * reason text (e.g. "Customer has overdue invoices.") needed to pick the right business-rule dialog.
 */
export async function getProblemDetail(err: unknown): Promise<ProblemDetails | null> {
  if (!(err instanceof HTTPError)) return null;
  try {
    return (await err.response.clone().json()) as ProblemDetails;
  } catch {
    return null;
  }
}

/** Best-effort human-readable message for a caught API error, for toasts/generic banners. */
export async function describeApiError(err: unknown): Promise<string> {
  const problem = await getProblemDetail(err);
  if (problem?.detail) return problem.detail;
  if (err instanceof Error) return err.message;
  return String(err);
}

export type BusinessRuleKind = "creditLimit" | "overdue" | "locked" | "other";

/** Classifies a DomainException's detail text so the UI can show the matching legacy dialog. */
export function classifyBusinessRule(detail: string): BusinessRuleKind {
  const lower = detail.toLowerCase();
  if (lower.includes("credit limit")) return "creditLimit";
  if (lower.includes("overdue")) return "overdue";
  if (lower.includes("locked") || lower.includes("closed period") || lower.includes("period is closed")) return "locked";
  return "other";
}
