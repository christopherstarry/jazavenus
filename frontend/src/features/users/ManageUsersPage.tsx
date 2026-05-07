import { useState, useCallback } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Users, Pencil, KeyRound, Lock, Plus, Trash2 } from "lucide-react";
import { api } from "#/lib/api";
import { useAuth } from "#/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { EmptyState } from "#/components/ui/empty-state";
import { Badge } from "#/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { useConfirm } from "#/components/ui/confirm";
import { UserEditDialog } from "#/features/users/UserEditDialog";
import { ResetPasswordDialog } from "#/features/users/ResetPasswordDialog";
import { CreateUserDialog } from "#/features/users/CreateUserDialog";
import type { PagedResult } from "#/features/common/CrudPage";

interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  hasCustomPermissions: boolean;
  isActive: boolean;
  lastLoginAtUtc: string | null;
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

interface ModulePermissionDto {
  module: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<number | undefined>();
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const [resettingUser, setResettingUser] = useState<UserListItem | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const q = useQuery({
    queryKey: ["users", page, search, role],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (search) params.search = search;
      if (role) params.role = role;
      return api.get("users", { searchParams: params }).json<PagedResult<UserListItem>>();
    },
    placeholderData: keepPreviousData,
  });

  const openEdit = useCallback(async (userId: string) => {
    const detail = await api.get(`users/${userId}`).json<UserDetail>();
    setEditingUser(detail);
  }, []);

  const openReset = useCallback((u: UserListItem) => {
    setResettingUser(u);
  }, []);

  const canModify = useCallback((targetRole: string) => {
    const isDev = currentUser?.isDeveloper;
    const isSuperAdmin = currentUser?.roles?.includes("SuperAdmin");
    if (isDev) return true;
    if (isSuperAdmin && targetRole !== "Developer") return true;
    return false;
  }, [currentUser]);

  const handleDelete = async (u: UserListItem) => {
    const ok = await confirm({
      title: `Delete ${u.fullName}?`,
      description: `This will permanently delete ${u.fullName} (${u.email}) and all their permissions. This cannot be undone.`,
      confirmLabel: "Yes, delete",
      destructive: true,
    });
    if (!ok) return;
    await api.delete(`users/${u.id}`);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const isEmpty = q.data && q.data.items.length === 0 && !search;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle>Manage Users</CardTitle>
        </div>
        <Button size="sm" onClick={() => setCreatingUser(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
            value={role ?? ""}
            onChange={(e) => { setRole(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="1">Sales</option>
            <option value="2">Admin</option>
            <option value="3">SuperAdmin</option>
            <option value="4">Developer</option>
          </select>
        </div>

        {q.isLoading && (
          <div className="flex justify-center py-12">
            <Spinner label="Loading users…" />
          </div>
        )}

        {isEmpty && (
          <EmptyState icon={Users} title="No users" description="No users match your search." />
        )}

        {q.data && q.data.items.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data.items.map((u) => {
                  const isProtectedRole = u.role === "Developer" || u.role === "SuperAdmin";
                  const isDev = currentUser?.isDeveloper;
                  const locked = !isDev && isProtectedRole;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge tone={u.role === "Developer" ? "info" : u.role === "SuperAdmin" ? "info" : "neutral"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.hasCustomPermissions ? (
                          <Badge tone="neutral">Custom</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Base Role</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canModify(u.role) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => openReset(u)}>
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reset Password</TooltipContent>
                            </Tooltip>
                          )}
                          {locked ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled>
                                  <Lock className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cannot modify this role</TooltipContent>
                            </Tooltip>
                          ) : canModify(u.role) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => openEdit(u.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit User</TooltipContent>
                            </Tooltip>
                          ) : null}
                          {canModify(u.role) && u.id !== currentUser?.userId && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(u)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete User</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                {q.data.totalCount} users · Page {q.data.page} of {q.data.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= q.data.totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {editingUser && (
          <UserEditDialog
            user={editingUser}
            currentUser={currentUser}
            open={!!editingUser}
            onClose={() => { setEditingUser(null); q.refetch(); }}
          />
        )}

        {resettingUser && (
          <ResetPasswordDialog
            user={resettingUser}
            open={!!resettingUser}
            onClose={() => setResettingUser(null)}
          />
        )}

        <CreateUserDialog
          open={creatingUser}
          onClose={() => { setCreatingUser(false); q.refetch(); }}
          currentUser={currentUser}
        />

        {confirmDialog}
      </CardContent>
    </Card>
  );
}
