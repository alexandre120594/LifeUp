"use client";

import { useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { Button } from "@/components/ui/button";

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

const studyQuestionsConfig = {
  correctQuestions: {
    label: "Right",
    color: "var(--chart-2)",
  },
  wrongQuestions: {
    label: "Wrong",
    color: "var(--chart-5)",
  },
  totalQuestions: {
    label: "Total",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const studyFocusConfig = {
  minutes: {
    label: "Focus minutes",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const studyQuestionsBySubjectConfig = {
  correctQuestions: {
    label: "Right",
    color: "var(--chart-2)",
  },
  wrongQuestions: {
    label: "Wrong",
    color: "var(--chart-5)",
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

type StudyQuestionDatum = {
  correctQuestions: number;
  date: string;
  totalQuestions: number;
  wrongQuestions: number;
};

type StudyFocusSubjectDatum = {
  color?: string | null;
  id: string;
  minutes: number;
  title: string;
};

type StudyQuestionSubjectDatum = {
  accuracyRate: number;
  correctQuestions: number;
  name: string;
  subjectId: string;
  totalQuestions: number;
  wrongQuestions: number;
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

function formatFocusMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
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

export function StudyQuestionsChart({
  accuracyRate,
  data,
  period,
  title,
  totalQuestions,
}: {
  accuracyRate: number;
  data: StudyQuestionDatum[];
  period: "day" | "week" | "month" | "year";
  title: string;
  totalQuestions: number;
}) {
  const hasQuestions = data.some((item) => item.totalQuestions > 0);
  const periodLabel =
    period === "day" ? "today" : `in the current calendar ${period}`;

  return (
    <Card className="min-w-0 overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {totalQuestions} questions {periodLabel}, {accuracyRate}% accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasQuestions ? (
          <ChartContainer
            config={studyQuestionsConfig}
            className="h-[240px] w-full sm:h-[280px]"
          >
            <ComposedChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value} practice`}
                    formatter={(value, name) => (
                      <div className="flex min-w-36 items-center justify-between gap-3">
                        <span>
                          {name === "correctQuestions"
                            ? "Right questions"
                            : name === "wrongQuestions"
                              ? "Wrong questions"
                              : "Total questions"}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="correctQuestions"
                fill="var(--color-correctQuestions)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="wrongQuestions"
                fill="var(--color-wrongQuestions)"
                radius={[6, 6, 0, 0]}
              />
              <Line
                dataKey="totalQuestions"
                dot={{ r: 4 }}
                stroke="var(--color-totalQuestions)"
                strokeWidth={3}
                type="monotone"
              />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No question practice logged yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StudyQuestionsBySubjectChart({
  data,
}: {
  data: StudyQuestionSubjectDatum[];
}) {
  return (
    <Card className="h-full min-w-0 overflow-hidden border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Questions by subject</CardTitle>
        <CardDescription>
          Registered right and wrong question totals for the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer
            config={studyQuestionsBySubjectConfig}
            className="mx-auto h-[310px] w-full sm:h-[360px]"
          >
            <RadarChart
              accessibilityLayer
              data={data}
              outerRadius="65%"
            >
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis
                dataKey="name"
                tickFormatter={abbreviateAxisLabel}
              />
              <PolarRadiusAxis
                allowDecimals={false}
                angle={90}
                axisLine={false}
                tickCount={5}
                tickLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const subject = payload[0]?.payload as
                        | StudyQuestionSubjectDatum
                        | undefined;

                      return subject ? (
                        <div className="grid gap-1">
                          <span>{subject.name}</span>
                          <span className="text-[11px] font-normal text-muted-foreground">
                            {subject.totalQuestions} total,{" "}
                            {subject.accuracyRate}% accuracy
                          </span>
                        </div>
                      ) : (
                        "Subject"
                      );
                    }}
                    formatter={(value, name) => (
                      <div className="flex min-w-36 items-center justify-between gap-3">
                        <span>
                          {name === "correctQuestions"
                            ? "Right questions"
                            : "Wrong questions"}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )}
                  />
                }
              />
              <Radar
                dataKey="correctQuestions"
                fill="var(--color-correctQuestions)"
                fillOpacity={0.28}
                stroke="var(--color-correctQuestions)"
                strokeWidth={3}
              />
              <Radar
                dataKey="wrongQuestions"
                fill="var(--color-wrongQuestions)"
                fillOpacity={0.2}
                stroke="var(--color-wrongQuestions)"
                strokeWidth={3}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </RadarChart>
          </ChartContainer>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No question registrations for this period and subject.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StudyFocusBySubjectChart({
  data,
}: {
  data: StudyFocusSubjectDatum[];
}) {
  const pageSize = 5;
  const [page, setPage] = useState(0);
  const sortedData = [...data].sort((a, b) => b.minutes - a.minutes);
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleData = sortedData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalMinutes = data.reduce((total, item) => total + item.minutes, 0);
  const topSubject = sortedData[0];
  const maxMinutes = Math.max(...sortedData.map((item) => item.minutes), 0);
  const useHoursScale = maxMinutes >= 120;

  return (
    <Card className="h-full min-w-0 overflow-hidden border shadow-sm">
      <CardHeader className="gap-2 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Studied time by subject</CardTitle>
            <CardDescription>
              Actual study time registered through Study Plan.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {formatFocusMinutes(totalMinutes)} total
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {sortedData.length} subjects
            </span>
          </div>
        </div>
        <CardDescription>
          {totalMinutes === 0 && sortedData.length
            ? "No studied time is registered for these subjects yet."
            : topSubject
            ? `${topSubject.title} leads with ${formatFocusMinutes(topSubject.minutes)}.`
            : "Register studied time in Study Plan to build this comparison."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {visibleData.length ? (
          <ChartContainer
            config={studyFocusConfig}
            className="h-[260px] w-full sm:h-[300px]"
          >
            <BarChart
              accessibilityLayer
              data={visibleData}
              layout="vertical"
              margin={{ left: 0, right: 54 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                allowDecimals={false}
                axisLine={false}
                tickFormatter={(value) =>
                  useHoursScale
                    ? `${Math.round((Number(value) / 60) * 10) / 10}h`
                    : `${value}m`
                }
                tickLine={false}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="title"
                tickFormatter={(value) =>
                  value.length > 14 ? `${value.slice(0, 14)}…` : value
                }
                tickLine={false}
                type="category"
                width={104}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const subject = payload[0]?.payload as
                        | StudyFocusSubjectDatum
                        | undefined;

                      return subject?.title ?? "Subject";
                    }}
                    formatter={(value) => {
                      const minutes = Number(value);
                      const share =
                        totalMinutes > 0
                          ? Math.round((minutes / totalMinutes) * 100)
                          : 0;

                      return (
                        <div className="grid min-w-40 gap-1">
                          <div className="flex items-center justify-between gap-3">
                            <span>Focused time</span>
                            <span className="font-medium">
                              {formatFocusMinutes(minutes)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-muted-foreground">
                            <span>Share of total</span>
                            <span>{share}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                background={{ fill: "var(--secondary)", radius: 7 }}
                barSize={12}
                dataKey="minutes"
                fill="var(--color-minutes)"
                radius={[0, 7, 7, 0]}
              >
                {visibleData.map((subject) => (
                  <Cell
                    fill={subject.color ?? "var(--color-minutes)"}
                    key={subject.id}
                  />
                ))}
                <LabelList
                  className="fill-foreground font-semibold"
                  dataKey="minutes"
                  formatter={(value: number) => formatFocusMinutes(value)}
                  position="right"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            Register studied time in Study Plan to compare subjects.
          </p>
        )}
        {sortedData.length > pageSize ? (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">
              {currentPage * pageSize + 1}–
              {Math.min((currentPage + 1) * pageSize, sortedData.length)} of{" "}
              {sortedData.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                disabled={currentPage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                size="sm"
                type="button"
                variant="outline"
              >
                Previous
              </Button>
              <span className="min-w-14 text-center text-xs font-medium">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                disabled={currentPage >= totalPages - 1}
                onClick={() =>
                  setPage((current) => Math.min(totalPages - 1, current + 1))
                }
                size="sm"
                type="button"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
