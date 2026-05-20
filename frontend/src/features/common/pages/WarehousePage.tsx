import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

function genCode(): string { return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); }

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]", render: (v) => String(v).slice(0, 8) },
  { key: "name", label: "Name" },
  { key: "address", label: "Address", className: "hidden md:table-cell" },
];

const fields: RefField[] = [
  { key: "name", label: "Name", required: true, placeholder: "Warehouse name" },
  { key: "address", label: "Address", placeholder: "Address (optional)" },
];

export function WarehousePage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Warehouses" apiPath="master/warehouses" columns={columns} fields={fields} transformDto={(dto) => ({ ...dto, code: genCode() })} canDelete={canDelete} />;
}