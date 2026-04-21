"use client";

import { useForm } from "react-hook-form";
import {
  FolderKanban,
  Goal,
  ListChecks,
  Palette,
  Repeat,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CreationFlowCard,
  CreationStep,
  CreationSummary,
} from "@/components/creation-flow-card";
import { ListSection } from "@/components/list-section";
import { PageHero } from "@/components/page-hero";
import { Input } from "@/components/ui/input";
import Counter from "@/components/counter-with-icon";
import ProjectItem from "./components/ProjectItem";
import {
  ActivityTrendChart,
  ProjectPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { useCreateProject, useProjects } from "@/hooks/useProjectMutations";
import { useHabit } from "@/hooks/useHabitMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { ProjectCreateInput } from "@/types/BaseInterfaces";
import {
  buildActivityTrend,
  buildProjectPerformance,
  getTaskSummary,
} from "@/lib/analytics";

export default function ProjectsPage() {
  const { register, handleSubmit, setValue } = useForm<ProjectCreateInput>();
  const { mutate, isPending } = useCreateProject();
  const { data: projects, isLoading } = useProjects();
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();

  const taskSummary = getTaskSummary(tasks ?? []);
  const projectPerformance = buildProjectPerformance(projects ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);

  const onSubmit = (data: ProjectCreateInput) => {
    mutate(data, {
      onSuccess: () => {
        setValue("title", "");
        setValue("color", "");
      },
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <PageHero
          badgeIcon={FolderKanban}
          badgeLabel="Project center"
          title="Projects and delivery visibility"
          description="Track project throughput, compare active workloads, and open a project detail page to manage its habits and tasks."
          stats={[
            { label: "Active Projects", value: projects?.length ?? 0 },
            { label: "Completed Tasks", value: taskSummary.completed },
          ]}
        />

        <CreationFlowCard
          badgeIcon={Sparkles}
          badgeLabel="Project setup"
          title="Create a new project"
          description="Give it a clear name and a strong color so it reads well across the app."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <CreationStep
              eyebrow="Name"
              label="Project name"
              helper="Use a name that still works in reports and lists."
            >
              <Input
                {...register("title", { required: "Name is required" })}
                placeholder="Example: Product Launch Sprint"
                className="h-10 rounded-lg"
              />
            </CreationStep>

            <CreationStep eyebrow="Color" label="Project color">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-2.5">
                <div className="rounded-lg bg-background p-2 text-primary shadow-sm">
                  <Palette className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Visual identity</div>
                  <div className="text-xs text-muted-foreground">
                    Helps distinguish the project in cards and lists.
                  </div>
                </div>
                <input
                  {...register("color")}
                  type="color"
                  defaultValue="#3b82f6"
                  className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                />
              </div>
            </CreationStep>

            <CreationSummary
              icon={FolderKanban}
              title="Ready"
              description="Create it, then continue with habits and tasks."
            >
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 w-full rounded-lg"
              >
                {isPending ? "Saving..." : "Create Project"}
              </Button>
            </CreationSummary>
          </form>
        </CreationFlowCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Counter icon={<Goal />} number={projects?.length} name="Projects" />
        <Counter icon={<Repeat />} number={habits?.length} name="Habits" />
        <Counter icon={<ListChecks />} number={tasks?.length} name="Tasks" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProjectPerformanceChart
          title="Project Throughput"
          description="Completed vs pending tasks by project"
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
        {projects?.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </ListSection>
    </div>
  );
}
