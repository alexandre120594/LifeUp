import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Counter {
  icon: React.ReactNode;
  number?: number;
  name: string;
}

function Counter({ icon, name, number }: Counter) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex min-w-0 items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{name}</div>
          <div className="mt-2 break-words text-2xl font-light tracking-tight sm:text-4xl">
            {number ?? 0}
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-secondary p-3 text-primary">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

export default Counter;
