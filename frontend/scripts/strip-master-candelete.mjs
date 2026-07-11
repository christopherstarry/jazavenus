import fs from "fs";
import path from "path";

const dir = path.resolve("src/features/master-data/pages");
const skip = new Set(["CustomerPage.tsx", "SupplierPage.tsx", "ItemPage.tsx", "SubCategoryPage.tsx"]);

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx") || skip.has(f)) continue;
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  if (!s.includes("canDelete={canDelete}") && !s.includes('canDelete={canDelete}')) continue;
  s = s.replace(/import \{ useAuth \} from "#\/lib\/auth";\r?\n/, "");
  s = s.replace(/\s*const \{ user \} = useAuth\(\);\r?\n\s*const canDelete = user\?\.isDeveloper \|\| user\?\.roles\.includes\("SuperAdmin"\);\r?\n/, "\n");
  s = s.replace(/ canDelete=\{canDelete\}/g, "");
  fs.writeFileSync(p, s);
  console.log("updated", f);
}
