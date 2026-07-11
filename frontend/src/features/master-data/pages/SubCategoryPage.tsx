import { useQuery } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { Label } from "#/components/ui/label";
import { ReferenceDataPage, type RefColumn, type RefField } from "#/features/master-data/ReferenceDataPage";
import type { PagedResult } from "#/features/common/CrudPage";

function genCode(): string { return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); }

const columns: RefColumn[] = [
  { key: "code", label: "Code", className: "font-mono w-[120px]", render: (v) => String(v).slice(0, 8) },
  { key: "name", label: "Name" },
  { key: "categoryName", label: "Category" },
];

const fields: RefField[] = [
  { key: "name", label: "Name", required: true, placeholder: "Sub category name" },
];

function CategorySelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const q = useQuery({
    queryKey: ["master/categories", "picker"],
    queryFn: () => api.get("master/categories", { searchParams: { page: 1, pageSize: 500 } }).json<PagedResult<{ id: string; name: string }>>(),
  });

  return (
    <div className="space-y-1">
      <Label htmlFor="subcat-category">Category</Label>
      <select
        id="subcat-category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:border-ring"
        required
      >
        <option value="">Select category…</option>
        {(q.data?.items ?? []).map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

export function SubCategoryPage() {
  return (
    <ReferenceDataPage
      title="Sub Product Categories"
      apiPath="master/sub-categories"
      columns={columns}
      fields={fields}
      rowFormKeys={["categoryId"]}
      extraFields={(form, set) => (
        <CategorySelect value={form.categoryId ?? ""} onChange={(id) => set("categoryId", id)} />
      )}
      transformDto={(dto) => ({ ...dto, code: genCode() })}
    />
  );
}
