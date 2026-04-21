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
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
          <p>{loadingLabel ?? "Loading..."}</p>
        ) : isEmpty ? (
          <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
