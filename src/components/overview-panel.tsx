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
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
      <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>

            {progress && ProgressIcon ? (
              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <ProgressIcon className="h-4 w-4 text-primary" />
                  {progress.label}
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

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="rounded-xl bg-secondary p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 text-4xl font-semibold tracking-tight">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-gradient-to-br from-[var(--primary-yevox)]/12 via-card to-card shadow-sm">
        <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Next focus
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {focusTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {focusDescription}
            </p>
          </div>

          <div className="grid gap-2 text-sm">
            {focusItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-background/75 p-3"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
