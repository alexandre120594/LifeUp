"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarRange,
  Goal,
  GraduationCap,
  Home,
  Inbox,
  NotebookText,
  AlertCircle,
  TimerReset,
  WalletCards,
  FileSpreadsheet,
  BookOpenCheck,
  ShieldCheck,
} from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useInboxItems } from "@/hooks/useInboxMutations";
import { useNotes } from "@/hooks/useNoteMutations";
import { useStudyMistakes } from "@/hooks/useStudyMistakeMutations";
import { useStudySubjects } from "@/hooks/useStudyMutations";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type SidebarItem = {
  title: string;
  url: string;
  icon: typeof Home;
  description?: string;
};

const lifeItems: SidebarItem[] = [
  {
    title: "Life Dashboard",
    url: "/",
    icon: Home,
    description: "Goals and progress",
  },
  {
    title: "Goals",
    url: "/goals",
    icon: Goal,
    description: "Main direction",
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
    description: "Fast capture",
  },
  {
    title: "Notes",
    url: "/notes",
    icon: NotebookText,
    description: "Knowledge",
  },
  {
    title: "Finance",
    url: "/finance",
    icon: WalletCards,
    description: "Cash flow and plans",
  },
  {
    title: "Spend Tracker",
    url: "/finance/tracker",
    icon: FileSpreadsheet,
    description: "CSV account spending",
  },
];

const studyItems: SidebarItem[] = [
  {
    title: "Study Dashboard",
    url: "/study",
    icon: GraduationCap,
    description: "Subjects and reviews",
  },
  {
    title: "Mistake Log",
    url: "/study/mistakes",
    icon: AlertCircle,
    description: "Questions and rules",
  },
  {
    title: "Study Plan",
    url: "/study/planner",
    icon: CalendarRange,
    description: "Subjects and schedule",
  },
  {
    title: "Dataprev Plan",
    url: "/study/trt-plan",
    icon: BookOpenCheck,
    description: "Perfil 3 roadmap",
  },
  {
    title: "TRT Audit Plan",
    url: "/study/trt-audit-plan",
    icon: ShieldCheck,
    description: "Analyst and technician tracks",
  },
  {
    title: "Focus Timer",
    url: "/pomodoro",
    icon: TimerReset,
    description: "Standalone study focus",
  },
];

function isSidebarItemActive(pathname: string, url: string) {
  if (url === "/finance" || url === "/study") {
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
              className="h-auto rounded-lg px-2.5 py-2 transition-colors hover:bg-white/10 active:bg-white/20 data-[active=true]:bg-white/16"
            >
              <Link
                href={item.url}
                className="flex items-center gap-3 text-sidebar-foreground"
              >
                <item.icon className="size-4" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.description ? (
                    <span className="hidden truncate text-xs text-sidebar-foreground/70 min-[850px]:block">
                      {item.description}
                    </span>
                  ) : null}
                </div>
                {item.url !== "/" ? (
                  <SidebarMenuBadge className="static ml-auto bg-white/15 text-sidebar-foreground">
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
  const { data: studyMistakes } = useStudyMistakes();
  const { data: studySubjects } = useStudySubjects();

  const badges: Record<string, number> = {
    "/goals": goals?.length ?? 0,
    "/inbox": inboxItems?.length ?? 0,
    "/notes": notes?.length ?? 0,
    "/pomodoro": 0,
    "/finance": 0,
    "/finance/tracker": 0,
    "/study": studySubjects?.length ?? 0,
    "/study/mistakes": studyMistakes?.filter((mistake) => mistake.status !== "mastered").length ?? 0,
    "/study/planner": studySubjects?.length ?? 0,
    "/study/trt-plan": 12,
    "/study/trt-audit-plan": 3,
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarContent className="bg-sidebar p-2.5 text-sidebar-foreground">
        <SidebarGroup className="p-1">
          <SidebarGroupLabel className="mb-1 text-sidebar-foreground/70">
            LifeUp Workspace
          </SidebarGroupLabel>

          <div className="mb-2 rounded-lg border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm max-[850px]:hidden">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/15 p-2">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Navigation Hub</p>
                <p className="text-xs text-sidebar-foreground/70">Metrics and records</p>
              </div>
            </div>
          </div>

          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={lifeItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1 p-1">
          <SidebarGroupLabel className="mb-1 text-sidebar-foreground/60">
            Study tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={studyItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto rounded-lg border border-white/10 bg-white/8 p-2.5 text-sm text-sidebar-foreground/80 max-[850px]:hidden">
          <p className="font-medium">Life + Study</p>
          <p className="mt-1 text-xs text-sidebar-foreground/70">Plan, track, review.</p>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
