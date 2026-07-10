import { PdcActionPage } from "#/features/ar/PdcActionPage";

/** PDC Clearance Transaction — legacy `frmCheckGiroClearing`. See docs/modules/ar/prds/pdc-clearance.md. */
export function PdcClearanceTransactionPage() {
  return (
    <PdcActionPage
      variant="clear"
      titleKey="ar:pdcClearance.title"
      actionLabelKey="ar:pdcClearance.clear"
      requiredStatus={0 /* PdcStatus.Outstanding */}
      homeRoute="/ar"
    />
  );
}
