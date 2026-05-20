import { useAuth } from "#/lib/auth";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Reg No", className: "font-mono w-[100px]" },
  { key: "name", label: "Name" },
];

const fields: RefField[] = [
  { key: "code", label: "Registration No", required: true, placeholder: "e.g. 1", className: "max-w-[10rem]" },
  { key: "name", label: "Description", required: true, placeholder: "Description" },
];

export function TaxRegistrationPage() {
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  return <ReferenceDataPage title="Tax Registrations" apiPath="master/tax-registrations" columns={columns} fields={fields} emptyMessage="No tax registrations found."  canDelete={canDelete} />;
}
