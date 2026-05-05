import { InboxServices } from "@/services/InboxServices";
import { InboxItemUpdateInput } from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useInboxItems(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["inbox", filters],
    queryFn: () => InboxServices.getAll(filters),
  });
}

export function useCreateInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InboxServices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useUpdateInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, id }: { data: InboxItemUpdateInput; id: string }) =>
      InboxServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

export function useDeleteInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InboxServices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}
