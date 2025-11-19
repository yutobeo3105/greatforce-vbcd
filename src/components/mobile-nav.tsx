"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Download,
  ListChecks,
  Shield,
} from "lucide-react";
import { cn } from "~/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Contacts", href: "/contacts", icon: Users, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Companies", href: "/companies", icon: Building2, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Deals", href: "/deals", icon: TrendingUp, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Tasks", href: "/activities", icon: CheckSquare, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Products", href: "/products", icon: Package, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Quotes", href: "/quotes", icon: FileText, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Users", href: "/users", icon: UserCog, roles: ["admin", "manager"] },
  { name: "Templates", href: "/email-templates", icon: Mail, roles: ["admin", "manager", "sales", "marketing", "support"] },
  { name: "Import", href: "/import-export", icon: Download, roles: ["admin", "manager", "sales", "marketing"] },
  { name: "Bulk", href: "/bulk-actions", icon: ListChecks, roles: ["admin", "manager"] },
  { name: "Perms", href: "/permissions", icon: Shield, roles: ["admin"] },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = (session?.user as any)?.role ?? "support";
  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center h-16 overflow-x-auto scrollbar-hide px-2 gap-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] flex-shrink-0 h-full px-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
