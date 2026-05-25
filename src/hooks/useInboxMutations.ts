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
    meta: {
      successMessage: "Inbox item captured.",
      successTitle: "Saved",
    },
    mutationFn: InboxServices.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"], refetchType: "all" });
    },
  });
}

export function useUpdateInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Inbox item updated.",
      successTitle: "Updated",
    },
    mutationFn: ({ data, id }: { data: InboxItemUpdateInput; id: string }) =>
      InboxServices.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inbox"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["notes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["task"], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Inbox item deleted.",
      successTitle: "Deleted",
    },
    mutationFn: InboxServices.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inbox"], refetchType: "all" });
    },
  });
}
