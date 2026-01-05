import { HabitsServices } from "@/services/HabitsServices";
import { HabitCreateInput } from "@/types/BaseInterfaces";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export function useHabit(projectId?: string) {
  return useQuery({
    queryKey: ["habits", { projectId }],
    queryFn: () => HabitsServices.getAll(projectId),
    enabled: !projectId,
  });
}

export function useHabitDetail(id: string) {
  return useQuery({
    queryKey: ["habits", id],
    queryFn: () => HabitsServices.getById(id),
  });
}

export function useCreateHabits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: HabitsServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateHabits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HabitCreateInput }) =>
      HabitsServices.update(data, id),
    onSuccess: (data, variables) => {
      const id = variables.id;

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabits(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteHabits", id],
    mutationFn: (id?: string) => HabitsServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
