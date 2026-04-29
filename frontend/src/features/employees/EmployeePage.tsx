import { useState, type ComponentType, type KeyboardEvent } from "react";
import {
  Trash2,
  Save,
  Check,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  FolderPlus,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeLookupDialog } from "./EmployeeLookupDialog";

/**
 * Temporary label until Preferences / tenant context supplies the division name.
 * Matches the user's legacy VB screen.
 */
const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";
const DEBUG_COMPANY_ACCESS_PASSWORD = "asd";
const COMPANY_ACCESS_POC = [
  { companyId: "DISTRIBUTIONDEDG", companyName: "JAZA VENUS DISTRIBUTION BANDUNG" },
  { companyId: "TRADINGDEDG", companyName: "JAZA VENUS TRADING BANDUNG" },
  { companyId: "CVMANUNGGAL", companyName: "CV JAZA MANUNGGAL ABADI" },
  { companyId: "DISTRIBUTIONCRB", companyName: "JAZA VENUS DISTRIBUTION CIREBON" },
  { companyId: "TRADINGCRB", companyName: "JAZA VENUS TRADING CIREBON" },
] as const;
const MODULE_ACCESS_POC = [
  { moduleName: "Adjustment Transaction", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct Purchase Price Log Item Cost", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct PO From Locked", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct Purchase Order From Sales", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct Purchase Invoice To Item Cost", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct Sales Confirmation HPP", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct Sales Return", read: true, add: true, del: true, update: true },
  { moduleName: "Auto Correct Sales Order", read: true, add: true, del: true, update: true },
] as const;

/** UI-only Employee master screen — parity with Distribution And Trading Employee form. */

export function EmployeePage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [fax, setFax] = useState("");
  const [email, setEmail] = useState("");

  const [locked, setLocked] = useState(false);
  const [admin, setAdmin] = useState(false);

  const [lookupOpen, setLookupOpen] = useState(false);
  const [companyAccessById, setCompanyAccessById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMPANY_ACCESS_POC.map((company) => [company.companyId, true])),
  );
  const [moduleAccessByName, setModuleAccessByName] = useState<
    Record<string, { read: boolean; add: boolean; del: boolean; update: boolean }>
  >(() =>
    Object.fromEntries(
      MODULE_ACCESS_POC.map((row) => [
        row.moduleName,
        { read: row.read, add: row.add, del: row.del, update: row.update },
      ]),
    ),
  );
  const [moduleQuickAction, setModuleQuickAction] = useState("all-on");

  const canShowCompanyAccess = password === DEBUG_COMPANY_ACCESS_PASSWORD;
  const setAllModulePermissions = (next: { read: boolean; add: boolean; del: boolean; update: boolean }) => {
    setModuleAccessByName((prev) =>
      Object.fromEntries(
        Object.keys(prev).map((name) => [
          name,
          { read: next.read, add: next.add, del: next.del, update: next.update },
        ]),
      ),
    );
  };

  const setModulePermissionColumn = (
    key: "read" | "add" | "del" | "update",
    value: boolean,
  ) => {
    setModuleAccessByName((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([name, access]) => [
          name,
          { ...access, [key]: value },
        ]),
      ),
    );
  };

  const applyModuleQuickAction = () => {
    switch (moduleQuickAction) {
      case "all-on":
        setAllModulePermissions({ read: true, add: true, del: true, update: true });
        return;
      case "all-off":
        setAllModulePermissions({ read: false, add: false, del: false, update: false });
        return;
      case "read-on":
        setModulePermissionColumn("read", true);
        return;
      case "read-off":
        setModulePermissionColumn("read", false);
        return;
      case "add-on":
        setModulePermissionColumn("add", true);
        return;
      case "add-off":
        setModulePermissionColumn("add", false);
        return;
      case "del-on":
        setModulePermissionColumn("del", true);
        return;
      case "del-off":
        setModulePermissionColumn("del", false);
        return;
      case "update-on":
        setModulePermissionColumn("update", true);
        return;
      case "update-off":
        setModulePermissionColumn("update", false);
        return;
      default:
        return;
    }
  };

  const openEmployeeLookup = () => {
    setLookupOpen(true);
  };

  /** Legacy flow: after Employee Code + Password are filled, press Enter → lookup list. */
  const onCodeOrPasswordEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!employeeCode.trim() || !password.trim()) return;
    openEmployeeLookup();
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl">
      {/* Toolbar — mirrors New / Del / Save / Execute + record navigation */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button type="button" variant="outline" size="sm" className="min-w-[7rem]" disabled aria-disabled>
          <FolderPlus className="h-4 w-4" />
          New
        </Button>
        <Button type="button" variant="outline" size="sm" className="min-w-[7rem]" disabled aria-disabled>
          <Trash2 className="h-4 w-4" />
          Del
        </Button>
        <Button type="button" variant="outline" size="sm" className="min-w-[7rem]" disabled aria-disabled>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button type="button" size="sm" className="min-w-[7rem] bg-emerald-600 hover:bg-emerald-700 text-white" disabled aria-disabled>
          <Check className="h-4 w-4" />
          Execute
        </Button>

        <div className="hidden sm:flex items-center gap-1 ml-auto text-sm text-muted-foreground whitespace-nowrap">
          <span className="mr-2 font-semibold">Navigation:</span>
          <ToolbarIconButton label="First record" Icon={ChevronsLeft} />
          <ToolbarIconButton label="Previous record" Icon={ChevronLeft} />
          <ToolbarIconButton label="Next record" Icon={ChevronRight} />
          <ToolbarIconButton label="Last record" Icon={ChevronsRight} />
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex flex-wrap gap-2 sm:hidden items-center text-sm text-muted-foreground">
        <span className="font-semibold w-full">Navigation</span>
        <ToolbarIconButton label="First" Icon={ChevronsLeft} />
        <ToolbarIconButton label="Previous" Icon={ChevronLeft} />
        <ToolbarIconButton label="Next" Icon={ChevronRight} />
        <ToolbarIconButton label="Last" Icon={ChevronsRight} />
      </div>

      {/* Division context — prominent like the legacy banner */}
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <Card>
        <CardHeader className="pb-3 pt-5">
          <h2 className="text-xl font-bold tracking-tight">:: Employee</h2>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="main" className="w-full space-y-4">
            {/* Tabs strip — legacy had these under the fields; placing under title keeps viewport compact */}
            <TabsList className="w-full justify-start gap-1 flex-wrap h-auto p-1 bg-muted/50">
              <TabsTrigger value="main" className="text-sm sm:text-base px-4 py-3">Main Information</TabsTrigger>
              <TabsTrigger value="company" className="text-sm sm:text-base px-4 py-3">Company Access</TabsTrigger>
              <TabsTrigger value="module" className="text-sm sm:text-base px-4 py-3">Module Access</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="mt-0 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
              <fieldset className="space-y-3 sm:space-y-3.5 border-2 border-border rounded-[var(--radius)] p-3 sm:p-4">
                <legend className="sr-only">Main Information</legend>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-2 lg:gap-x-6">
                  {/* Row: code + lookup */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="emp-code" required>Employee Code</Label>
                    <div className="flex gap-2 max-w-xl">
                      <Input
                        id="emp-code"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        onKeyDown={onCodeOrPasswordEnter}
                        placeholder="Employee code"
                        autoComplete="off"
                        aria-describedby="emp-code-help"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Open employee list"
                        onClick={openEmployeeLookup}
                        className="shrink-0 h-12 w-12"
                      >
                        <MoreHorizontal className="h-5 w-5" aria-hidden />
                        <span className="sr-only">Lookup list</span>
                      </Button>
                    </div>
                    <p id="emp-code-help" className="text-sm text-muted-foreground">
                      Enter code and password, then press Enter — or use the list button. Pick a row and OK.
                    </p>
                  </div>

                  <div className="space-y-2 lg:col-span-1">
                    <Label htmlFor="emp-name" required>Employee Name</Label>
                    <Input
                      id="emp-name"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="Full name"
                      autoComplete="name"
                      className="max-w-xl"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-1">
                    <Label htmlFor="emp-pw">Password</Label>
                    <div className="flex gap-2 max-w-xl">
                      <Input
                        id="emp-pw"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={onCodeOrPasswordEnter}
                        autoComplete="new-password"
                        placeholder="Leave blank if not changing"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-12"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Address block — tighter than single column stacking */}
                <div className="grid gap-3 lg:grid-cols-12">
                  <div className="space-y-2 lg:col-span-12">
                    <Label htmlFor="emp-addr">Address</Label>
                    <Input id="emp-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="emp-city">City</Label>
                    <Input id="emp-city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="emp-state">State</Label>
                    <Input id="emp-state" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="emp-zip">Zip Code</Label>
                    <Input id="emp-zip" value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" className="max-w-xs lg:max-w-none" />
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="emp-p1">Phone 1</Label>
                    <Input id="emp-p1" value={phone1} onChange={(e) => setPhone1(e.target.value)} inputMode="tel" />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="emp-p2">Phone 2</Label>
                    <Input id="emp-p2" value={phone2} onChange={(e) => setPhone2(e.target.value)} inputMode="tel" />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="emp-fax">Fax</Label>
                    <Input id="emp-fax" value={fax} onChange={(e) => setFax(e.target.value)} inputMode="tel" />
                  </div>

                  <div className="space-y-2 lg:col-span-8">
                    <Label htmlFor="emp-email">Email</Label>
                    <Input id="emp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2 border-t-2 border-dashed border-border">
                  <label className="inline-flex items-center gap-3 cursor-pointer touch-manipulation min-h-[3rem]">
                    <input
                      type="checkbox"
                      checked={locked}
                      onChange={(e) => setLocked(e.target.checked)}
                      className="h-5 w-5 rounded border-2 border-input accent-primary shrink-0"
                    />
                    <span className="text-base font-semibold">Locked</span>
                  </label>
                  <label className="inline-flex items-center gap-3 cursor-pointer touch-manipulation min-h-[3rem]">
                    <input
                      type="checkbox"
                      checked={admin}
                      onChange={(e) => setAdmin(e.target.checked)}
                      className="h-5 w-5 rounded border-2 border-input accent-primary shrink-0"
                    />
                    <span className="text-base font-semibold">Admin</span>
                  </label>
                </div>
              </fieldset>
            </TabsContent>

            <TabsContent value="company" className="mt-0 rounded-md border-2 border-border p-4 space-y-4">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="company-emp-code">Employee Code</Label>
                  <Input
                    id="company-emp-code"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="Employee code"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-emp-name">Employee Name</Label>
                  <Input
                    id="company-emp-name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Employee name"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-emp-pw">Password</Label>
                  <Input
                    id="company-emp-pw"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter "asd" to unlock list'
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {canShowCompanyAccess ? (
                <div className="space-y-4 text-left">
                  <div className="overflow-x-auto rounded-md border-2 border-border">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Company ID</th>
                          <th className="px-3 py-2 text-left font-semibold">Company Name</th>
                          <th className="px-3 py-2 text-center font-semibold w-24">Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPANY_ACCESS_POC.map((company) => (
                          <tr key={company.companyId} className="border-t border-border">
                            <td className="px-3 py-2 font-medium">{company.companyId}</td>
                            <td className="px-3 py-2">{company.companyName}</td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={companyAccessById[company.companyId] ?? false}
                                onChange={(e) =>
                                  setCompanyAccessById((prev) => ({
                                    ...prev,
                                    [company.companyId]: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 rounded border-2 border-input accent-primary"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setCompanyAccessById((prev) =>
                          Object.fromEntries(Object.keys(prev).map((id) => [id, true])),
                        )
                      }
                    >
                      Select All Companies
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setCompanyAccessById((prev) =>
                          Object.fromEntries(Object.keys(prev).map((id) => [id, false])),
                        )
                      }
                    >
                      Un Select All Companies
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Company list is hidden. Enter password <span className="font-semibold text-foreground">asd</span> to show it.
                </p>
              )}
            </TabsContent>

            <TabsContent value="module" className="mt-0 rounded-md border-2 border-border p-4 space-y-4">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="module-emp-code">Employee Code</Label>
                  <Input
                    id="module-emp-code"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="Employee code"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-emp-name">Employee Name</Label>
                  <Input
                    id="module-emp-name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Employee name"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-emp-pw">Password</Label>
                  <Input
                    id="module-emp-pw"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter "asd" to unlock list'
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {canShowCompanyAccess ? (
                <div className="space-y-3">
                  <div className="rounded-md border bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor="module-quick-action" className="text-sm font-semibold">
                        Quick action
                      </Label>
                      <select
                        id="module-quick-action"
                        value={moduleQuickAction}
                        onChange={(e) => setModuleQuickAction(e.target.value)}
                        className="h-10 min-w-[16rem] rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="all-on">Select all module access</option>
                        <option value="all-off">Clear all module access</option>
                        <option value="read-on">Select all Read access</option>
                        <option value="read-off">Clear all Read access</option>
                        <option value="add-on">Select all Add access</option>
                        <option value="add-off">Clear all Add access</option>
                        <option value="del-on">Select all Del access</option>
                        <option value="del-off">Clear all Del access</option>
                        <option value="update-on">Select all Update access</option>
                        <option value="update-off">Clear all Update access</option>
                      </select>
                      <Button type="button" variant="outline" size="sm" className="h-10 px-4" onClick={applyModuleQuickAction}>
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-md border-2 border-border">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Module Name</th>
                          <th className="px-3 py-2 text-center font-semibold w-24">Read Access</th>
                          <th className="px-3 py-2 text-center font-semibold w-24">Add Access</th>
                          <th className="px-3 py-2 text-center font-semibold w-24">Del Access</th>
                          <th className="px-3 py-2 text-center font-semibold w-28">Update Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODULE_ACCESS_POC.map((row) => {
                          const access = moduleAccessByName[row.moduleName] ?? {
                            read: false,
                            add: false,
                            del: false,
                            update: false,
                          };
                          return (
                            <tr key={row.moduleName} className="border-t border-border">
                              <td className="px-3 py-2">{row.moduleName}</td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={access.read}
                                  onChange={(e) =>
                                    setModuleAccessByName((prev) => ({
                                      ...prev,
                                      [row.moduleName]: { ...access, read: e.target.checked },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-2 border-input accent-primary"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={access.add}
                                  onChange={(e) =>
                                    setModuleAccessByName((prev) => ({
                                      ...prev,
                                      [row.moduleName]: { ...access, add: e.target.checked },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-2 border-input accent-primary"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={access.del}
                                  onChange={(e) =>
                                    setModuleAccessByName((prev) => ({
                                      ...prev,
                                      [row.moduleName]: { ...access, del: e.target.checked },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-2 border-input accent-primary"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={access.update}
                                  onChange={(e) =>
                                    setModuleAccessByName((prev) => ({
                                      ...prev,
                                      [row.moduleName]: { ...access, update: e.target.checked },
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-2 border-input accent-primary"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Module list is hidden. Enter password <span className="font-semibold text-foreground">asd</span> to show it.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EmployeeLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        initialHint={employeeName}
        onSelect={(row) => {
          setEmployeeCode(row.employeeCode);
          setEmployeeName(row.employeeName);
        }}
      />
    </div>
  );
}

function ToolbarIconButton({
  Icon,
  label,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button type="button" variant="outline" size="icon" aria-label={label} title={label} disabled className="h-11 w-11 sm:h-12 sm:w-12">
      <Icon className="h-5 w-5" aria-hidden />
    </Button>
  );
}
