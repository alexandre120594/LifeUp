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

  const shellTitle =
    pathname === "/pomodoro" || pathname.startsWith("/study")
      ? "Study Dashboard"
      : "Life Dashboard";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-dvh min-h-0 min-w-0 w-full flex-col overflow-hidden bg-background">
        <header className="z-30 flex shrink-0 min-w-0 items-center justify-between gap-3 border-b bg-yevox-white/95 px-3 py-2.5 backdrop-blur sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            <h1 className="hidden truncate text-sm font-semibold sm:block">
              {shellTitle}
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

        <div className="min-h-0 w-full min-w-0 flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
