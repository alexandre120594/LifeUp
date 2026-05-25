import { NotesServices } from "@/services/NotesServices";
import { NoteUpdateInput } from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotes(filters?: {
  category?: string;
  habitId?: string;
  projectId?: string;
  q?: string;
  taskId?: string;
}) {
  return useQuery({
    queryKey: ["notes", filters],
    queryFn: () => NotesServices.getAll(filters),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Note saved.",
      successTitle: "Saved",
    },
    mutationFn: NotesServices.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["task"], refetchType: "all" }),
      ]);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Note updated.",
      successTitle: "Updated",
    },
    mutationFn: ({ data, id }: { data: NoteUpdateInput; id: string }) =>
      NotesServices.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["task"], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Note deleted.",
      successTitle: "Deleted",
    },
    mutationFn: NotesServices.delete,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["inbox"], refetchType: "all" }),
      ]);
    },
  });
}
