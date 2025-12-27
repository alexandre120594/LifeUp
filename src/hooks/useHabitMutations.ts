import { HabitsServices } from "@/services/HabitsServices";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export function useHabit() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: HabitsServices.getAll,
  });
}

export function useCreateHabits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: HabitsServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
