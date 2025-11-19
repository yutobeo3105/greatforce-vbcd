"use client";

import { MobileHeader } from "~/components/mobile-header";
import { MobileNav } from "~/components/mobile-nav";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MobileHeader />
      <main className="flex-1 overflow-y-auto bg-background pb-16">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
