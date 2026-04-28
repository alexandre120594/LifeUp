"use client";

import { useForm, useWatch } from "react-hook-form";
import { Sparkles, Target } from "lucide-react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateHabits } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { HabitCreateInput } from "@/types/BaseInterfaces";

function InputHabit({ projectId }: { projectId?: string }) {
  const { register, handleSubmit, setValue, control } =
    useForm<HabitCreateInput>({
      defaultValues: {
        frequency: "daily",
        projectId: projectId ?? "",
      },
    });
  const selectedProjectId =
    useWatch({
      control,
      name: "projectId",
    }) || projectId;
  const selectedFrequency =
    useWatch({
      control,
      name: "frequency",
    }) ?? "daily";
  const { mutate, isPending } = useCreateHabits();
  const { data: projects } = useProjects();
  const selectedProject = projects?.find(
    (project) => project.id === selectedProjectId
  );

  const onSubmit = (data: HabitCreateInput) => {
    const resolvedProjectId = projectId ?? data.projectId;

    if (!resolvedProjectId) {
      return;
    }

    mutate(
      {
        frequency: data.frequency ?? "daily",
        title: data.title,
        projectId: resolvedProjectId,
      },
      {
        onSuccess: () => {
          setValue("title", "");
          setValue("frequency", data.frequency ?? "daily");
          if (!projectId) {
            setValue("projectId", "");
          }
        },
      }
    );
  };

  return (
    <div className="mt-4 w-full">
      <CreationFlowCard
        badgeIcon={Sparkles}
        badgeLabel="Habit setup"
        title="Add a habit with context"
        description="Create a habit and place it inside the right project from the start."
      >
        {!projectId ? (
          <CreationStep
            eyebrow="Step 1"
            label="Choose the project"
            helper="Habits become easier to track when they are attached to the right project area."
          >
            <Select
              value={selectedProjectId ?? ""}
              onValueChange={(value) => setValue("projectId", value)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Choose where this habit belongs" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CreationStep>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CreationStep
            eyebrow={projectId ? "Create" : "Step 2"}
            label="Name the routine"
            helper="Use a short action-oriented name so it is clear when the habit is completed."
          >
            <Input
              {...register("title", { required: "Enter a habit title" })}
              disabled={isPending}
              className="h-11 rounded-xl"
              placeholder="Example: Read 10 pages every morning"
            />
          </CreationStep>

          <CreationStep
            eyebrow={projectId ? "Cadence" : "Step 3"}
            label="Choose the frequency"
            helper="Daily habits expect regular check-ins; weekly habits are for routines that happen once or a few times per week."
          >
            <Select
              value={selectedFrequency}
              onValueChange={(value) => setValue("frequency", value)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </CreationStep>

          <CreationSummary
            icon={Target}
            title="Placement preview"
            description={
              selectedProject?.title
                ? `This habit will be added to ${selectedProject.title}.`
                : "Choose a project to place this habit correctly."
            }
          >
            <Button
              type="submit"
              disabled={isPending || !selectedProjectId}
              className="h-11 rounded-xl px-5"
            >
              {isPending ? "Adding..." : "Create Habit"}
            </Button>
          </CreationSummary>
        </form>
      </CreationFlowCard>
    </div>
  );
}

export default InputHabit;
