import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Name" },
];

export function LocationOutletPage() {
  return <ReferenceDataPage title="Distribution Types" apiPath="master/distribution-types" columns={columns} fields={fields} />;
}
