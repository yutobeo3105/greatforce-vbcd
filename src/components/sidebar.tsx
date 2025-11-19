"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  TrendingUp,
  CheckSquare,
  Mail,
  Package,
  FileText,
  Zap,
  Download,
  ListChecks,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Contacts", href: "/contacts", icon: Users, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Companies", href: "/companies", icon: Building2, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Deals", href: "/deals", icon: TrendingUp, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Activities", href: "/activities", icon: CheckSquare, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Products", href: "/products", icon: Package, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Quotes", href: "/quotes", icon: FileText, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Users", href: "/users", icon: UserCog, roles: ["admin", "manager"] },
  { name: "Email Templates", href: "/email-templates", icon: Mail, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Import/Export", href: "/import-export", icon: Download, roles: ["admin", "manager", "sales", "marketing"] },
  { name: "Bulk Actions", href: "/bulk-actions", icon: ListChecks, roles: ["admin", "manager"] },
  { name: "Permissions", href: "/permissions", icon: Shield, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const userRole = (session?.user as any)?.role ?? "support";
  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  if (status === "loading") {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Zap className="h-6 w-6 text-white" />
          <span className="text-xl font-bold text-white">greatForce</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Zap className="h-6 w-6 text-white" />
        <span className="text-xl font-bold text-white">greatForce</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
