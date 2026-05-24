import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PageHero({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
  stats,
  className,
}: {
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
  className?: string;
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
      <CardContent className="grid min-w-0 gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end md:p-8">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
            <BadgeIcon className="h-4 w-4 text-primary" />
            {badgeLabel}
          </div>
          <div>
            <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>
        <div className={`grid min-w-0 gap-3 text-sm ${statsGridClass}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-lg border border-border/60 bg-background/80 p-4"
            >
              <div className="text-muted-foreground">{stat.label}</div>
              <div className="mt-2 break-words text-2xl font-semibold sm:text-3xl">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
