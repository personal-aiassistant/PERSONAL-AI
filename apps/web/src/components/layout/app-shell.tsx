"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6",
            "transition-all duration-200"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
