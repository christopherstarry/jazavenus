import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

function genCode(): string { return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); }

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]", render: (v) => String(v).slice(0, 8) },
  { key: "name", label: "Name" },
  { key: "netDays", label: "Net Days", className: "w-[100px] text-right" },
];

const fields: RefField[] = [
  { key: "name", label: "Name", required: true, placeholder: "e.g. Net 30" },
  { key: "netDays", label: "Net Days", type: "number", placeholder: "30" },
];

export function PaymentTermPage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Payment Terms" apiPath="master/payment-terms" columns={columns} fields={fields} transformDto={(dto) => ({ ...dto, code: genCode() })} canDelete={canDelete} />;
}
