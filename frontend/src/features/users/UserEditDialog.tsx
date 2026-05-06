import { useState, useEffect } from "react";
import { api } from "#/lib/api";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "#/components/ui/dialog";
import type { CurrentUser } from "#/lib/auth";

interface ModulePermissionDto {
  module: string;
  canEdit: boolean;
  canDelete: boolean;
}

interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  roleId: number;
  role: string;
  hasCustomPermissions: boolean;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAtUtc: string;
  lastLoginAtUtc: string | null;
  modules: ModulePermissionDto[];
  reports: string[];
}

const ALL_MODULES = [
  { key: "master", label: "Master" },
  { key: "purchase", label: "Purchase" },
  { key: "sales", label: "Sales" },
  { key: "ar", label: "AR" },
  { key: "inventory", label: "Inventory" },
];

const ALL_REPORTS = [
  { key: "ar", label: "AR Report" },
  { key: "sales", label: "Sales Report" },
  { key: "inventory", label: "Inventory Report" },
  { key: "purchase", label: "Purchase Report" },
];

interface Props {
  user: UserDetail;
  currentUser: CurrentUser | null;
  open: boolean;
  onClose: () => void;
}

export function UserEditDialog({ user, currentUser, open, onClose }: Props) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [roleId, setRoleId] = useState(user.roleId);
  const [hasCustom, setHasCustom] = useState(user.hasCustomPermissions);
  const [modules, setModules] = useState<ModulePermissionDto[]>(() =>
    ALL_MODULES.map((m) => {
      const existing = user.modules.find((x) => x.module === m.key);
      return { module: m.key, canEdit: existing?.canEdit ?? false, canDelete: existing?.canDelete ?? false };
    }));
  const [reports, setReports] = useState<string[]>(user.reports ?? []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(user.fullName);
    setEmail(user.email);
    setRoleId(user.roleId);
    setHasCustom(user.hasCustomPermissions);
    setModules(
      ALL_MODULES.map((m) => {
        const existing = user.modules.find((x) => x.module === m.key);
        return { module: m.key, canEdit: existing?.canEdit ?? false, canDelete: existing?.canDelete ?? false };
      })
    );
    setReports(user.reports ?? []);
    setSaveError(null);
  }, [user]);

  const isDev = currentUser?.isDeveloper;
  const canEditDev = isDev;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await api.put(`users/${user.id}`, {
        json: { fullName, email, roleId, hasCustomPermissions: hasCustom, isActive: true },
      }).json();
      if (canEditDev || user.role !== "Developer") {
        await api.put(`users/${user.id}/permissions`, {
          json: { hasCustomPermissions: hasCustom, modules: hasCustom ? modules.filter((m) => m.canEdit || m.canDelete) : [], reports: hasCustom ? reports : [] },
        }).json();
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.json ? (await err.response.json()).detail ?? err.message : err.message;
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const canEditUser = canEditDev || user.role !== "Developer";

  const roleOptions = canEditDev
    ? ["Sales", "Admin", "SuperAdmin", "Developer"]
    : ["Sales", "Admin"];

  const activeModules = modules.filter((m) => m.canEdit || m.canDelete);
  const activeModulesSet = new Set(activeModules.map((m) => m.module));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!canEditUser} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!canEditUser} />
            </div>
          </div>
          <div>
            <Label>Role</Label>
            <select
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              value={roleId}
              disabled={!canEditUser}
              onChange={(e) => setRoleId(Number(e.target.value))}
            >
              {roleOptions.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasCustom}
              disabled={!canEditUser}
              onChange={(e) => setHasCustom(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">Custom Permissions</span>
          </label>

          {hasCustom && (
            <>
              <div>
                <Label className="mb-2 block">Module Access</Label>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left px-3 py-2">Module</th>
                      <th className="text-center px-3 py-2 w-16">Access</th>
                      <th className="text-center px-3 py-2 w-16">Edit</th>
                      <th className="text-center px-3 py-2 w-16">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((m, i) => (
                      <tr key={m.module} className="border-t">
                        <td className="px-3 py-2">{ALL_MODULES.find((x) => x.key === m.module)?.label}</td>
                        <td className="text-center px-3 py-2">
                          <input
                            type="checkbox"
                            checked={activeModulesSet.has(m.module)}
                            disabled={!canEditUser}
                            onChange={(e) => {
                              const copy = [...modules];
                              if (e.target.checked) {
                                copy[i] = { ...copy[i], canEdit: false, canDelete: false };
                              } else {
                                copy[i] = { ...copy[i], canEdit: false, canDelete: false };
                              }
                              setModules(copy);
                            }}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="text-center px-3 py-2">
                          <input
                            type="checkbox"
                            checked={m.canEdit}
                            disabled={!activeModulesSet.has(m.module) || !canEditUser}
                            onChange={(e) => {
                              const copy = [...modules];
                              copy[i] = { ...copy[i], canEdit: e.target.checked, canDelete: e.target.checked ? copy[i].canDelete : false };
                              setModules(copy);
                            }}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="text-center px-3 py-2">
                          <input
                            type="checkbox"
                            checked={m.canDelete}
                            disabled={!m.canEdit || !canEditUser}
                            onChange={(e) => {
                              const copy = [...modules];
                              copy[i] = { ...copy[i], canDelete: e.target.checked };
                              setModules(copy);
                            }}
                            className="h-4 w-4"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <Label className="mb-2 block">Report Access</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_REPORTS.map((r) => (
                    <label key={r.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reports.includes(r.key)}
                        disabled={!canEditUser}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReports([...reports, r.key]);
                          } else {
                            setReports(reports.filter((x) => x !== r.key));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {saveError && (
            <p className="text-destructive text-sm">{saveError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEditUser}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
