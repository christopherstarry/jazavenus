import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/master-data/ReferenceDataPage";

function genCode(): string { return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); }

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]", render: (v) => String(v).slice(0, 8) },
  { key: "name", label: "Name" },
  { key: "discountPercent", label: "Discount %", className: "w-[100px] text-right" },
];

const fields: RefField[] = [
  { key: "name", label: "Name", required: true, placeholder: "Discount name" },
  { key: "discountPercent", label: "Discount %", type: "number", placeholder: "0" },
];

export function DiscountCodePage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Discount Codes" apiPath="master/discount-codes" columns={columns} fields={fields} transformDto={(dto) => ({ ...dto, code: genCode() })} canDelete={canDelete} />;
}
