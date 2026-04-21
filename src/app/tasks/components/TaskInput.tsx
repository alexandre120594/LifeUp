"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreationFlowCard,
  CreationStep,
  CreationSummary,
} from "@/components/creation-flow-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/hooks/useTaskMutation";
import { useProjects, useProjectsById } from "@/hooks/useProjectMutations";
import { TaskCreateInput } from "@/types/BaseInterfaces";

export default function TaskInput({ projectId }: { projectId?: string }) {
  const { register, setValue, handleSubmit, control } =
    useForm<TaskCreateInput>({
      defaultValues: {
        projectId: projectId ?? "",
        habitId: "",
      },
    });
  const { mutate, isPending } = useCreateTask();
  const selectedProjectId =
    useWatch({
      control,
      name: "projectId",
    }) || projectId;
  const selectedHabitId = useWatch({
    control,
    name: "habitId",
  });
  const { data: projects } = useProjects();
  const { data: project } = useProjectsById(selectedProjectId ?? "");
  const availableHabits = project?.habits ?? [];
  const selectedProject = projects?.find(
    (projectOption) => projectOption.id === selectedProjectId
  );
  const selectedHabit = availableHabits.find(
    (habit) => habit.id === selectedHabitId
  );

  const onSubmit = (data: TaskCreateInput) => {
    const resolvedProjectId = projectId ?? data.projectId;

    if (!resolvedProjectId) {
      return;
    }

    mutate(
      {
        title: data.title,
        projectId: resolvedProjectId,
        habitId: data.habitId,
      },
      {
        onSuccess: () => {
          setValue("title", "");
          setValue("habitId", "");
          if (!projectId) {
            setValue("projectId", "");
          }
        },
      }
    );
  };

  return (
    <CreationFlowCard
      badgeIcon={Sparkles}
      badgeLabel="Task setup"
      title="Add a task with clear ownership"
      description="Guide the task into the right project and habit so it contributes to the right streak and analytics."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!projectId ? (
          <CreationStep eyebrow="Step 1" label="Choose the project">
            <Controller
              name="projectId"
              control={control}
              rules={{ required: "Choose a project" }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("habitId", "");
                  }}
                  value={field.value || ""}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Choose the project that owns this task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Projects</SelectLabel>
                      {projects?.map((projectOption) => (
                        <SelectItem key={projectOption.id} value={projectOption.id}>
                          {projectOption.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </CreationStep>
        ) : null}

        <CreationStep
          eyebrow={projectId ? "Step 1" : "Step 2"}
          label="Name the task"
          helper="Write the task as a concrete deliverable instead of a vague area of work."
        >
          <Input
            {...register("title", {
              required: "Task title is required",
            })}
            title="Add a task"
            className="h-11 rounded-xl"
            placeholder="Example: Ship onboarding checklist"
          />
        </CreationStep>

        <CreationStep
          eyebrow={projectId ? "Step 2" : "Step 3"}
          label="Link it to a habit"
          helper="Habit options appear after a project is selected."
        >
          <Controller
            name="habitId"
            control={control}
            rules={{ required: "Choose a habit" }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={!selectedProjectId || availableHabits.length === 0}
              >
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Choose the habit this task should reinforce" />
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
        </CreationStep>

        <CreationSummary
          icon={ClipboardList}
          title="Flow preview"
          description=""
        >
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-background px-3 py-1">
              {selectedProject?.title ?? "Project"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="rounded-full bg-background px-3 py-1">
              {selectedHabit?.title ?? "Habit"}
            </span>
          </div>
          <Button
            type="submit"
            disabled={isPending || !selectedProjectId || !selectedHabitId}
            className="h-11 w-full rounded-xl"
          >
            {isPending ? "Adding..." : "Create Task"}
          </Button>
        </CreationSummary>
      </form>
    </CreationFlowCard>
  );
}
