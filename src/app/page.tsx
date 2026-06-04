"use client";

import { useState } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  FolderKanban,
  ListTodo,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import { useHabit } from "@/hooks/useHabitMutations";
import { useFinanceDashboard } from "@/hooks/useFinanceMutations";
import { useStudyMistakes } from "@/hooks/useStudyMistakeMutations";
import { useStudyQuestionPractice } from "@/hooks/useStudyMutations";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import {
  ActivityTrendChart,
  StudyQuestionsChart,
  WeakSubjectsChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { EntityCreateDialog } from "@/components/entity-create-dialog";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import TaskList from "./tasks/components/TaskListWithPagination";
import {
  buildActivityTrend,
  buildStudyQuestionTrend,
  buildWeakSubjectMistakes,
  getDueStudyMistakes,
  getStudyQuestionSummary,
  getTaskSummary,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { CurrentUserName } from "@/components/current-user-name";
import type { Habit, StudyMistake, Task } from "@/types/BaseInterfaces";

const dueReviewPageSize = 4;

const radialChartConfig = {
  data: {
    label: "Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

function toDayKey(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function getQuestionPracticeWindow() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(today.getDate() - 6);

  return {
    from: toDayKey(from),
    to: toDayKey(today),
  };
}

function DailyWeeklyTracker({
  habits = [],
  tasks = [],
}: {
  habits?: Habit[];
  tasks?: Task[];
}) {
  const todayKey = toDayKey(new Date());
  const dailyHabits = habits.filter((habit) => habit.frequency !== "weekly");
  const weeklyHabits = habits.filter((habit) => habit.frequency === "weekly");
  const todayTasks = tasks
    .filter((task) => toDayKey(task.date ?? new Date()) === todayKey)
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
  const dueToday = todayTasks.filter((task) => !task.completed);

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Daily / weekly tracker
        </CardTitle>
        <CardDescription>
          Today&apos;s scheduled tasks and routine cadence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">Due today</div>
            <div className="mt-1 text-2xl font-semibold">{dueToday.length}</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">Daily habits</div>
            <div className="mt-1 text-2xl font-semibold">{dailyHabits.length}</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">Weekly habits</div>
            <div className="mt-1 text-2xl font-semibold">{weeklyHabits.length}</div>
          </div>
        </div>

        <div className="grid gap-2">
          {todayTasks.length ? (
            todayTasks.slice(0, 5).map((task) => (
              <div
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-secondary/35 p-3 text-sm"
                key={task.id}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{task.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {task.project?.title ?? "Project task"}
                  </div>
                </div>
                <span className="shrink-0 rounded-md bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">
                  {task.time || "Anytime"}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              No tasks scheduled for today.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatReviewDate(date?: Date | string | null) {
  if (!date) {
    return "Not scheduled";
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function StudyReviewQueue({ mistakes = [] }: { mistakes?: StudyMistake[] }) {
  const [page, setPage] = useState(1);
  const dueMistakes = getDueStudyMistakes(mistakes);
  const totalPages = Math.max(Math.ceil(dueMistakes.length / dueReviewPageSize), 1);
  const visibleMistakes = dueMistakes.slice(
    (page - 1) * dueReviewPageSize,
    page * dueReviewPageSize
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5 text-primary" />
          Due for review
        </CardTitle>
        <CardDescription>
          Mistakes with a review date up to today and not mastered.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleMistakes.length ? (
          visibleMistakes.map((mistake) => (
            <div
              className="grid min-w-0 gap-2 rounded-lg border border-border/60 bg-background/70 p-3 text-sm"
              key={mistake.id}
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {mistake.subject?.name ?? "Subject"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {mistake.errorType}
                  </div>
                </div>
                <Badge className="shrink-0" variant="outline">
                  {formatReviewDate(mistake.reviewDate)}
                </Badge>
              </div>
              <p className="line-clamp-2 text-muted-foreground">
                {mistake.question}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No mistakes are due for review.
          </p>
        )}

        {dueMistakes.length > dueReviewPageSize ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                type="button"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages))
                }
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

export default function DashboardPage() {
  const { data: projects } = useProjects();
  const { data: tasks } = useTask();
  const { data: habits } = useHabit();
  const { data: finance } = useFinanceDashboard();
  const { data: studyMistakes } = useStudyMistakes();
  const questionPracticeWindow = getQuestionPracticeWindow();
  const { data: questionPractice } = useStudyQuestionPractice(
    questionPracticeWindow
  );

  const taskSummary = getTaskSummary(tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const weakSubjects = buildWeakSubjectMistakes(studyMistakes ?? []).slice(0, 8);
  const questionTrend = buildStudyQuestionTrend(questionPractice ?? []);
  const questionSummary = getStudyQuestionSummary(questionPractice ?? []);
  const financeSummary = finance?.summary;
  const totalCash = financeSummary?.netCashFlow ?? 0;
  const projectsOnStreak = (projects ?? []).filter(
    (project) => (project.streakGlobal ?? 0) > 0
  ).length;

  const radialChartData = [
    {
      bucket: "progress",
      data: taskSummary.completed,
      fill: "var(--color-progress)",
    },
  ];

  const overviewStats = [
    {
      label: "Projects",
      value: projects?.length ?? 0,
      icon: FolderKanban,
    },
    {
      label: "Project streaks",
      value: projectsOnStreak,
      icon: Flame,
    },
    {
      label: "Tasks",
      value: tasks?.length ?? 0,
      icon: ListTodo,
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Welcome back,"
        title={<CurrentUserName />}
        action={<EntityCreateDialog />}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold sm:text-base">
        <span className="text-muted-foreground">
          Here&apos;s our situation now:
        </span>
        <span className="text-emerald-600">
          Income {formatCurrency(financeSummary?.totalIncome ?? 0)}
        </span>
        <span className="text-red-600">
          Expenses {formatCurrency(financeSummary?.totalExpenses ?? 0)}
        </span>
        <span
          className={cn(totalCash < 0 ? "text-red-600" : "text-emerald-600")}
        >
          Total cash {formatCurrency(totalCash)}
        </span>
      </div>

      <OverviewPanel
        title="Your workspace at a glance"
        description="Create less clutter, focus on current progress, and jump into the pieces that need attention."
        stats={overviewStats}
        progress={{
          label: `${taskSummary.completionRate}% complete`,
          value: taskSummary.completionRate,
          detail: `${taskSummary.completed} done, ${taskSummary.pending} still open`,
          icon: CheckCircle2,
        }}
        focusTitle="Keep the queue clean"
        focusDescription="Use the popup to add a project, habit, or task without leaving the dashboard."
        focusItems={[
          {
            label: "Pending tasks",
            value: taskSummary.pending,
            icon: Clock3,
          },
          {
            label: "Completed tasks",
            value: taskSummary.completed,
            icon: CheckCircle2,
          },
        ]}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
        <ActivityTrendChart
          title="Last 7 Days Activity"
          description="Tasks completed and habit check-ins by day"
          data={activityTrend}
        />

        <ChartRadialText
          title="Task Completion"
          description="Current progress across all tasks"
          type="done"
          chartConfig={radialChartConfig}
          chartData={radialChartData}
          tamanho={taskSummary.total}
        >
          <div className="text-center text-sm text-muted-foreground">
            {taskSummary.pending} pending tasks left
          </div>
        </ChartRadialText>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <WeakSubjectsChart
          title="Weak Subjects"
          description="Subjects with the most logged mistakes, with due reviews highlighted."
          data={weakSubjects}
        />
        <StudyReviewQueue mistakes={studyMistakes} />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StudyQuestionsChart
          accuracyRate={questionSummary.accuracyRate}
          data={questionTrend}
          title="Study Questions"
          totalQuestions={questionSummary.totalQuestions}
        />
        <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              Question accuracy
            </CardTitle>
            <CardDescription>
              Right and wrong answers from finished study blocks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="text-xs text-muted-foreground">Right</div>
              <div className="mt-1 text-2xl font-semibold">
                {questionSummary.correctQuestions}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="text-xs text-muted-foreground">Wrong</div>
              <div className="mt-1 text-2xl font-semibold">
                {questionSummary.wrongQuestions}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="mt-1 text-2xl font-semibold">
                {questionSummary.accuracyRate}%
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <DailyWeeklyTracker habits={habits} tasks={tasks} />
        <TaskList tasks={tasks} />
      </section>
    </div>
  );
}
