"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Plus, Users as UsersIcon, Edit2, Trash2, Mail, Phone, Shield } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

const ROLE_COLORS: Record<"ADMIN" | "MANAGER" | "SALES_REP" | "VIEWER", "destructive" | "default" | "secondary" | "outline"> = {
  ADMIN: "destructive",
  MANAGER: "default",
  SALES_REP: "secondary",
  VIEWER: "outline",
};

export default function UsersPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "MANAGER" | "SALES_REP" | "VIEWER" | undefined>();
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_REP" as const,
  });

  const { data: users, refetch } = api.user.getAll.useQuery({
    role: roleFilter,
    isActive: statusFilter,
  });

  const { data: roles } = api.user.getRoles.useQuery();

  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreating(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "SALES_REP",
      });
    },
  });

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      void refetch();
      setEditingUser(null);
    },
  });

  const deleteUser = api.user.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    createUser.mutate(newUser);
  };

  const userToEdit = users?.find((u) => u.id === editingUser);

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">Manage team members and permissions</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>

        <div className="flex gap-4">
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="SALES_REP">Sales Rep</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter === undefined ? "__all__" : statusFilter ? "active" : "inactive"}
            onValueChange={(v) => setStatusFilter(v === "__all__" ? undefined : v === "active")}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users?.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      {user.name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                        {user.role.replace("_", " ")}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${user.email}`} className="text-sm hover:underline">
                        {user.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {roles?.find((r) => r.value === user.role)?.description}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingUser(user.id)}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Delete this user?")) {
                        deleteUser.mutate({ id: user.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users?.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              {roleFilter || statusFilter !== undefined
                ? "Try adjusting your filters"
                : "Add your first team member to get started"}
            </p>
            {!roleFilter && statusFilter === undefined && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New User
              </Button>
            )}
          </div>
        )}

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <Input
                    placeholder="e.g., John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password *</label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    placeholder="e.g., +1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as typeof newUser.role })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createUser.isPending}>
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {userToEdit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={userToEdit.name}
                      onChange={(e) => {
                        updateUser.mutate({
                          id: userToEdit.id,
                          name: e.target.value,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={userToEdit.email}
                      onChange={(e) => {
                        updateUser.mutate({
                          id: userToEdit.id,
                          email: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      onChange={(e) => {
                        updateUser.mutate({
                          id: userToEdit.id,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Select
                      value={userToEdit.role}
                      onValueChange={(value) => {
                        updateUser.mutate({
                          id: userToEdit.id,
                          role: value as "ADMIN" | "MANAGER" | "SALES_REP" | "VIEWER",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={userToEdit.isActive}
                    onChange={(e) => {
                      updateUser.mutate({
                        id: userToEdit.id,
                        isActive: e.target.checked,
                      });
                    }}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
