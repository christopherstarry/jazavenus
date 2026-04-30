import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "#/components/ui/button";

/** Matches legacy VB header: DIVISION banner + Prev/Next form (same width, side-by-side). */
export function LegacyDivisionFormNav({
  onPreviousForm,
  onNextForm,
}: {
  onPreviousForm: () => void;
  onNextForm: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border-2 bg-primary px-3 py-2 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="whitespace-pre-line text-center text-xs font-bold uppercase leading-snug tracking-wide sm:flex-1 sm:text-left sm:text-sm">
        {`DIVISION : JAZA VENUS DISTRIBUTION\nBANDUNG`}
      </p>

      <div className="flex shrink-0 flex-row items-stretch justify-center gap-1.5 sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex flex-1 min-w-0 gap-1.5 px-3 text-sm font-medium shadow-sm sm:flex-initial sm:min-w-[10.75rem] sm:justify-center"
          onClick={onPreviousForm}
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="truncate">Previous Form</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex flex-1 min-w-0 gap-1.5 px-3 text-sm font-medium shadow-sm sm:flex-initial sm:min-w-[10.75rem] sm:justify-center"
          onClick={onNextForm}
        >
          <span className="truncate">Next Form</span>
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </Button>
      </div>
    </div>
  );
}
