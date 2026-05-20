import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
  { key: "address", label: "Address", className: "hidden md:table-cell" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Warehouse code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Warehouse name" },
  { key: "address", label: "Address", placeholder: "Address (optional)" },
];

export function WarehousePage() {
  return <ReferenceDataPage title="Warehouses" apiPath="master/warehouses" columns={columns} fields={fields} />;
}
