import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/master-data/ReferenceDataPage";

function genCode(): string { return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); }

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]", render: (v) => String(v).slice(0, 8) },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "name", label: "Name", required: true, placeholder: "Name" },
];

export function SalesmanPage() {
  return <ReferenceDataPage title="Salesmen" apiPath="master/salesmen" columns={columns} fields={fields} transformDto={(dto) => ({ ...dto, code: genCode() })} />;
}