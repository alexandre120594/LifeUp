import type { ReactNode } from "react";

export function MenuPageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
