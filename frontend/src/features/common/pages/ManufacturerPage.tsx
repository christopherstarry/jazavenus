import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Manufacturer code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Manufacturer name" },
];

export function ManufacturerPage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Manufacturers" apiPath="master/manufacturers" columns={columns} fields={fields}  canDelete={canDelete} />;
}
