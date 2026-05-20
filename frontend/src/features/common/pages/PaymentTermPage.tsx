import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[100px]" },
  { key: "name", label: "Name" },
  { key: "netDays", label: "Net Days", className: "w-[100px] text-right" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "e.g. 030", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "e.g. Net 30" },
  { key: "netDays", label: "Net Days", type: "number", placeholder: "30" },
];

export function PaymentTermPage() {
  return <ReferenceDataPage title="Payment Terms" apiPath="master/payment-terms" columns={columns} fields={fields} />;
}
