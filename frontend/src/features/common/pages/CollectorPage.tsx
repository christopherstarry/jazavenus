import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Collector code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Collector name" },
];

export function CollectorPage() {
  return <ReferenceDataPage title="Collectors" apiPath="master/collectors" columns={columns} fields={fields} />;
}
