import { hasRole, useAuth, useModuleAccess } from "#/lib/auth";

/** Master Maintenance edit/delete gates — honors module permissions plus Developer/SuperAdmin. */
export function useMasterDataAccess() {
  const { user, permissions } = useAuth();
  const mod = useModuleAccess("master");
  const privileged = !!permissions?.isDeveloper || hasRole(user, "SuperAdmin", "Developer");
  const canEdit = privileged || mod.canEdit;
  const canDelete = privileged || mod.canDelete;
  return { canEdit, canDelete, readOnly: !canEdit };
}
