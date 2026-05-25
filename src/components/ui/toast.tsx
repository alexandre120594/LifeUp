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
      title: input.title ?? (input.type === "error" ? "Action failed" : "Saved"),
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
      <div className="fixed right-4 top-4 z-[100] grid w-[min(360px,calc(100vw-2rem))] gap-2">
        {toasts.map((currentToast) => {
          const Icon =
            currentToast.type === "error" ? CircleAlert : CheckCircle2;

          return (
            <div
              key={currentToast.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-lg",
                currentToast.type === "error"
                  ? "border-destructive/40"
                  : "border-primary/30"
              )}
              role="status"
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  currentToast.type === "error"
                    ? "text-destructive"
                    : "text-primary"
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  {currentToast.title}
                </div>
                <div className="break-words text-sm text-muted-foreground">
                  {currentToast.message}
                </div>
              </div>
              <Button
                aria-label="Dismiss notification"
                className="h-7 w-7 shrink-0"
                onClick={() => dismiss(currentToast.id)}
                size="icon"
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
