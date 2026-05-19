import { useMemo } from "react";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "#/components/ui/dialog";
import { Badge } from "#/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";

interface AuditLogDto {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  notes: string;
  occurredAtUtc: string;
  ipAddress: string | null;
  beforeJson: string | null;
  afterJson: string | null;
}

interface Props {
  log: AuditLogDto;
  open: boolean;
  onClose: () => void;
}

interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

function parseChanges(before: string | null, after: string | null): FieldChange[] {
  try {
    const beforeObj = before ? JSON.parse(before) : {};
    const afterObj = after ? JSON.parse(after) : {};

    const EXCLUDE_FIELDS = new Set([
      "id", "rowVersion", "isDeleted", "createdAtUtc", "updatedAtUtc",
      "createdByUserId", "updatedByUserId", "deletedAtUtc", "deletedByUserId",
    ]);

    const changes: FieldChange[] = [];
    const allKeys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);

    for (const key of allKeys) {
      if (EXCLUDE_FIELDS.has(key)) continue;
      const oldVal = beforeObj[key];
      const newVal = afterObj[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal === null || oldVal === undefined ? "" : String(oldVal),
          newValue: newVal === null || newVal === undefined ? "" : String(newVal),
        });
      }
    }
    return changes;
  } catch {
    return [];
  }
}

function fieldDisplayName(field: string): string {
  const names: Record<string, string> = {
    code: "Code",
    name: "Name",
    description: "Description",
    fullName: "Full Name",
    email: "Email",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
    phone1: "Phone 1",
    phone2: "Phone 2",
    fax: "Fax",
    contactPerson: "Contact",
    npwpNumber: "NPWP",
    pkpNumber: "PKP",
    creditLimit: "Credit Limit",
    balance: "Balance",
    price: "Price",
    discount: "Discount",
    quantity: "Quantity",
    totalAmount: "Total",
    vatAmount: "VAT",
    isActive: "Active",
    isLocked: "Locked",
    isSalable: "Salable",
    isPurchasable: "Purchasable",
    itemFunction: "Function",
    reorderQty: "Reorder Qty",
    minLevel: "Min Level",
    maxLevel: "Max Level",
    uom: "UOM",
    barcode: "Barcode",
    alias: "Alias",
    manufacturerId: "Manufacturer",
    brandId: "Brand",
    categoryId: "Category",
    subCategoryId: "Sub Category",
    classCode: "Class",
    salesmanCode: "Salesman",
    collectorCode: "Collector",
    areaCode: "Area",
    outletType: "Outlet Type",
    tradeType: "Trade Type",
    distributionType: "Distribution",
    paymentTerm: "Payment Term",
    priceTier: "Price Tier",
    warehouseCode: "Warehouse",
    notes: "Notes",
    target: "Target",
    amount: "Amount",
    dueDays: "Due Days",
    factor: "Factor",
    skuCode: "SKU Code",
    registrationNo: "Reg No",
    registerDate: "Reg Date",
    fromNo: "From No",
    toNo: "To No",
    noCounted: "Allocated",
    noUsed: "Used",
    roleId: "Role",
    hasCustomPermissions: "Custom Permissions",
    isDeveloper: "Developer",
  };
  return names[field] ?? field;
}

function formatValue(val: string): string {
  if (val === "true") return "Yes";
  if (val === "false") return "No";
  if (val === "") return "—";
  return val;
}

const ENTITY_DISPLAY: Record<string, string> = {
  customer: "Customer",
  customer_address: "Customer Address",
  product: "Product",
  product_price: "Product Price",
  product_discount: "Product Discount",
  brand: "Brand",
  supplier: "Supplier",
  salesman: "Salesman",
  collector: "Collector",
  area: "Area",
  warehouse: "Warehouse",
  warehouse_type: "Warehouse Type",
  bank: "Bank",
  payment_term: "Payment Term",
  outlet_type: "Outlet Type",
  outlet_group: "Outlet Group",
  outlet_group_type: "Outlet Group Type",
  trade_type: "Trade Type",
  sub_trade_type: "Sub Trade Type",
  distribution_type: "Distribution Type",
  price_tier: "Price Tier",
  discount_code: "Discount Code",
  unit_of_measure: "UOM",
  tax_registration: "Tax Registration",
  user: "User",
  role: "Role",
};

export function AuditLogDetailDialog({ log, open, onClose }: Props) {
  const changes = useMemo(
    () => (log.action === "Update" ? parseChanges(log.beforeJson, log.afterJson) : []),
    [log],
  );

  const actionLabel = log.action === "Create" ? "➕ Created" : log.action === "Update" ? "✏️ Updated" : "🗑️ Deleted";
  const actionColor = log.action === "Create" ? "text-green-600" : log.action === "Update" ? "text-amber-600" : "text-red-600";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className={actionColor}>{actionLabel}</span>
            <Badge tone="neutral">{ENTITY_DISPLAY[log.entity] ?? log.entity}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-4">
            <div>
              <span className="text-muted-foreground">Who:</span>
              <span className="ml-2 font-medium">{log.userName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Code:</span>
              <span className="ml-2 font-mono font-medium">{log.notes || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">When:</span>
              <span className="ml-2 font-medium">
                {new Date(log.occurredAtUtc).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">IP:</span>
              <span className="ml-2 font-mono">{log.ipAddress || "—"}</span>
            </div>
          </div>

          {/* Changed fields (only for Update) */}
          {log.action === "Update" && changes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Changed Fields ({changes.length})</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changes.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium whitespace-nowrap">{fieldDisplayName(c.field)}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate" title={c.oldValue}>
                          {formatValue(c.oldValue)}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate text-amber-700" title={c.newValue}>
                          {formatValue(c.newValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {log.action === "Update" && changes.length === 0 && (
            <p className="text-sm text-muted-foreground">No field-level changes captured for this event.</p>
          )}

          {/* Create — show afterJson summary */}
          {log.action === "Create" && log.afterJson && (
            <div className="text-sm text-muted-foreground">
              <p>Record was created with the details shown. View the record page to see full information.</p>
            </div>
          )}

          {/* Delete — show beforeJson summary */}
          {log.action === "Delete" && log.beforeJson && (
            <div className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
              This record was permanently deleted. The information above shows the last known state before deletion.
            </div>
          )}
          {log.action === "Delete" && !log.beforeJson && (
            <div className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
              This record was permanently deleted.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
