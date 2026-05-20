import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
  { key: "discountPercent", label: "Discount %", className: "w-[100px] text-right" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Discount code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Discount name" },
  { key: "discountPercent", label: "Discount %", type: "number", placeholder: "0" },
];

export function DiscountCodePage() {
  return <ReferenceDataPage title="Discount Codes" apiPath="master/discount-codes" columns={columns} fields={fields} />;
}
