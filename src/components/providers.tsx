"use client";

import { useState } from "react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider, toast } from "@/components/ui/toast";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            const errorMessage =
              typeof mutation.meta?.errorMessage === "string"
                ? mutation.meta.errorMessage
                : getErrorMessage(error);

            toast({
              message: errorMessage,
              title: "Action failed",
              type: "error",
            });
          },
          onSuccess: (_data, _variables, _context, mutation) => {
            const successMessage =
              typeof mutation.meta?.successMessage === "string"
                ? mutation.meta.successMessage
                : "Your changes were saved.";

            toast({
              message: successMessage,
              title:
                typeof mutation.meta?.successTitle === "string"
                  ? mutation.meta.successTitle
                  : "Saved",
              type: "success",
            });
          },
        }),
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
