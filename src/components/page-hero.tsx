import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PageHero({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
  stats,
  className,
  compact = false,
}: {
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
  className?: string;
  compact?: boolean;
}) {
  const statsGridClass =
    stats.length > 3
      ? "grid-cols-2"
      : stats.length > 2
        ? "sm:grid-cols-3"
        : "grid-cols-2";

  return (
    <Card
      className={`overflow-hidden border-0 bg-gradient-to-br from-[var(--primary-yevox)]/15 via-card to-[var(--secondary-yevox)]/70 shadow-sm ${className ?? ""}`.trim()}
    >
      <CardContent
        className={
          compact
            ? "grid min-w-0 gap-3 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            : "grid min-w-0 gap-6 p-4 sm:p-6 md:p-8"
        }
      >
        <div className={compact ? "min-w-0 space-y-2" : "min-w-0 space-y-3"}>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
            <BadgeIcon className="h-4 w-4 text-primary" />
            {badgeLabel}
          </div>
          <div>
            <h1
              className={
                compact
                  ? "break-words text-2xl font-semibold tracking-tight sm:text-3xl"
                  : "break-words text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
              }
            >
              {title}
            </h1>
            <p
              className={
                compact
                  ? "mt-1 max-w-2xl text-sm leading-5 text-muted-foreground"
                  : "mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base"
              }
            >
              {description}
            </p>
          </div>
        </div>
        <div
          className={
            compact
              ? `grid min-w-0 gap-2 text-sm ${statsGridClass}`
              : `grid min-w-0 gap-3 text-sm ${statsGridClass}`
          }
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={
                compact
                  ? "min-w-0 rounded-md border border-border/60 bg-background/80 px-3 py-2"
                  : "min-w-0 rounded-lg border border-border/60 bg-background/80 p-4"
              }
            >
              <div className="text-muted-foreground">{stat.label}</div>
              <div
                className={
                  compact
                    ? "mt-1 break-words text-xl font-semibold"
                    : "mt-2 break-words text-2xl font-semibold sm:text-3xl"
                }
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
