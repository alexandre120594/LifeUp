"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/app/ThemeSwitcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return children;
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex min-h-screen min-w-0 w-full flex-col overflow-x-hidden bg-background">
        <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-3 border-b bg-yevox-white/95 p-3 backdrop-blur sm:p-4">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            <h1 className="hidden truncate text-sm font-semibold sm:block">
              Dashboard
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            <Button
              className="gap-2"
              onClick={logout}
              size="sm"
              type="button"
              variant="outline"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full min-w-0 max-w-7xl flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
