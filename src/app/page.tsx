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
import { Edit, Trash } from "lucide-react";
import ProjectItem from "./projects/components/ProjectItem";

export default function ProjectsPage() {
  const { register, handleSubmit, reset, setValue } =
    useForm<ProjectCreateInput>();
  const { mutate, isPending } = useCreateProject();
  const { data: projects, isLoading, isError } = useProjects();
  const { mutate: mutateDelete } = useDeleteProject("");

  const [isEditProject, setIsEditProject] = useState<boolean>(false);

  const { mutate: mutateUpdateProject } = useUpdateProject();

  const onSubmitDelete = (id: string) => {
    mutateDelete(id);
  };

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
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">LifeUp Projects</h1>
        <p className="text-gray-500">
          Organize your habits and tasks by project.
        </p>
      </header>

      {/* CREATION FORM */}
      <section className="bg-white p-6 rounded-xl border shadow-sm mb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row gap-4 items-end"
        >
          <input
            {...register("title", { required: "Name is required" })}
            placeholder="Project Name"
            className="border p-2 flex-1 rounded"
          />
          <input
            {...register("color")}
            type="color"
            defaultValue="#3b82f6"
            className="w-12 h-10 cursor-pointer rounded"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-slate-400"
          >
            {isPending ? "Adicionando..." : "Adicionar Projeto"}
          </button>
        </form>
      </section>

      {/* PROJECTS LIST */}
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
  );
}
