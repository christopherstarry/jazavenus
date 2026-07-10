import { PdcActionPage } from "#/features/ar/PdcActionPage";

/** PDC Clearance Cancellation — distinct legacy flow reversing a prior clearance. See docs/modules/ar/prds/pdc-clearance-cancellation.md. */
export function PdcClearanceCancellationPage() {
  return (
    <PdcActionPage
      variant="cancel"
      titleKey="ar:pdcCancellation.title"
      actionLabelKey="ar:pdcCancellation.cancel"
      requiredStatus={10 /* PdcStatus.Cleared */}
      homeRoute="/ar"
    />
  );
}
