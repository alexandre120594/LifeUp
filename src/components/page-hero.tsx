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
  return (
    <Card
      className={`overflow-hidden border-0 bg-gradient-to-br from-[var(--primary-yevox)]/15 via-card to-[var(--secondary-yevox)]/70 shadow-sm ${className ?? ""}`.trim()}
    >
      <CardContent className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
            <BadgeIcon className="h-4 w-4 text-primary" />
            {badgeLabel}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>
        <div className={`grid gap-3 text-sm ${stats.length > 2 ? "sm:grid-cols-3" : "grid-cols-2"}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/60 bg-background/80 p-4"
            >
              <div className="text-muted-foreground">{stat.label}</div>
              <div className="mt-2 text-3xl font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
