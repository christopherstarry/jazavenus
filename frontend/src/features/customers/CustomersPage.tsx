import { CrudPage } from "#/features/common/CrudPage";
import { formatNumber } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Plus, Users } from "lucide-react";

interface Row {
  id: string; code: string; name: string; email: string | null; phone: string | null;
  city: string | null; creditLimit: number; isActive: boolean;
}

export function CustomersPage() {
  return (
    <CrudPage<Row>
      title="Master Customer"
      description="Companies you sell to. Their credit limit decides how much they can owe you at one time."
      endpoint="master/customers"
      searchPlaceholder="Search by code, name, or city…"
      columns={[
        { key: "code",  label: "Code" },
        { key: "name",  label: "Customer name" },
        { key: "email", label: "Email", render: (r) => r.email ?? <span className="text-muted-foreground">—</span> },
        { key: "phone", label: "Phone", render: (r) => r.phone ?? <span className="text-muted-foreground">—</span> },
        { key: "city",  label: "City",  render: (r) => r.city ?? <span className="text-muted-foreground">—</span> },
        { key: "creditLimit", label: "Credit limit", align: "right", render: (r) => formatNumber(r.creditLimit) },
        { key: "isActive", label: "Status", render: (r) => r.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge> },
      ]}
      rightSlot={<Button><Plus className="h-5 w-5 mr-2" /> Add customer</Button>}
      empty={{
        icon: Users,
        title: "No customers yet",
        description: "Add the companies you sell to. You'll need at least one before you can issue an invoice.",
        action: <Button><Plus className="h-5 w-5 mr-2" /> Add your first customer</Button>,
      }}
    />
  );
}
