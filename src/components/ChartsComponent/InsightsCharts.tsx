"use client";

import type { CSSProperties } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
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
    label: "Done",
    color: "var(--chart-1)",
  },
  pending: {
    label: "Pending Tasks",
    color: "var(--chart-3)",
  },
  completionRate: {
    label: "Done Rate",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const habitConfig = {
  totalTasks: {
    label: "Linked Tasks",
    color: "var(--chart-3)",
  },
  completedTasks: {
    label: "Completed Tasks",
    color: "var(--chart-1)",
  },
  recentCheckIns: {
    label: "Recent Check-ins",
    color: "var(--chart-2)",
  },
  streak: {
    label: "Streak",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const weakSubjectsConfig = {
  total: {
    label: "Mistakes",
    color: "var(--chart-1)",
  },
  due: {
    label: "Due for review",
    color: "var(--chart-5)",
  },
  unresolved: {
    label: "Unresolved",
    color: "var(--chart-3)",
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
  total: number;
  completionRate: number;
};

type HabitDatum = {
  name: string;
  projectName?: string;
  completedTasks: number;
  recentCheckIns: number;
  streak: number;
  totalTasks: number;
};

type WeakSubjectDatum = {
  due: number;
  mastered: number;
  name: string;
  reviewed: number;
  subjectId: string;
  total: number;
  unresolved: number;
};

function abbreviateAxisLabel(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return words
      .slice(0, 3)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }

  return value.slice(0, 3).toUpperCase();
}

function getChartMinWidth(itemCount: number) {
  return Math.max(520, itemCount * 92);
}

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
    <Card className="min-w-0 overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={activityConfig} className="h-[240px] w-full sm:h-[280px]">
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `${value} activity`}
                  formatter={(value, name) => (
                    <div className="flex min-w-36 items-center justify-between gap-3">
                      <span>
                        {name === "tasksCompleted"
                          ? "Tasks completed"
                          : "Habit check-ins"}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  )}
                />
              }
            />
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
    <Card className="min-w-0 overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <ChartContainer
          config={projectConfig}
          className="h-[260px] w-full min-w-[var(--chart-min-width)] sm:h-[300px]"
          style={
            {
              "--chart-min-width": `${getChartMinWidth(data.length)}px`,
            } as CSSProperties
          }
        >
          <ComposedChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickFormatter={abbreviateAxisLabel}
              tickLine={false}
              axisLine={false}
              interval={0}
              minTickGap={12}
              tickMargin={8}
              height={34}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              yAxisId="tasks"
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, 100]}
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              yAxisId="rate"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const project = payload[0]?.payload as
                      | ProjectDatum
                      | undefined;

                    if (!project) {
                      return null;
                    }

                    return (
                      <div className="grid gap-1">
                        <span>{project.name}</span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {project.total} tasks, {project.habits ?? 0} habits,{" "}
                          {project.completionRate}% done
                        </span>
                      </div>
                    );
                  }}
                  formatter={(value, name) => (
                    <div className="flex min-w-36 items-center justify-between gap-3">
                      <span>
                        {name === "completed"
                          ? "Done tasks"
                          : name === "pending"
                            ? "Pending tasks"
                            : "Done rate"}
                      </span>
                      <span className="font-medium">
                        {value}
                        {name === "completionRate" ? "%" : ""}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[6, 6, 0, 0]}
              yAxisId="tasks"
            />
            <Bar
              dataKey="pending"
              fill="var(--color-pending)"
              radius={[6, 6, 0, 0]}
              yAxisId="tasks"
            />
            <Line
              dataKey="completionRate"
              dot={{ r: 4 }}
              stroke="var(--color-completionRate)"
              strokeWidth={3}
              type="monotone"
              yAxisId="rate"
            />
          </ComposedChart>
        </ChartContainer>
        </div>
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
    <Card className="min-w-0 overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <ChartContainer
          config={habitConfig}
          className="h-[260px] w-full min-w-[var(--chart-min-width)] sm:h-[300px]"
          style={
            {
              "--chart-min-width": `${getChartMinWidth(data.length)}px`,
            } as CSSProperties
          }
        >
          <ComposedChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickFormatter={abbreviateAxisLabel}
              tickLine={false}
              axisLine={false}
              interval={0}
              minTickGap={12}
              tickMargin={8}
              height={34}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              yAxisId="counts"
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              orientation="right"
              tickLine={false}
              yAxisId="streak"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const habit = payload[0]?.payload as HabitDatum | undefined;

                    if (!habit) {
                      return null;
                    }

                    return (
                      <div className="grid gap-1">
                        <span>{habit.name}</span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {habit.projectName ?? "No project"} - {habit.totalTasks} linked tasks
                        </span>
                      </div>
                    );
                  }}
                  formatter={(value, name, item) => {
                    const payload = item.payload as HabitDatum;
                    return (
                      <div className="flex min-w-32 items-center justify-between gap-3">
                        <span>
                          {name === "totalTasks"
                            ? "Linked tasks"
                            : name === "completedTasks"
                              ? "Linked tasks done"
                              : name === "recentCheckIns"
                                ? "Recent check-ins"
                                : "Current streak"}
                        </span>
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
              dataKey="totalTasks"
              fill="var(--color-totalTasks)"
              radius={[6, 6, 0, 0]}
              yAxisId="counts"
            />
            <Bar
              dataKey="completedTasks"
              fill="var(--color-completedTasks)"
              radius={[6, 6, 0, 0]}
              yAxisId="counts"
            />
            <Bar
              dataKey="recentCheckIns"
              fill="var(--color-recentCheckIns)"
              radius={[6, 6, 0, 0]}
              yAxisId="counts"
            />
            <Line
              dataKey="streak"
              dot={{ r: 4 }}
              stroke="var(--color-streak)"
              strokeWidth={3}
              type="monotone"
              yAxisId="streak"
            />
          </ComposedChart>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeakSubjectsChart({
  data,
  title,
  description,
}: {
  data: WeakSubjectDatum[];
  title: string;
  description: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="overflow-x-auto">
            <ChartContainer
              config={weakSubjectsConfig}
              className="h-[260px] w-full min-w-[var(--chart-min-width)] sm:h-[300px]"
              style={
                {
                  "--chart-min-width": `${getChartMinWidth(data.length)}px`,
                } as CSSProperties
              }
            >
              <ComposedChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={abbreviateAxisLabel}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  minTickGap={12}
                  tickMargin={8}
                  height={34}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const subject = payload[0]?.payload as
                          | WeakSubjectDatum
                          | undefined;

                        if (!subject) {
                          return null;
                        }

                        return (
                          <div className="grid gap-1">
                            <span>{subject.name}</span>
                            <span className="text-[11px] font-normal text-muted-foreground">
                              {subject.total} mistakes, {subject.due} due
                            </span>
                          </div>
                        );
                      }}
                      formatter={(value, name) => (
                        <div className="flex min-w-36 items-center justify-between gap-3">
                          <span>
                            {name === "total"
                              ? "Logged mistakes"
                              : name === "due"
                                ? "Due for review"
                                : "Unresolved"}
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="unresolved"
                  fill="var(--color-unresolved)"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  dataKey="due"
                  dot={{ r: 4 }}
                  stroke="var(--color-due)"
                  strokeWidth={3}
                  type="monotone"
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No study mistakes logged yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
