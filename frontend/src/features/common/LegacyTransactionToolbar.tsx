import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  Play,
  Printer,
  Save,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "#/components/ui/button";

/** Legacy `RuleModule.bas` FORM_TYPE — controls which toolbar buttons are relevant. */
export type ToolbarMode = "master" | "transaction" | "process";

/** Legacy per-document lifecycle state — drives which buttons are enabled (see PRD table). */
export type FormState = "init" | "insert" | "normal" | "posted" | "voided";

export interface LegacyTransactionToolbarProps {
  mode: ToolbarMode;
  formState: FormState;
  canEdit: boolean;
  canDelete: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  onNew: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onExecute?: () => void;
  onPrint?: () => void;
  onFirst?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  onClose: () => void;
  className?: string;
}

/** True while the browser focus is inside a typing surface — F-keys still fire (they're not letters), but Enter/Escape inside inputs should not. */
function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.getAttribute("contenteditable") === "true";
}

/**
 * Global F-key contract for gap transaction/process screens (F1 New, F2 Save, F3 Delete/Undo,
 * F4 Browse, F5 Execute/Print, F9-F12 Navigate, Esc Close). See
 * docs/modules/shared/ui-foundation/transaction-toolbar-and-shortcuts.md.
 */
export function useLegacyShortcuts(handlers: {
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onBrowse?: () => void;
  onExecute?: () => void;
  onFirst?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  onClose?: () => void;
  onUnlockDate?: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (handlers.enabled === false) return;
    function onKeyDown(e: KeyboardEvent) {
      const typing = isTypingTarget(document.activeElement);
      switch (e.key) {
        case "F1":
          e.preventDefault();
          handlers.onNew?.();
          break;
        case "F2":
          e.preventDefault();
          handlers.onSave?.();
          break;
        case "F3":
          e.preventDefault();
          (handlers.onUndo ?? handlers.onDelete)?.();
          break;
        case "F4":
          e.preventDefault();
          handlers.onBrowse?.();
          break;
        case "F5":
          e.preventDefault();
          handlers.onExecute?.();
          break;
        case "F6":
          e.preventDefault();
          handlers.onUnlockDate?.();
          break;
        case "F9":
          e.preventDefault();
          handlers.onFirst?.();
          break;
        case "F10":
          e.preventDefault();
          handlers.onPrevious?.();
          break;
        case "F11":
          e.preventDefault();
          handlers.onNext?.();
          break;
        case "F12":
          e.preventDefault();
          handlers.onLast?.();
          break;
        case "Escape":
          if (typing) return;
          handlers.onClose?.();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers.enabled, handlers.onNew, handlers.onSave, handlers.onDelete, handlers.onUndo, handlers.onBrowse,
      handlers.onExecute, handlers.onFirst, handlers.onPrevious, handlers.onNext, handlers.onLast, handlers.onClose, handlers.onUnlockDate]);
}

/**
 * Enablement matrix from the PRD: init/insert/normal/posted/voided x New/Save/Del-Undo/Execute.
 * "Execute" (F5 Post) is only meaningful once a draft is actually loaded/saved ("normal") — the
 * Print button has its own independent `formState === "posted"` check in the component below.
 */
function enablement(formState: FormState, mode: ToolbarMode) {
  const nav = mode === "master";
  // Process-mode screens (reports, batch jobs) have no document lifecycle — Execute is always
  // ready and New/Save/Delete are not part of the contract (per the PRD's toolbar-modes table).
  if (mode === "process") return { canNew: false, canSave: false, canDeleteOrUndo: false, canExecute: true, nav: false };
  switch (formState) {
    case "init":
      return { canNew: true, canSave: false, canDeleteOrUndo: false, canExecute: false, nav };
    case "insert":
      return { canNew: false, canSave: true, canDeleteOrUndo: true, canExecute: false, nav };
    case "posted":
      return { canNew: true, canSave: false, canDeleteOrUndo: false, canExecute: false, nav };
    case "voided":
      return { canNew: true, canSave: false, canDeleteOrUndo: false, canExecute: false, nav };
    case "normal":
    default:
      return { canNew: true, canSave: true, canDeleteOrUndo: true, canExecute: true, nav };
  }
}

/**
 * Toolbar rendered inside each gap page's content area (legacy `tbPOS`). Shortcut hints show the
 * bound F-key. The current app shell/sidebar is untouched — this is a page-local component.
 */
export function LegacyTransactionToolbar({
  mode,
  formState,
  canEdit,
  canDelete,
  isDirty,
  isSaving,
  onNew,
  onSave,
  onDelete,
  onUndo,
  onExecute,
  onPrint,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onClose,
  className,
}: LegacyTransactionToolbarProps) {
  const { t } = useTranslation("toolbar");
  const rule = enablement(formState, mode);
  const isInsert = formState === "insert";

  if (!canEdit) {
    return (
      <div className={`flex flex-wrap items-center gap-2 rounded-md border-2 bg-muted/40 px-3 py-2 ${className ?? ""}`}>
        <span className="text-sm font-semibold text-muted-foreground">{t("readOnly")}</span>
        <div className="ml-auto flex gap-2">
          {formState === "posted" && onPrint && (
            <Button type="button" variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4" /> {t("print")}
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" /> {t("close")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 rounded-md border-2 bg-card px-2 py-1.5 ${className ?? ""}`}>
      <Button type="button" variant="outline" size="sm" title="F1" disabled={!rule.canNew} onClick={onNew}>
        <FilePlus className="h-4 w-4" /> {t("new")}
      </Button>
      <Button
        type="button"
        variant="default"
        size="sm"
        title="F2"
        disabled={!rule.canSave || !isDirty || isSaving}
        onClick={onSave}
      >
        <Save className="h-4 w-4" /> {t("save")}
      </Button>
      {isInsert ? (
        <Button type="button" variant="outline" size="sm" title="F3" disabled={!rule.canDeleteOrUndo} onClick={onUndo}>
          <Undo2 className="h-4 w-4" /> {t("undo")}
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          title="F3"
          disabled={!rule.canDeleteOrUndo || !canDelete}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" /> {t("delete")}
        </Button>
      )}
      {onExecute && (
        <Button type="button" variant="secondary" size="sm" title="F5" disabled={!rule.canExecute} onClick={onExecute}>
          <Play className="h-4 w-4" /> {t("execute")}
        </Button>
      )}
      {onPrint && (
        <Button type="button" variant="outline" size="sm" title="F5" disabled={formState !== "posted"} onClick={onPrint}>
          <Printer className="h-4 w-4" /> {t("print")}
        </Button>
      )}

      {rule.nav && (
        <div className="flex items-center gap-1 border-l-2 pl-1.5 ml-1">
          <Button type="button" variant="ghost" size="iconsm" title="F9" onClick={onFirst}>
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="iconsm" title="F10" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="iconsm" title="F11" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="iconsm" title="F12" onClick={onLast}>
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Button type="button" variant="ghost" size="sm" title="Esc" className="ml-auto" onClick={onClose}>
        <X className="h-4 w-4" /> {t("close")}
      </Button>
    </div>
  );
}
