import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/common/ReferenceDataPage";

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]" },
  { key: "name", label: "Name" },
  { key: "markupPercent", label: "Markup %", className: "w-[100px] text-right" },
];

const fields: RefField[] = [
  { key: "code", label: "Code", required: true, placeholder: "Price tier code", className: "max-w-[10rem]" },
  { key: "name", label: "Name", required: true, placeholder: "Price tier name" },
  { key: "markupPercent", label: "Markup %", type: "number", placeholder: "0" },
];

export function PriceTierPage() {
  return <ReferenceDataPage title="Price Tiers" apiPath="master/price-tiers" columns={columns} fields={fields} />;
}
