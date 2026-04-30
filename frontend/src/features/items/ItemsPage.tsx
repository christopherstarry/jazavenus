import { CrudPage } from "#/features/common/CrudPage";
import { formatNumber } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Download, Plus, Boxes } from "lucide-react";

interface ItemRow {
  id: string; sku: string; name: string; barcode: string | null;
  categoryName: string | null; unitCode: string | null;
  standardCost: number | null; standardPrice: number;
  currency: string; isActive: boolean;
}

export function ItemsPage() {
  return (
    <CrudPage<ItemRow>
      title="Master Product"
      description="Every product you sell or store. Each item has a unique code (SKU)."
      endpoint="master/items"
      searchPlaceholder="Search by SKU, name, or barcode…"
      columns={[
        { key: "sku",          label: "SKU" },
        { key: "name",         label: "Name" },
        { key: "categoryName", label: "Category", render: (r) => r.categoryName ?? <span className="text-muted-foreground">—</span> },
        { key: "unitCode",     label: "Unit" },
        { key: "standardPrice", label: "Selling price", align: "right", render: (r) => `${r.currency} ${formatNumber(r.standardPrice)}` },
        { key: "standardCost",  label: "Cost",          align: "right", render: (r) => r.standardCost === null ? <span className="text-muted-foreground">—</span> : `${r.currency} ${formatNumber(r.standardCost)}` },
        { key: "isActive",     label: "Status", render: (r) => r.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge> },
      ]}
      rightSlot={
        <>
          <a href="/api/io/items.xlsx">
            <Button variant="outline"><Download className="h-5 w-5 mr-2" /> Export to Excel</Button>
          </a>
          <Button><Plus className="h-5 w-5 mr-2" /> Add item</Button>
        </>
      }
      empty={{
        icon: Boxes,
        title: "No products yet",
        description: "Products are the items you store and sell. Add your first one to get started, or import a list from Excel.",
        action: (
          <div className="flex gap-3">
            <Button><Plus className="h-5 w-5 mr-2" /> Add your first product</Button>
            <Button variant="outline"><Download className="h-5 w-5 mr-2" /> Import from Excel</Button>
          </div>
        ),
      }}
    />
  );
}
