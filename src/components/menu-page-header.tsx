import type { ReactNode } from "react";

export function MenuPageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-text-tertiary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 break-words text-2xl font-bold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[28px]">
          {title}
        </h1>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
