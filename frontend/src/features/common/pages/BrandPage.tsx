import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Brand code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Brand name" },
];

export function BrandPage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Brands" apiPath="master/brands" columns={columns} fields={fields}  canDelete={canDelete} />;
}
