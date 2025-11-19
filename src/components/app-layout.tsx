"use client";

import { useState } from "react";
import { Sidebar } from "~/components/sidebar";
import { MobileLayout } from "~/components/mobile-layout";
import { GlobalSearch } from "~/components/global-search";
import { useIsMobile } from "~/hooks/use-mobile";
import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <MobileLayout>{children}</MobileLayout>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-end px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="relative w-64 justify-start text-sm text-muted-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search...</span>
                <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </div>
          {children}
        </main>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
