"use client";

import { useState } from "react";
import {
  ArrowDownAZ,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListChecks,
  Search,
  Repeat,
} from "lucide-react";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { ListSection } from "@/components/list-section";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ProjectItem from "./components/ProjectItem";
import {
  ActivityTrendChart,
  ProjectPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { useProjects } from "@/hooks/useProjectMutations";
import { useHabit } from "@/hooks/useHabitMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildActivityTrend,
  buildProjectPerformance,
  getTaskSummary,
} from "@/lib/analytics";

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "done">(
    "all"
  );
  const [sortMode, setSortMode] = useState<"activity" | "progress" | "name">(
    "activity"
  );
  const { data: projects, isLoading } = useProjects();
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();

  const taskSummary = getTaskSummary(tasks ?? []);
  const projectPerformance = buildProjectPerformance(projects ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const projectsPerPage = 6;
  const filteredProjects = (projects ?? [])
    .filter((project) => {
      const query = searchQuery.trim().toLowerCase();
      const taskCount = project.tasks?.length ?? 0;
      const completedTasks =
        project.tasks?.filter((task) => task.completed).length ?? 0;
      const isDone = taskCount > 0 && completedTasks === taskCount;
      const matchesSearch =
        !query || project.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "done" ? isDone : !isDone);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortMode === "name") {
        return a.title.localeCompare(b.title);
      }

      if (sortMode === "progress") {
        const aTasks = a.tasks?.length ?? 0;
        const bTasks = b.tasks?.length ?? 0;
        const aCompleted = a.tasks?.filter((task) => task.completed).length ?? 0;
        const bCompleted = b.tasks?.filter((task) => task.completed).length ?? 0;
        const aRate = aTasks > 0 ? aCompleted / aTasks : 0;
        const bRate = bTasks > 0 ? bCompleted / bTasks : 0;

        return bRate - aRate;
      }

      return (
        new Date(b.lastActivityDate ?? b.createdAt).getTime() -
        new Date(a.lastActivityDate ?? a.createdAt).getTime()
      );
    });
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjectPage = Math.min(currentPage, totalPages || 1);
  const visibleProjects = filteredProjects.slice(
    (currentProjectPage - 1) * projectsPerPage,
    currentProjectPage * projectsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Project center"
        title="Projects"
        action={<EntityCreateDialog defaultMode="project" />}
      />

      <OverviewPanel
        title="Delivery visibility without clutter"
        description="Track project throughput, compare active workloads, and open a project detail page when you need deeper context."
        stats={[
          {
            label: "Projects",
            value: projects?.length ?? 0,
            icon: FolderKanban,
          },
          {
            label: "Habits",
            value: habits?.length ?? 0,
            icon: Repeat,
          },
          {
            label: "Tasks",
            value: tasks?.length ?? 0,
            icon: ListChecks,
          },
        ]}
        progress={{
          label: `${taskSummary.completionRate}% complete`,
          value: taskSummary.completionRate,
          detail: `${taskSummary.completed} completed tasks`,
          icon: CheckCircle2,
        }}
        focusTitle="Balance project workload"
        focusDescription="Use the popup to add projects, habits, or tasks while keeping this page focused on visibility."
        focusItems={[
          {
            label: "Completed tasks",
            value: taskSummary.completed,
            icon: CheckCircle2,
          },
          {
            label: "Pending tasks",
            value: taskSummary.pending,
            icon: Clock3,
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <ProjectPerformanceChart
          title="Project Throughput"
          description="Task workload with completion rate by project"
          data={projectPerformance}
        />
        <ActivityTrendChart
          title="Recent Team Activity"
          description="Completed tasks and habit check-ins in the last 7 days"
          data={activityTrend}
        />
      </section>

      <ListSection
        title="Project list"
        description="Search, sort, and open the project that needs work now."
        isLoading={isLoading}
        isEmpty={!projects?.length}
        loadingLabel="Loading projects..."
        emptyLabel="No projects found. Create your first project above."
      >
        <div className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background/70 p-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto] lg:items-center">
          <label className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="min-w-0 pl-9"
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search projects"
              value={searchQuery}
            />
          </label>
          <div className="flex min-w-0 flex-wrap gap-2">
            {(["all", "active", "done"] as const).map((filter) => (
              <Button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setCurrentPage(1);
                }}
                size="sm"
                type="button"
                variant={statusFilter === filter ? "default" : "outline"}
              >
                {filter === "all"
                  ? "All"
                  : filter === "active"
                    ? "Active"
                    : "Done"}
              </Button>
            ))}
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            {(["activity", "progress", "name"] as const).map((mode) => (
              <Button
                className="min-w-0"
                key={mode}
                onClick={() => {
                  setSortMode(mode);
                  setCurrentPage(1);
                }}
                size="sm"
                type="button"
                variant={sortMode === mode ? "secondary" : "outline"}
              >
                <ArrowDownAZ className="h-4 w-4" />
                <span className="truncate">
                  {mode === "activity"
                    ? "Recent"
                    : mode === "progress"
                      ? "Progress"
                      : "Name"}
                </span>
              </Button>
            ))}
          </div>
        </div>
        {!visibleProjects.length ? (
          <div className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground sm:p-10">
            No projects match the current filters.
          </div>
        ) : null}
        <div className="grid min-w-0 gap-3">
          {visibleProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentProjectPage} of {totalPages} /{" "}
              {filteredProjects.length} projects
            </p>
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="flex-wrap">
                <PaginationItem>
                  <PaginationPrevious
                    className={
                      currentProjectPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(currentProjectPage - 1);
                    }}
                  />
                </PaginationItem>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentProjectPage}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    className={
                      currentProjectPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(currentProjectPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </ListSection>
    </div>
  );
}
