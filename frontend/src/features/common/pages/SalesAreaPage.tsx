import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Area code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Area name" },
];

export function SalesAreaPage() {
  return <ReferenceDataPage title="Sales Areas" apiPath="master/areas" columns={columns} fields={fields} />;
}
