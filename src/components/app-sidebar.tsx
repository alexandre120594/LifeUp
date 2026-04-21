"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderKanban,
  Home,
  ListTodo,
  Repeat,
} from "lucide-react";
import { useHabit } from "@/hooks/useHabitMutations";
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

const items = [
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
    title: "Habits",
    url: "/habits",
    icon: Repeat,
    description: "Consistency and streaks",
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
    description: "Execution queue",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: projects } = useProjects();
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();

  const badges: Record<string, number> = {
    "/projects": projects?.length ?? 0,
    "/habits": habits?.length ?? 0,
    "/tasks": tasks?.length ?? 0,
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarContent className="bg-yevox-primary p-4 text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 text-white/70">
            LifeUp Workspace
          </SidebarGroupLabel>

          <div className="mb-5 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-2">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Navigation Hub</p>
                <p className="text-xs text-white/70">
                  Review metrics, then drill into the records that need action.
                </p>
              </div>
            </div>
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url || pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-auto rounded-2xl px-3 py-3 transition-colors hover:bg-white/10 active:bg-white/20 data-[active=true]:bg-white/16"
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 text-white"
                      >
                        <item.icon className="size-5" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="truncate text-xs text-white/70">
                            {item.description}
                          </span>
                        </div>
                        {item.url !== "/" ? (
                          <SidebarMenuBadge className="static ml-auto bg-white/15 text-white">
                            {badges[item.url]}
                          </SidebarMenuBadge>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto rounded-3xl border border-white/10 bg-white/8 p-4 text-sm text-white/80">
          <p className="font-medium">Current focus</p>
          <p className="mt-1 text-xs text-white/70">
            Use the section pages to compare trends, then open detail pages for
            habit, project, and task-level context.
          </p>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
