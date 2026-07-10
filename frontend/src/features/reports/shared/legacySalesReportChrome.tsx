import type { ReactNode } from "react";
import {
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  MoreHorizontal,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "#/components/ui/button";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";

export const legacyFormInputClass =
  "h-9 w-full min-w-0 rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:border-ring";

type ToolbarVariant = "report" | "transaction";

export function LegacySalesReportToolbar({ toolbarVariant }: { toolbarVariant: ToolbarVariant }) {
  const navigate = useNavigate();
  const noop = () => {};

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="New">
        <FilePlus className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="Del" disabled>
        <Trash2 className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden font-semibold sm:inline">Del</span>
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 px-3 text-sm" title="Save" disabled>
        <Save className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden font-semibold sm:inline">Save</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 border-primary/60 px-3 text-sm"
        title="Execute Report / Transaction"
      >
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        <span className="ml-1.5 hidden font-semibold md:inline">Exec</span>
      </Button>

      {toolbarVariant === "transaction" ? (
        <>
          <div className="mx-1 hidden h-7 w-px shrink-0 bg-border sm:block" aria-hidden />
          <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">Navigation</span>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="First" onClick={noop}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="Previous" onClick={noop}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="Next" onClick={noop}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" title="Last" onClick={noop}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : null}

      <div className="flex-1" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
        title="Close Active Form"
        onClick={() => navigate(-1)}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}

export function LegacySalesReportChrome({
  toolbarVariant,
  onPreviousForm,
  onNextForm,
  children,
}: {
  toolbarVariant: ToolbarVariant;
  onPreviousForm?: () => void;
  onNextForm?: () => void;
  children: ReactNode;
}) {
  const noop = () => {};

  return (
    <div className="min-w-0 space-y-3">
      <LegacySalesReportToolbar toolbarVariant={toolbarVariant} />
      <LegacyDivisionFormNav onPreviousForm={onPreviousForm ?? noop} onNextForm={onNextForm ?? noop} />
      {children}
    </div>
  );
}

export function CodeBrowseRow({
  label,
  inputId,
  value,
  onChange,
  description,
  onDescriptionChange,
  allChecked,
  onAllChange,
  showAll,
  showDescription = true,
  allCheckboxLabel = "All",
  codeInputClassName,
}: {
  label: string;
  inputId: string;
  value: string;
  onChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  allChecked: boolean;
  onAllChange: (v: boolean) => void;
  showAll: boolean;
  /** When false, hides the description field (e.g. Status code only). */
  showDescription?: boolean;
  /** Label beside the All checkbox (legacy: All Brand, All Gudang, …). */
  allCheckboxLabel?: string;
  /** Override code input width/styling (e.g. Status short code). */
  codeInputClassName?: string;
}) {
  const codeClass =
    codeInputClassName ?? legacyFormInputClass + " max-w-[9rem] font-mono tabular-nums";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-1">
        <label htmlFor={inputId} className="text-xs font-medium">
          {label}
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={allChecked}
            className={codeClass}
            autoComplete="off"
          />
          <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" title="Browse" disabled>
            <MoreHorizontal className="h-4 w-4 scale-x-150" />
          </Button>
          {showDescription ? (
            <input
              aria-label={`${label} description`}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={allChecked}
              className={legacyFormInputClass + " min-w-[8rem] flex-1"}
            />
          ) : null}
          {showAll ? (
            <label className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium whitespace-nowrap">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onAllChange(e.target.checked)}
                className="h-4 w-4 rounded border-2 border-input accent-primary"
              />
              {allCheckboxLabel}
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
