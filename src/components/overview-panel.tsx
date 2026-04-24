import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type OverviewStat = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

type FocusItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function OverviewPanel({
  eyebrow = "Overview",
  title,
  description,
  stats,
  progress,
  focusTitle,
  focusDescription,
  focusItems,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  stats: OverviewStat[];
  progress?: {
    label: string;
    value: number;
    detail: string;
    icon: LucideIcon;
  };
  focusTitle: string;
  focusDescription: string;
  focusItems: FocusItem[];
}) {
  const ProgressIcon = progress?.icon;

  return (
    <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
      <Card className="min-w-0 overflow-hidden border-border/70 bg-card/80 shadow-sm">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-sm sm:tracking-[0.18em]">
                {eyebrow}
              </p>
              <h2 className="mt-2 max-w-xl text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>

            {progress && ProgressIcon ? (
              <div className="min-w-0 rounded-lg border border-border/60 bg-secondary/35 p-4 text-sm">
                <div className="flex min-w-0 items-center gap-2 font-medium">
                  <ProgressIcon className="h-4 w-4 text-primary" />
                  <span className="min-w-0 break-words">{progress.label}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(progress.value, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {progress.detail}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="min-w-0 rounded-lg border border-border/60 bg-background/70 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 break-words text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="shrink-0 rounded-lg bg-secondary p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 border-border/70 bg-gradient-to-br from-[var(--primary-yevox)]/12 via-card to-card shadow-sm">
        <CardContent className="flex h-full min-w-0 flex-col justify-between gap-6 p-4 sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-sm sm:tracking-[0.18em]">
              Next focus
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {focusTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {focusDescription}
            </p>
          </div>

          <div className="grid min-w-0 gap-2 text-sm">
            {focusItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-background/75 p-3"
                >
                  <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span className="min-w-0 break-words">{item.label}</span>
                  </span>
                  <span className="shrink-0 break-words text-right font-semibold">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
