"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/app/ThemeSwitcher";

const routeContexts = [
  { matcher: (path: string) => path === "/", title: "Hoje", area: "Principal" },
  { matcher: (path: string) => path.startsWith("/goals"), title: "Metas", area: "Principal" },
  { matcher: (path: string) => path.startsWith("/inbox"), title: "Captura", area: "Principal" },
  { matcher: (path: string) => path.startsWith("/notes"), title: "Notas", area: "Principal" },
  { matcher: (path: string) => path.startsWith("/finance"), title: "Financas", area: "Modulo" },
  { matcher: (path: string) => path.startsWith("/pomodoro"), title: "Foco", area: "Principal" },
  { matcher: (path: string) => path.startsWith("/life-habits"), title: "Habitos", area: "Legado" },
  { matcher: (path: string) => path.startsWith("/study"), title: "Estudos", area: "Modulo" },
];

function getRouteContext(pathname: string) {
  return (
    routeContexts.find((context) => context.matcher(pathname)) ?? {
      title: "LifeUp",
      area: "Workspace",
    }
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return children;
  }

  const shellContext = getRouteContext(pathname);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-dvh min-h-0 min-w-0 w-full flex-col overflow-hidden bg-background text-foreground">
        <header className="z-30 flex h-[var(--app-topbar-height)] shrink-0 min-w-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-2xl sm:gap-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <SidebarTrigger className="size-9 shrink-0" />
            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold uppercase leading-none tracking-[0.12em] text-text-tertiary sm:block">
                {shellContext.area}
              </p>
              <h1 className="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">
                {shellContext.title}
              </h1>
            </div>
          </div>
          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeSwitcher />
            <Button
              aria-label="Sair"
              className="h-[30px] w-[30px] gap-2 px-0 sm:w-auto sm:px-2.5"
              onClick={logout}
              size="sm"
              type="button"
              variant="outline"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Sair</span>
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
