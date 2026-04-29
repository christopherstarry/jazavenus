import { CrudPage } from "@/features/common/CrudPage";
import { formatDate, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Plus, FileText } from "lucide-react";

interface Row {
  id: string; number: string; status: number;
  customerName: string | null;
  issueDate: string; dueDate: string;
  currency: string; grandTotal: number; amountDue: number;
}

function statusBadge(s: number) {
  switch (s) {
    case 10: return <Badge tone="info">Posted</Badge>;
    case 20: return <Badge tone="warning">Partial paid</Badge>;
    case 30: return <Badge tone="success">Paid</Badge>;
    case 90: return <Badge tone="destructive">Voided</Badge>;
    default: return <Badge tone="neutral">Draft</Badge>;
  }
}

export function InvoicesPage() {
  return (
    <CrudPage<Row>
      title="Invoices"
      description="Bills sent to customers. The PDF can be downloaded with the button on the right."
      endpoint="invoices"
      searchable={false}
      columns={[
        { key: "number",       label: "Invoice no." },
        { key: "customerName", label: "Customer" },
        { key: "issueDate",    label: "Issued on", render: (r) => formatDate(r.issueDate) },
        { key: "dueDate",      label: "Due on",    render: (r) => formatDate(r.dueDate) },
        { key: "grandTotal",   label: "Total",     align: "right", render: (r) => `${r.currency} ${formatNumber(r.grandTotal)}` },
        { key: "amountDue",    label: "Still owed",align: "right", render: (r) => `${r.currency} ${formatNumber(r.amountDue)}` },
        { key: "status",       label: "Status",    render: (r) => statusBadge(r.status) },
        {
          key: "actions",
          label: "",
          render: (r) => (
            <a href={`/api/invoices/${r.id}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" aria-label={`Download PDF for invoice ${r.number}`}>
                <FileDown className="h-5 w-5 mr-1" /> PDF
              </Button>
            </a>
          ),
        },
      ]}
      rightSlot={<Button><Plus className="h-5 w-5 mr-2" /> New invoice</Button>}
      empty={{
        icon: FileText,
        title: "No invoices yet",
        description: "When you send goods to a customer, create an invoice here. You can download the PDF and email it to them.",
        action: <Button><Plus className="h-5 w-5 mr-2" /> Create your first invoice</Button>,
      }}
    />
  );
}
