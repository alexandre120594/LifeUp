import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreationFlowCard({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
  children,
}: {
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-[var(--primary-yevox)]/8 via-card to-card shadow-sm">
      <CardHeader className="space-y-3 border-b border-border/60 pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <BadgeIcon className="h-3.5 w-3.5 text-primary" />
          {badgeLabel}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
          <p className="text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

export function CreationStep({
  eyebrow,
  label,
  helper,
  children,
}: {
  eyebrow: string;
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 p-3">
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      {helper ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

export function CreationSummary({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
