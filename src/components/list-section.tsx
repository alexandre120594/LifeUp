import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ListSection({
  title,
  description,
  isLoading,
  isEmpty,
  loadingLabel,
  emptyLabel,
  children,
  compact = false,
}: {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyLabel: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden border shadow-sm">
      <CardHeader className={compact ? "shrink-0 gap-1 p-4" : undefined}>
        <CardTitle className="break-words">{title}</CardTitle>
        {description ? (
          <p className={compact ? "hidden text-sm text-muted-foreground sm:block" : "text-sm text-muted-foreground"}>{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className={compact ? "grid min-h-0 min-w-0 flex-1 gap-3 overflow-y-auto p-4 pt-0" : "grid min-w-0 gap-4"}>
        {isLoading ? (
          <p>{loadingLabel ?? "Loading..."}</p>
        ) : isEmpty ? (
          <div className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground sm:p-10">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
