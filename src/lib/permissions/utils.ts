import { type Session } from "next-auth";
import { type Resource, type Action, type Role, ROLES } from "./config";

export function hasPermission(
  session: Session | null,
  resource: Resource,
  action: Action,
  permissions?: Array<{ role: string; resource: string; action: string; enabled: boolean }>
): boolean {
  if (!session?.user?.email) return false;
  
  const userRole = (session.user as any).role as Role;
  
  if (userRole === ROLES.ADMIN) {
    return true;
  }

  if (permissions) {
    const permission = permissions.find(
      p => p.role === userRole && p.resource === resource && p.action === action
    );
    return permission?.enabled ?? false;
  }

  return false;
}

export function canViewResource(session: Session | null, resource: Resource): boolean {
  if (!session?.user?.email) return false;
  const userRole = (session.user as any).role as Role;
  return userRole === ROLES.ADMIN || true;
}
