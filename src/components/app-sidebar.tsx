"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  FolderKanban,
  GraduationCap,
  Home,
  Inbox,
  NotebookText,
  AlertCircle,
  TimerReset,
  WalletCards,
  FileSpreadsheet,
  ListChecks,
} from "lucide-react";
import { useInboxItems } from "@/hooks/useInboxMutations";
import { useLifeHabits } from "@/hooks/useLifeHabitMutations";
import { useNotes } from "@/hooks/useNoteMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useStudyMistakes } from "@/hooks/useStudyMistakeMutations";
import { useStudySubjects } from "@/hooks/useStudyMutations";
import { useTask } from "@/hooks/useTaskMutation";
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
  description: string;
};

const lifeItems: SidebarItem[] = [
  {
    title: "Life Dashboard",
    url: "/",
    icon: Home,
    description: "Projects, tasks, and money",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
    description: "Habits and tasks",
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
    description: "Connected knowledge",
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

const planningItems: SidebarItem[] = [
  {
    title: "Habit Tracker",
    url: "/life-habits",
    icon: ListChecks,
    description: "Good and bad habits",
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: CalendarDays,
    description: "Plan tasks by day",
  },
  {
    title: "Weekly Plan",
    url: "/weekly-organizer",
    icon: CalendarRange,
    description: "Organize this week",
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
    <SidebarMenu className="gap-2">
      {items.map((item) => {
        const isActive = isSidebarItemActive(pathname, item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className="h-auto rounded-2xl px-3 py-3 transition-colors hover:bg-white/10 active:bg-white/20 data-[active=true]:bg-white/16"
            >
              <Link
                href={item.url}
                className="flex items-center gap-3 text-sidebar-foreground"
              >
                <item.icon className="size-5" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {item.description}
                  </span>
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
  const { data: projects } = useProjects();
  const { data: tasks } = useTask();
  const { data: inboxItems } = useInboxItems({ status: "unprocessed" });
  const { data: lifeHabits } = useLifeHabits();
  const { data: notes } = useNotes();
  const { data: studyMistakes } = useStudyMistakes();
  const { data: studySubjects } = useStudySubjects();

  const badges: Record<string, number> = {
    "/projects": projects?.length ?? 0,
    "/inbox": inboxItems?.length ?? 0,
    "/notes": notes?.length ?? 0,
    "/calendar": tasks?.length ?? 0,
    "/life-habits": lifeHabits?.length ?? 0,
    "/weekly-organizer": tasks?.length ?? 0,
    "/pomodoro": 0,
    "/finance": 0,
    "/finance/tracker": 0,
    "/study": studySubjects?.length ?? 0,
    "/study/mistakes": studyMistakes?.filter((mistake) => mistake.status !== "mastered").length ?? 0,
    "/study/planner": studySubjects?.length ?? 0,
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarContent className="bg-sidebar p-4 text-sidebar-foreground">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 text-sidebar-foreground/70">
            LifeUp Workspace
          </SidebarGroupLabel>

          <div className="mb-5 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Navigation Hub</p>
                <p className="text-xs text-sidebar-foreground/70">
                  Review metrics, then drill into the records that need action.
                </p>
              </div>
            </div>
          </div>

          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={lifeItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="mb-2 text-sidebar-foreground/60">
            Life planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={planningItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="mb-2 text-sidebar-foreground/60">
            Study tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={studyItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto rounded-3xl border border-white/10 bg-white/8 p-4 text-sm text-sidebar-foreground/80">
          <p className="font-medium">Current focus</p>
          <p className="mt-1 text-xs text-sidebar-foreground/70">
            Use Life for projects, routines, planning, and money. Use Study for subjects, reviews, question practice, and focus.
          </p>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
