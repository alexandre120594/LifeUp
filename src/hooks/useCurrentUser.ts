import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CurrentUserServices } from "@/services/CurrentUserServices";

export const currentUserQueryKey = ["current-user"] as const;

export function useCurrentUser() {
  return useQuery({
    queryFn: CurrentUserServices.getCurrent,
    queryKey: currentUserQueryKey,
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      errorMessage: "Não foi possível salvar as alterações.",
      successMessage: "Seu perfil foi atualizado.",
      successTitle: "Alterações salvas",
    },
    mutationFn: CurrentUserServices.updateCurrent,
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserQueryKey, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    meta: {
      errorMessage: "Não foi possível sair da conta.",
      successMessage: "Você saiu da sua conta.",
      successTitle: "Sessão encerrada",
    },
    mutationFn: CurrentUserServices.logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
