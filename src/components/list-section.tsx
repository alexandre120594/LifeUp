import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ListSection({
  title,
  description,
  isLoading,
  isEmpty,
  loadingLabel,
  emptyLabel,
  children,
}: {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle className="break-words">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4">
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
