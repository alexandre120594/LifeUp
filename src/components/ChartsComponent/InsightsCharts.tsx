"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const activityConfig = {
  tasksCompleted: {
    label: "Tasks Completed",
    color: "var(--chart-1)",
  },
  habitCheckIns: {
    label: "Habit Check-ins",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const projectConfig = {
  completed: {
    label: "Completed Tasks",
    color: "var(--chart-1)",
  },
  pending: {
    label: "Pending Tasks",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const habitConfig = {
  completedTasks: {
    label: "Completed Tasks",
    color: "var(--chart-1)",
  },
  recentCheckIns: {
    label: "Recent Check-ins",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ActivityDatum = {
  date: string;
  tasksCompleted: number;
  habitCheckIns: number;
};

type ProjectDatum = {
  name: string;
  completed: number;
  pending: number;
  habits?: number;
};

type HabitDatum = {
  name: string;
  completedTasks: number;
  recentCheckIns: number;
  streak: number;
};

export function ActivityTrendChart({
  data,
  title,
  description,
}: {
  data: ActivityDatum[];
  title: string;
  description: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={activityConfig} className="h-[280px] w-full">
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="tasksCompleted"
              stroke="var(--color-tasksCompleted)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="habitCheckIns"
              stroke="var(--color-habitCheckIns)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ProjectPerformanceChart({
  data,
  title,
  description,
}: {
  data: ProjectDatum[];
  title: string;
  description: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={projectConfig} className="h-[280px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-12}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="pending"
              fill="var(--color-pending)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function HabitPerformanceChart({
  data,
  title,
  description,
}: {
  data: HabitDatum[];
  title: string;
  description: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={habitConfig} className="h-[280px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-12}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    const payload = item.payload as HabitDatum;
                    return (
                      <div className="flex min-w-32 items-center justify-between gap-3">
                        <span>{name}</span>
                        <span className="font-medium">
                          {value}
                          {name === "recentCheckIns"
                            ? ` (${payload.streak} streak)`
                            : ""}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey="completedTasks"
              fill="var(--color-completedTasks)"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="recentCheckIns"
              fill="var(--color-recentCheckIns)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
