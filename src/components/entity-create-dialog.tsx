"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import {
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Palette,
  Plus,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateHabits } from "@/hooks/useHabitMutations";
import {
  useCreateProject,
  useProjects,
  useProjectsById,
} from "@/hooks/useProjectMutations";
import { useCreateTask } from "@/hooks/useTaskMutation";
import type {
  HabitCreateInput,
  ProjectCreateInput,
  TaskCreateInput,
} from "@/types/BaseInterfaces";
import { useState } from "react";

export type CreateMode = "project" | "habit" | "task";

const createModes: Array<{
  value: CreateMode;
  label: string;
  icon: typeof FolderKanban;
}> = [
  { value: "project", label: "Project", icon: FolderKanban },
  { value: "habit", label: "Habit", icon: Repeat },
  { value: "task", label: "Task", icon: ListTodo },
];

export function EntityCreateDialog({
  defaultMode = "project",
  triggerLabel = "New item",
}: {
  defaultMode?: CreateMode;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CreateMode>(defaultMode);

  const projectForm = useForm<ProjectCreateInput>({
    defaultValues: {
      color: "#3b82f6",
      title: "",
    },
  });
  const habitForm = useForm<HabitCreateInput>({
    defaultValues: {
      projectId: "",
      title: "",
    },
  });
  const taskForm = useForm<TaskCreateInput>({
    defaultValues: {
      habitId: "",
      projectId: "",
      title: "",
    },
  });

  const { data: projects } = useProjects();
  const selectedHabitProjectId = useWatch({
    control: habitForm.control,
    name: "projectId",
  });
  const selectedTaskProjectId = useWatch({
    control: taskForm.control,
    name: "projectId",
  });
  const selectedTaskHabitId = useWatch({
    control: taskForm.control,
    name: "habitId",
  });
  const { data: selectedTaskProject } = useProjectsById(
    selectedTaskProjectId ?? ""
  );

  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject();
  const { mutate: createHabit, isPending: isCreatingHabit } = useCreateHabits();
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();

  const availableHabits = selectedTaskProject?.habits ?? [];
  const selectedHabitProject = projects?.find(
    (project) => project.id === selectedHabitProjectId
  );
  const selectedTaskHabit = availableHabits.find(
    (habit) => habit.id === selectedTaskHabitId
  );

  const closeAfterCreate = () => {
    setOpen(false);
    setMode(defaultMode);
  };

  const onProjectSubmit = (data: ProjectCreateInput) => {
    createProject(data, {
      onSuccess: () => {
        projectForm.reset({ color: "#3b82f6", title: "" });
        closeAfterCreate();
      },
    });
  };

  const onHabitSubmit = (data: HabitCreateInput) => {
    if (!data.projectId) {
      return;
    }

    createHabit(
      {
        projectId: data.projectId,
        title: data.title,
      },
      {
        onSuccess: () => {
          habitForm.reset({ projectId: "", title: "" });
          closeAfterCreate();
        },
      }
    );
  };

  const onTaskSubmit = (data: TaskCreateInput) => {
    if (!data.projectId || !data.habitId) {
      return;
    }

    createTask(data, {
      onSuccess: () => {
        taskForm.reset({ habitId: "", projectId: "", title: "" });
        closeAfterCreate();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 w-full rounded-lg px-4 sm:w-auto">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:max-w-2xl sm:p-5 md:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-2xl tracking-tight">
            Add to LifeUp
          </DialogTitle>
          <DialogDescription>
            Create only what you need, then return to the dashboard view.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 rounded-lg border border-border/70 bg-secondary/35 p-1.5 sm:grid-cols-3">
          {createModes.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {mode === "project" ? (
          <form
            onSubmit={projectForm.handleSubmit(onProjectSubmit)}
            className="space-y-4 rounded-lg border border-border/70 bg-card p-4"
          >
            <div>
              <label className="text-sm font-medium">Project name</label>
              <Input
                {...projectForm.register("title", {
                  required: "Project name is required",
                })}
                className="mt-2 h-11 rounded-xl"
                placeholder="Example: Product Launch"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-secondary/35 p-3">
              <div className="rounded-lg bg-background p-2 text-primary shadow-sm">
                <Palette className="h-4 w-4" />
              </div>
              <div className="min-w-40 flex-1">
                <div className="text-sm font-medium">Project color</div>
                <div className="text-xs text-muted-foreground">
                  Used as a quick visual marker.
                </div>
              </div>
              <input
                {...projectForm.register("color")}
                type="color"
                className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
              />
            </div>

            <Button
              type="submit"
              disabled={isCreatingProject}
              className="h-11 w-full rounded-lg"
            >
              {isCreatingProject ? "Creating..." : "Create project"}
            </Button>
          </form>
        ) : null}

        {mode === "habit" ? (
          <form
            onSubmit={habitForm.handleSubmit(onHabitSubmit)}
            className="space-y-4 rounded-lg border border-border/70 bg-card p-4"
          >
            <div>
              <label className="text-sm font-medium">Project</label>
              <Controller
                name="projectId"
                control={habitForm.control}
                rules={{ required: "Choose a project" }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="mt-2 h-11 w-full rounded-lg">
                      <SelectValue placeholder="Choose where this habit belongs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Projects</SelectLabel>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Habit name</label>
              <Input
                {...habitForm.register("title", {
                  required: "Habit name is required",
                })}
                className="mt-2 h-11 rounded-lg"
                placeholder="Example: Read 10 pages"
              />
            </div>

            <div className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
              {selectedHabitProject?.title
                ? `This habit will live in ${selectedHabitProject.title}.`
                : "Choose a project to unlock habit tracking."}
            </div>

            <Button
              type="submit"
              disabled={isCreatingHabit || !selectedHabitProjectId}
              className="h-11 w-full rounded-lg"
            >
              {isCreatingHabit ? "Creating..." : "Create habit"}
            </Button>
          </form>
        ) : null}

        {mode === "task" ? (
          <form
            onSubmit={taskForm.handleSubmit(onTaskSubmit)}
            className="space-y-4 rounded-lg border border-border/70 bg-card p-4"
          >
            <div>
              <label className="text-sm font-medium">Project</label>
              <Controller
                name="projectId"
                control={taskForm.control}
                rules={{ required: "Choose a project" }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      taskForm.setValue("habitId", "");
                    }}
                  >
                    <SelectTrigger className="mt-2 h-11 w-full rounded-lg">
                      <SelectValue placeholder="Choose the project that owns this task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Projects</SelectLabel>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Task name</label>
              <Input
                {...taskForm.register("title", {
                  required: "Task name is required",
                })}
                className="mt-2 h-11 rounded-lg"
                placeholder="Example: Finish onboarding checklist"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Habit</label>
              <Controller
                name="habitId"
                control={taskForm.control}
                rules={{ required: "Choose a habit" }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!selectedTaskProjectId || availableHabits.length === 0}
                  >
                    <SelectTrigger className="mt-2 h-11 w-full rounded-lg">
                      <SelectValue placeholder="Choose the habit this task supports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Habits</SelectLabel>
                        {availableHabits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id}>
                            {habit.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
              {selectedTaskHabit?.title
                ? `This task will support ${selectedTaskHabit.title}.`
                : "Select a project and habit to keep analytics connected."}
            </div>

            <Button
              type="submit"
              disabled={
                isCreatingTask || !selectedTaskProjectId || !selectedTaskHabitId
              }
              className="h-11 w-full rounded-lg"
            >
              {isCreatingTask ? "Creating..." : "Create task"}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
