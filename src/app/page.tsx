"use client";

import { useEffect, useState } from "react";
import { Project, ProjectCreateInput } from "@/types/BaseInterfaces";
import { useForm } from "react-hook-form";
import { useCreateProject, useProjects } from "@/hooks/useProjectMutations";

export default function ProjectsPage() {

  const { register, handleSubmit, reset } = useForm<ProjectCreateInput>();
  const { mutate, isPending } = useCreateProject();
  const { data: projects, isLoading, isError } = useProjects();

  const onSubmit = (data: ProjectCreateInput) => {
    mutate(data, {
      onSuccess: () => reset(),
    });
  };
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">LifeUp Projects</h1>
        <p className="text-gray-500">Organize your habits and tasks by project.</p>
      </header>

      {/* CREATION FORM */}
      <section className="bg-white p-6 rounded-xl border shadow-sm mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
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
            <p className="text-gray-400">No projects found. Create your first one above!</p>
          </div>
        ) : (
          projects?.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center justify-between p-5 bg-white border rounded-xl hover:border-blue-300 transition shadow-sm"
              style={{ borderLeft: `12px solid ${project.color}` }}
            >
              <div>
                <h3 className="text-lg font-bold">{project.title}</h3>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {project.habits?.length || 0} Habits
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {project.tasks?.length || 0} Tasks
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500">
                {/* Add a trash icon here later */}
                View Details →
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}