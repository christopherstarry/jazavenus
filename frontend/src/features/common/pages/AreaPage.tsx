import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

function genCode(): string { return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); }

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]", render: (v) => String(v).slice(0, 8) },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "name", label: "Name", required: true, placeholder: "Name" },
];

export function AreaPage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Areas" apiPath="master/areas" columns={columns} fields={fields} transformDto={(dto) => ({ ...dto, code: genCode() })} canDelete={canDelete} />;
}