import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Counter {
  icon: React.ReactNode;
  number?: number;
  name: string;
}

function Counter({ icon, name, number }: Counter) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{name}</div>
          <div className="mt-2 text-4xl font-light tracking-tight">
            {number ?? 0}
          </div>
        </div>
        <span className="rounded-2xl bg-secondary p-3 text-primary">{icon}</span>
      </CardContent>
    </Card>
  );
}

export default Counter;
