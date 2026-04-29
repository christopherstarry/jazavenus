import { CrudPage } from "@/features/common/CrudPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, PackageSearch } from "lucide-react";

interface Row { id: string; code: string; name: string; email: string | null; phone: string | null; city: string | null; isActive: boolean; }

export function SuppliersPage() {
  return (
    <CrudPage<Row>
      title="Suppliers"
      description="Companies you buy goods from. Add a supplier before you can record an incoming shipment."
      endpoint="master/suppliers"
      searchPlaceholder="Search by code, name, or city…"
      columns={[
        { key: "code",  label: "Code" },
        { key: "name",  label: "Supplier name" },
        { key: "email", label: "Email", render: (r) => r.email ?? <span className="text-muted-foreground">—</span> },
        { key: "phone", label: "Phone", render: (r) => r.phone ?? <span className="text-muted-foreground">—</span> },
        { key: "city",  label: "City",  render: (r) => r.city ?? <span className="text-muted-foreground">—</span> },
        { key: "isActive", label: "Status", render: (r) => r.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge> },
      ]}
      rightSlot={<Button><Plus className="h-5 w-5 mr-2" /> Add supplier</Button>}
      empty={{
        icon: PackageSearch,
        title: "No suppliers yet",
        description: "Add the companies you buy from. You'll need at least one to record incoming shipments.",
        action: <Button><Plus className="h-5 w-5 mr-2" /> Add your first supplier</Button>,
      }}
    />
  );
}
