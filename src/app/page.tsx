"use client";

import { useEffect, useState } from "react";
import { Project, ProjectCreateInput } from "@/types/BaseInterfaces";
import { useForm } from "react-hook-form";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjectMutations";
import { redirect } from "next/navigation";
import { Edit, Goal, List, Repeat, Trash, TrendingUp } from "lucide-react";
import ProjectItem from "./projects/components/ProjectItem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import { ChartConfig } from "@/components/ui/chart";
import { useTask } from "@/hooks/useTaskMutation";
import { useHabit } from "@/hooks/useHabitMutations";
import Counter from "@/components/counter-with-icon";
import TaskItem from "./tasks/components/TaskItem";
import TaskList from "./tasks/components/TaskListWithPagination";

const chartConfig = {
  data: {
    label: "Tasks",
  },
  safari: {
    label: "Safari",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function ProjectsPage() {
  const { register, handleSubmit, reset, setValue } =
    useForm<ProjectCreateInput>();
  const { mutate, isPending } = useCreateProject();
  const { data: projects, isLoading, isError } = useProjects();
  const { data: tasks } = useTask();
  const { data: habits } = useHabit();

  const { mutate: mutateDelete } = useDeleteProject("");

  const [isEditProject, setIsEditProject] = useState<boolean>(false);

  const { mutate: mutateUpdateProject } = useUpdateProject();

  const onSubmitDelete = (id: string) => {
    mutateDelete(id);
  };

  const chartData = [
    {
      browser: "safari",
      data: tasks?.filter((t) => t.completed == true).length,
      fill: "var(--color-safari)",
    },
  ];

  const onSubmit = (data: ProjectCreateInput) => {
    mutate(data, {
      onSuccess: () => {
        setValue("color", "");
        setValue("title", "");
      },
    });
  };

  const onSubmitUpdate = (id?: string, data?: ProjectCreateInput) => {
    mutateUpdateProject(
      { id, data },
      {
        onSuccess: () => {
          setValue("color", "");
          setValue("title", "");
        },
      }
    );
  };

  return (
    <div className="p-8">
      <header className="mb-10 grid md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="md:text-3xl font-bold">Yevox Projects</h1>
          <p className="text-gray-500">
            Organize your habits and tasks by project.
          </p>
        </div>

        <div className="md:grid flex gap-12 mt-10 md:mt-0 md:grid-cols-3 md:justify-items-end">
          <div>
            <Counter
              icon={<Goal></Goal>}
              number={projects?.length}
              name={"Projetos"}
            />
          </div>
          <div>
            {" "}
            <Counter
              icon={<Repeat></Repeat>}
              number={habits?.length}
              name={"Habitos"}
            />
          </div>
          <div>
            {" "}
            <Counter
              icon={<List></List>}
              number={tasks?.length}
              name={"Tarefas"}
            />
          </div>
        </div>
      </header>
      <section className="bg-white p-6 rounded-xl border shadow-sm mb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:flex md:flex-col gap-4 items-center"
        >
          <div className="flex w-full md:gap-1 gap-2">
            <input
              {...register("title", { required: "Name is required" })}
              placeholder="Ex: Concurso Receita Federal..."
              className="border p-2 md:flex-1 rounded"
            />
            <input
              {...register("color")}
              type="color"
              defaultValue="#3b82f6"
              className="w-12 h-11 cursor-pointer rounded"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-yevox-primary text-white px-4 py-2 rounded disabled:bg-slate-400"
          >
            {isPending ? "Adicionando..." : "Adicionar Projeto"}
          </button>
        </form>
      </section>

      <>
        <div className="grid md:grid-cols-4 gap-4 grid-cols-1 mb-10">
          <div className="">
            <ChartRadialText
              title="Tasks"
              description="Tasks pendentes"
              type="Tasks"
              chartConfig={chartConfig}
              chartData={chartData}
              children={<></>}
              tamanho={tasks?.length}
            />
          </div>
          <div>
            <TaskList tasks={tasks} key={"taskslist"}></TaskList>
          </div>
          <div className="md:col-span-2">
            <section className="grid gap-4">
              {isLoading ? (
                <p>Loading your projects...</p>
              ) : projects?.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed rounded-xl">
                  <p className="text-gray-400">
                    No projects found. Create your first one above!
                  </p>
                </div>
              ) : (
                projects?.map((project) => (
                  <ProjectItem key={project.id} project={project} />
                ))
              )}
            </section>
          </div>
        </div>
      </>
    </div>
  );
}
