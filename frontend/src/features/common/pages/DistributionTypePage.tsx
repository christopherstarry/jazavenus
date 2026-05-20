import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Type code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Type name" },
];

export function DistributionTypePage() {
  return <ReferenceDataPage title="Distribution Types" apiPath="master/distribution-types" columns={columns} fields={fields} />;
}
