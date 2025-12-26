"use client";

import { useEffect, useState } from "react";
import { Project } from "@/types/BaseInterfaces";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, color }),
    });

    if (res.ok) {
      setTitle("");
      fetchProjects();
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">LifeUp Projects</h1>
        <p className="text-gray-500">Organize your habits and tasks by project.</p>
      </header>

      {/* CREATION FORM */}
      <section className="bg-white p-6 rounded-xl border shadow-sm mb-10">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-semibold mb-2 block">Project Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Physical Health"
              className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-20">
            <label className="text-sm font-semibold mb-2 block">Color</label>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-11 p-1 rounded-lg border cursor-pointer"
            />
          </div>
          <button 
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Create Project
          </button>
        </form>
      </section>

      {/* PROJECTS LIST */}
      <section className="grid gap-4">
        {loading ? (
          <p>Loading your projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed rounded-xl">
            <p className="text-gray-400">No projects found. Create your first one above!</p>
          </div>
        ) : (
          projects.map((project) => (
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