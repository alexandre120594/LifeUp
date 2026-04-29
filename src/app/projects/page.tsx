"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListChecks,
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
import {
  buildActivityTrend,
  buildProjectPerformance,
  getTaskSummary,
} from "@/lib/analytics";

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: projects, isLoading } = useProjects();
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();

  const taskSummary = getTaskSummary(tasks ?? []);
  const projectPerformance = buildProjectPerformance(projects ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const projectsPerPage = 4;
  const totalPages = Math.ceil((projects?.length ?? 0) / projectsPerPage);
  const currentProjectPage = Math.min(currentPage, totalPages || 1);
  const visibleProjects = (projects ?? []).slice(
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
        title="Project List"
        isLoading={isLoading}
        isEmpty={!projects?.length}
        loadingLabel="Loading projects..."
        emptyLabel="No projects found. Create your first project above."
      >
        {visibleProjects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
        {totalPages > 1 ? (
          <Pagination>
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
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
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
                )
              )}
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
        ) : null}
      </ListSection>
    </div>
  );
}
