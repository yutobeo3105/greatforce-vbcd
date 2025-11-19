"use client";

import { useState } from "react";
import { AppLayout } from "~/components/app-layout";
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Loader2, Shield, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { getResourceLabel, getActionLabel, getRoleLabel, type Role } from "~/lib/permissions/config";

export default function PermissionsPage() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  
  const { data: permissions, isLoading, refetch } = api.permission.getAll.useQuery();
  const { data: roles } = api.permission.getRoles.useQuery();
  
  const updatePermission = api.permission.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Permission updated",
        description: "The permission has been successfully updated.",
      });
      void refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggle = (id: string, currentValue: boolean) => {
    updatePermission.mutate({ id, enabled: !currentValue });
  };

  const rolePermissions = permissions?.filter(p => p.role === selectedRole) ?? [];
  
  const groupedPermissions = rolePermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource]!.push(permission);
    return acc;
  }, {} as Record<string, typeof rolePermissions>);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground">
            Configure role-based access control for your team
          </p>
        </div>
      </div>

      <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
        <TabsList className="grid w-full grid-cols-5">
          {roles?.map((role) => (
            <TabsTrigger key={role} value={role} className="capitalize">
              {getRoleLabel(role)}
            </TabsTrigger>
          ))}
        </TabsList>

        {roles?.map((role) => (
          <TabsContent key={role} value={role} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{getRoleLabel(role)} Permissions</span>
                  <Badge variant="outline">
                    {rolePermissions.filter(p => p.enabled).length} / {rolePermissions.length} enabled
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Configure what {getRoleLabel(role).toLowerCase()} users can do in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {getResourceLabel(resource)}
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {permission.enabled ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium">
                                {getActionLabel(permission.action)}
                              </span>
                            </div>
                            <Switch
                              checked={permission.enabled}
                              onCheckedChange={() => handleToggle(permission.id, permission.enabled)}
                              disabled={updatePermission.isPending || role === "admin"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    </AppLayout>
  );
}
