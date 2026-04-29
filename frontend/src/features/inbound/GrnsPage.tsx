import { CrudPage } from "@/features/common/CrudPage";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck } from "lucide-react";

interface Row {
  id: string; number: string; status: number;
  supplierName: string | null; warehouseCode: string | null;
  receivedAt: string; supplierDeliveryNote: string | null;
}

function statusBadge(s: number) {
  if (s === 10) return <Badge tone="success">Posted</Badge>;
  if (s === 20) return <Badge tone="destructive">Voided</Badge>;
  return <Badge tone="neutral">Draft</Badge>;
}

export function GrnsPage() {
  return (
    <CrudPage<Row>
      title="Receiving Entry"
      description="Each row is a delivery from a supplier. Posting a record updates your stock on hand."
      endpoint="inbound/grns"
      searchable={false}
      columns={[
        { key: "number",       label: "GRN no." },
        { key: "supplierName", label: "Supplier" },
        { key: "warehouseCode",label: "Warehouse" },
        { key: "receivedAt",   label: "Received on", render: (r) => formatDate(r.receivedAt) },
        { key: "supplierDeliveryNote", label: "Supplier DN", render: (r) => r.supplierDeliveryNote ?? <span className="text-muted-foreground">—</span> },
        { key: "status",       label: "Status",      render: (r) => statusBadge(r.status) },
      ]}
      rightSlot={<Button><Plus className="h-5 w-5 mr-2" /> New receipt</Button>}
      empty={{
        icon: Truck,
        title: "No goods received yet",
        description: "When a supplier delivers stock, record it here. Posting a receipt automatically updates your stock on hand.",
        action: <Button><Plus className="h-5 w-5 mr-2" /> Record a delivery</Button>,
      }}
    />
  );
}
