"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Project, ProjectCreateInput, ProjectInsert } from "@/types/BaseInterfaces";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjectMutations";
import { Edit, Trash, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectItem({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  
  // Local form for this specific project
  const { register, handleSubmit } = useForm<ProjectCreateInput>({
    defaultValues: { title: project.title, color: project.color}
  });

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject(project.id);

  const onUpdate = (data: ProjectInsert) => {
    updateProject(
      { id: project.id, data }, 
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const resetStreak = (project: Project) => {
  updateProject({
    id: project.id,
    data: {
      streakGlobal: 0,
      lastActivityDate: new Date() 
    }
  });
};

useEffect(() => {
  if (project.lastActivityDate && (project.streakGlobal || 0) > 0) {
    const last = new Date(project.lastActivityDate);
    const now = new Date();
    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffInDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
    if (diffInDays > 1) {
      resetStreak(project);
    }
  }
}, [project.id, project.lastActivityDate]);
  

  return (
    <div
      className="flex items-center justify-between p-5 bg-white border rounded-xl hover:border-blue-300 transition shadow-sm"
      style={{ borderLeft: `12px solid ${project.color}` }}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit(onUpdate)} className="flex flex-1 gap-4 items-center">
          <input
            {...register("title", { required: true })}
            className="border p-1 rounded flex-1 px-2"
          />
          <input {...register("color")} type="color" className="w-8 h-8 cursor-pointer" />
          <div className="flex gap-2">
            <button type="submit" disabled={isUpdating} className="text-green-600 hover:bg-green-50 p-1 rounded">
              <Check size={20} />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:bg-gray-50 p-1 rounded">
              <X size={20} />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{project.title}</h3>
            <p className="text-xs text-gray-500">{project.habits?.length || 0} Habits • {project.tasks?.length || 0} Tasks</p>
          </div>
          <div>
            Streak: {project.streakGlobal}
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/projects/${project.id}`)} className="text-blue-500 text-sm font-medium px-2">
              View
            </button>
            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600">
              <Edit size={18} />
            </button>
            <button onClick={() => deleteProject(project.id)} className="text-gray-400 hover:text-red-600">
              <Trash size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}