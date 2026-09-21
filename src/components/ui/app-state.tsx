"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateBlockProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export function LoadingState({
  className,
  title = "Carregando",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border bg-panel p-4 text-[13px] text-text-secondary",
        className
      )}
      role="status"
    >
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
      {title}
    </div>
  );
}

export function EmptyState({
  action,
  className,
  description,
  title,
}: StateBlockProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-panel p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-text-secondary">
          <Inbox className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          {description ? (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          ) : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({
  action,
  className,
  description,
  title,
}: StateBlockProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/5 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-medium text-destructive">{title}</p>
          {description ? (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          ) : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function RetryButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} size="sm" type="button" variant="outline">
      Tentar novamente
    </Button>
  );
}

export function FieldError({
  children,
  id,
}: {
  children?: ReactNode;
  id: string;
}) {
  if (!children) {
    return null;
  }

  return (
    <p className="text-xs font-medium text-destructive" id={id}>
      {children}
    </p>
  );
}
