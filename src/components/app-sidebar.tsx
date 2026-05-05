"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  FolderKanban,
  Home,
  Inbox,
  ListChecks,
  ListTodo,
  NotebookText,
  Repeat,
  TimerReset,
  WalletCards,
} from "lucide-react";
import { useInboxItems } from "@/hooks/useInboxMutations";
import { useHabit } from "@/hooks/useHabitMutations";
import { useNotes } from "@/hooks/useNoteMutations";
import { useProjects } from "@/hooks/useProjectMutations";
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

const essentialItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Overview and momentum",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
    description: "Project health and details",
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
    description: "Execution queue",
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
    title: "Habits",
    url: "/habits",
    icon: Repeat,
    description: "Consistency and streaks",
  },
  {
    title: "Finance",
    url: "/finance",
    icon: WalletCards,
    description: "Cash flow and plans",
  },
];

const planningItems = [
  {
    title: "Pomodoro",
    url: "/pomodoro",
    icon: TimerReset,
    description: "Focus cycles and history",
  },
  {
    title: "Habit Tracker",
    url: "/habit-tracker",
    icon: ListChecks,
    description: "Daily routine grid",
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

function isSidebarItemActive(pathname: string, url: string) {
  return url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`);
}

function SidebarLinkList({
  badges,
  items,
}: {
  badges: Record<string, number>;
  items: typeof essentialItems;
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
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();
  const { data: inboxItems } = useInboxItems({ status: "unprocessed" });
  const { data: notes } = useNotes();

  const badges: Record<string, number> = {
    "/projects": projects?.length ?? 0,
    "/habits": habits?.length ?? 0,
    "/habit-tracker": habits?.length ?? 0,
    "/tasks": tasks?.length ?? 0,
    "/inbox": inboxItems?.length ?? 0,
    "/notes": notes?.length ?? 0,
    "/calendar": tasks?.length ?? 0,
    "/weekly-organizer": tasks?.length ?? 0,
    "/pomodoro": 0,
    "/finance": 0,
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
            <SidebarLinkList badges={badges} items={essentialItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="mb-2 text-sidebar-foreground/60">
            Planning tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarLinkList badges={badges} items={planningItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto rounded-3xl border border-white/10 bg-white/8 p-4 text-sm text-sidebar-foreground/80">
          <p className="font-medium">Current focus</p>
          <p className="mt-1 text-xs text-sidebar-foreground/70">
            Use the section pages to compare trends, then open detail pages for
            habit, project, and task-level context.
          </p>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
