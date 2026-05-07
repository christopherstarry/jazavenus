import { useState } from "react";
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

interface ModuleRow extends ModulePermissionDto {
  enabled: boolean;
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
  open: boolean;
  onClose: () => void;
  currentUser: CurrentUser | null;
}

export function CreateUserDialog({ open, onClose, currentUser }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(1); // default Sales
  const [hasCustom, setHasCustom] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>(() =>
    ALL_MODULES.map((m) => ({ module: m.key, canEdit: false, canDelete: false, enabled: false })));
  const [reports, setReports] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Create the user
      await api.post("users", {
        json: {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          roleId,
          hasCustomPermissions: hasCustom,
          modules: hasCustom ? modules.filter((m) => m.enabled).map(({ module, canEdit, canDelete }) => ({ module, canEdit, canDelete })) : [],
          reports: hasCustom ? reports : [],
        },
      }).json();
      onClose();
    } catch (err: any) {
      let msg = err.message;
      try {
        const body = await err.response?.json();
        msg = body?.detail ?? body?.title ?? msg;
      } catch {}
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setRoleId(1);
    setHasCustom(false);
    setModules(ALL_MODULES.map((m) => ({ module: m.key, canEdit: false, canDelete: false, enabled: false })));
    setReports([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@jaza.local" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 12 characters" />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
              >
                <option value={1}>Sales</option>
                <option value={2}>Admin</option>
                {currentUser?.isDeveloper && <option value={3}>SuperAdmin</option>}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasCustom} onChange={(e) => setHasCustom(e.target.checked)} className="h-4 w-4" />
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
                            type="checkbox" checked={m.enabled}
                            onChange={(e) => {
                              const copy = [...modules];
                              const cur = copy[i];
                              if (!cur) return;
                              if (e.target.checked) {
                                copy[i] = { module: cur.module, enabled: true, canEdit: false, canDelete: false };
                              } else {
                                copy[i] = { module: cur.module, enabled: false, canEdit: false, canDelete: false };
                              }
                              setModules(copy);
                            }}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="text-center px-3 py-2">
                          <input type="checkbox" checked={m.canEdit} disabled={!m.enabled}
                            onChange={(e) => {
                              const copy = [...modules];
                              const cur = copy[i];
                              if (!cur) return;
                              copy[i] = { module: cur.module, enabled: cur.enabled, canEdit: e.target.checked, canDelete: e.target.checked ? cur.canDelete : false };
                              setModules(copy);
                            }}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="text-center px-3 py-2">
                          <input type="checkbox" checked={m.canDelete} disabled={!m.canEdit}
                            onChange={(e) => {
                              const copy = [...modules];
                              const cur = copy[i];
                              if (!cur) return;
                              copy[i] = { module: cur.module, enabled: cur.enabled, canEdit: cur.canEdit, canDelete: e.target.checked };
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
                      <input type="checkbox" checked={reports.includes(r.key)}
                        onChange={(e) => {
                          if (e.target.checked) setReports([...reports, r.key]);
                          else setReports(reports.filter((x) => x !== r.key));
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

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
