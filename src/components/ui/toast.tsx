"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error";

type ToastInput = {
  message: string;
  title?: string;
  type?: ToastType;
};

type ToastItem = Required<ToastInput> & {
  id: string;
};

type ToastListener = (toast: ToastInput) => void;

const toastListeners = new Set<ToastListener>();

export function toast(input: ToastInput) {
  toastListeners.forEach((listener) => listener(input));
}

const ToastContext = createContext<{
  dismiss: (id: string) => void;
  show: (input: ToastInput) => void;
} | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((currentToast) => currentToast.id !== id)
    );
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const nextToast: ToastItem = {
      id,
      message: input.message,
      title: input.title ?? (input.type === "error" ? "Nao foi possivel concluir" : "Salvo"),
      type: input.type ?? "success",
    };

    setToasts((currentToasts) => [...currentToasts.slice(-3), nextToast]);
    window.setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  useEffect(() => {
    toastListeners.add(show);

    return () => {
      toastListeners.delete(show);
    };
  }, [show]);

  const value = useMemo(() => ({ dismiss, show }), [dismiss, show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] grid w-[min(390px,calc(100vw-2rem))] gap-2">
        {toasts.map((currentToast) => {
          const Icon =
            currentToast.type === "error" ? CircleAlert : CheckCircle2;

          return (
            <div
              key={currentToast.id}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border bg-panel-elevated p-3 text-card-foreground shadow-snow-2 backdrop-blur-xl",
                currentToast.type === "error"
                  ? "border-destructive/40"
                  : "border-primary/30"
              )}
              role={currentToast.type === "error" ? "alert" : "status"}
            >
              <span
                className={cn(
                  "grid size-[30px] shrink-0 place-items-center rounded-[9px]",
                  currentToast.type === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/10 text-success"
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">
                  {currentToast.title}
                </div>
                <div className="mt-0.5 break-words text-[11px] leading-[1.45] text-text-secondary">
                  {currentToast.message}
                </div>
              </div>
              <Button
                aria-label="Fechar notificacao"
                className="size-[30px] shrink-0"
                onClick={() => dismiss(currentToast.id)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
