"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Goal,
  GraduationCap,
  Home,
  Inbox,
  NotebookText,
  Repeat2,
  TimerReset,
  WalletCards,
  Sparkles,
} from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useInboxItems } from "@/hooks/useInboxMutations";
import { useNotes } from "@/hooks/useNoteMutations";
import { useStudyWorkspace } from "@/hooks/useStudyWorkspace";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type SidebarItem = {
  title: string;
  url: string;
  icon: typeof Home;
  description?: string;
};

const lifeItems: SidebarItem[] = [
  {
    title: "Hoje",
    url: "/",
    icon: Home,
    description: "Progresso e proximas acoes",
  },
  {
    title: "Metas",
    url: "/goals",
    icon: Goal,
    description: "Gestao de objetivos",
  },
  {
    title: "Hábitos",
    url: "/life-habits",
    icon: Repeat2,
    description: "Consistência diária",
  },
  {
    title: "Captura",
    url: "/inbox",
    icon: Inbox,
    description: "Entrada rapida",
  },
  {
    title: "Notas",
    url: "/notes",
    icon: NotebookText,
    description: "Biblioteca",
  },
];

const studyItems: SidebarItem[] = [
  {
    title: "Estudos",
    url: "/study",
    icon: GraduationCap,
    description: "Materias e revisoes",
  },
  {
    title: "Foco",
    url: "/pomodoro",
    icon: TimerReset,
    description: "Timer de estudo",
  },
];

const financeItems: SidebarItem[] = [
  {
    title: "Financas",
    url: "/finance",
    icon: WalletCards,
    description: "Fluxo e planos",
  },
];

function isSidebarItemActive(pathname: string, url: string) {
  if (url === "/finance" || url === "/study" || url === "/pomodoro") {
    return pathname === url;
  }

  return url === "/"
    ? pathname === "/"
    : pathname === url || pathname.startsWith(`${url}/`);
}

function SidebarLinkList({
  badges,
  items,
}: {
  badges: Record<string, number>;
  items: SidebarItem[];
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const isActive = isSidebarItemActive(pathname, item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              className="h-9 rounded-[9px] px-2.5 text-[13px] text-sidebar-foreground/65 transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-foreground active:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-foreground"
            >
              <Link
                href={item.url}
                aria-current={isActive ? "page" : undefined}
                className="flex items-center gap-2.5"
              >
                <item.icon className="size-[18px] shrink-0" strokeWidth={1.8} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.description ? (
                    <span className="hidden truncate text-[10px] text-sidebar-foreground/45 min-[850px]:block group-data-[collapsible=icon]:hidden">
                      {item.description}
                    </span>
                  ) : null}
                </div>
                {item.url !== "/" && badges[item.url] > 0 ? (
                  <SidebarMenuBadge className="static ml-auto text-[10px] text-sidebar-foreground/45">
                    {badges[item.url]}
                  </SidebarMenuBadge>
                ) : null}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { data: goals } = useGoals();
  const { data: inboxItems } = useInboxItems({ status: "unprocessed" });
  const { data: notes } = useNotes();
  const { data: study } = useStudyWorkspace();

  const badges: Record<string, number> = {
    "/goals": goals?.length ?? 0,
    "/life-habits": 0,
    "/inbox": inboxItems?.length ?? 0,
    "/notes": notes?.length ?? 0,
    "/pomodoro": 0,
    "/finance": 0,
    "/study": study?.metrics.overdueReviews ?? 0,
  };

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar px-3 py-3 text-sidebar-foreground">
        <div className="flex h-9 items-center gap-2.5 px-1">
          <span className="grid size-[30px] shrink-0 place-items-center rounded-[10px] border border-sidebar-border bg-[linear-gradient(135deg,var(--color-1),var(--color-2))] text-[var(--logo-1)]">
            <Sparkles className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold tracking-[-0.02em]">LifeUp</p>
            <p className="truncate text-[10px] text-sidebar-foreground/45">Seu espaco produtivo</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar p-2.5 text-sidebar-foreground">
        <SidebarGroup className="p-1">
          <SidebarGroupLabel className="mb-1 text-sidebar-foreground/70">
            Principal
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={lifeItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1 p-1">
          <SidebarGroupLabel className="mb-1 text-sidebar-foreground/60">
            Estudos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={studyItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1 p-1">
          <SidebarGroupLabel className="mb-1 text-sidebar-foreground/60">
            Financas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={financeItems} />
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3 text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        <p className="text-[11px] font-medium">Planeje, acompanhe, revise.</p>
        <p className="text-[10px] text-sidebar-foreground/45">SnowUI para LifeUp</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
