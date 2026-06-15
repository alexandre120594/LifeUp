"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  GraduationCap,
  LibraryBig,
  ListChecks,
  Percent,
  Target,
  TimerReset,
} from "lucide-react";
import { StudyQuestionsChart } from "@/components/ChartsComponent/InsightsCharts";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStudyMistakes } from "@/hooks/useStudyMistakeMutations";
import {
  useStudyQuestionPractice,
  useStudySchedule,
  useStudySubjects,
} from "@/hooks/useStudyMutations";
import {
  buildStudyQuestionTrend,
  getStudyQuestionSummary,
} from "@/lib/analytics";
import type { StudyMistake } from "@/types/BaseInterfaces";
import { cn } from "@/lib/utils";

function isDueForReview(mistake: StudyMistake) {
  if (!mistake.reviewDate) {
    return false;
  }

  const reviewDate = new Date(mistake.reviewDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return mistake.status !== "mastered" && reviewDate <= today;
}

function formatDate(date?: Date | string | null) {
  if (!date) {
    return "Not scheduled";
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

function getPressureTone(total: number) {
  if (total >= 8) {
    return "bg-destructive";
  }

  if (total >= 4) {
    return "bg-primary";
  }

  return "bg-muted-foreground";
}

function StudyActionCard({
  description,
  href,
  icon: Icon,
  label,
  meta,
}: {
  description: string;
  href: string;
  icon: typeof GraduationCap;
  label: string;
  meta: string;
}) {
  return (
    <Link
      className="group grid min-w-0 gap-3 rounded-lg border border-border/70 bg-card p-4 shadow-sm transition-colors hover:border-primary/50 hover:bg-secondary/35"
      href={href}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-semibold">{label}</div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Badge className="w-fit" variant="outline">
        {meta}
      </Badge>
    </Link>
  );
}

function StudyMetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="rounded-md bg-secondary p-1.5 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 break-words text-3xl font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function AccuracyPanel({
  correct,
  rate,
  total,
  wrong,
}: {
  correct: number;
  rate: number;
  total: number;
  wrong: number;
}) {
  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Question accuracy
        </CardTitle>
        <CardDescription>
          Right and wrong answers from the current seven-day window.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border/70 bg-background/75 p-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="mt-1 text-xl font-semibold">{total}</div>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/75 p-3">
            <div className="text-xs text-muted-foreground">Right</div>
            <div className="mt-1 text-xl font-semibold">{correct}</div>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/75 p-3">
            <div className="text-xs text-muted-foreground">Wrong</div>
            <div className="mt-1 text-xl font-semibold">{wrong}</div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-semibold">{rate}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(Math.max(rate, 0), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectPressurePanel({
  subjects,
}: {
  subjects: Array<{
    color?: string | null;
    id: string;
    name: string;
    total: number;
  }>;
}) {
  const maxTotal = Math.max(...subjects.map((subject) => subject.total), 1);
  const visibleSubjects = subjects.filter((subject) => subject.total > 0).slice(0, 8);

  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Subject pressure
        </CardTitle>
        <CardDescription>
          Mistake volume by subject, ordered by review pressure.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {visibleSubjects.length ? (
          visibleSubjects.map((subject) => {
            const width = Math.round((subject.total / maxTotal) * 100);

            return (
              <Link
                className="grid min-w-0 gap-2 rounded-lg border border-border/70 bg-background/75 p-3 transition-colors hover:bg-secondary/35"
                href="/study/mistakes"
                key={subject.id}
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color ?? "#38bdf8" }}
                    />
                    <span className="truncate font-medium">{subject.name}</span>
                  </div>
                  <Badge variant="outline">{subject.total}</Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full", getPressureTone(subject.total))}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </Link>
            );
          })
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No subject pressure yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewQueuePanel({
  isLoading,
  mistakes,
}: {
  isLoading: boolean;
  mistakes: StudyMistake[];
}) {
  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Due for review</CardTitle>
            <CardDescription>
              Mistakes with a review date up to today and not mastered.
            </CardDescription>
          </div>
          <Badge variant="outline">{mistakes.length} due</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isLoading ? (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            Loading study review queue...
          </p>
        ) : mistakes.length ? (
          mistakes.slice(0, 5).map((mistake) => (
            <Link
              className="grid min-w-0 gap-2 rounded-lg border border-border/70 bg-background/75 p-4 transition-colors hover:bg-secondary/35"
              href="/study/mistakes"
              key={mistake.id}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge>{mistake.subject?.name ?? "Subject"}</Badge>
                <span>{formatDate(mistake.reviewDate)}</span>
                <span>{mistake.errorType}</span>
              </div>
              <div className="break-words text-sm font-semibold [overflow-wrap:anywhere]">
                {mistake.question}
              </div>
              <div className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                Rule: {mistake.correctRule}
              </div>
            </Link>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No due mistakes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudyDashboardPage() {
  const { data: mistakes = [], isLoading: isMistakesLoading } =
    useStudyMistakes();
  const { data: subjects = [] } = useStudySubjects();
  const { data: schedule = [] } = useStudySchedule();
  const questionPracticeWindow = getQuestionPracticeWindow();
  const { data: questionPractice = [] } = useStudyQuestionPractice(
    questionPracticeWindow
  );

  const mastered = mistakes.filter((mistake) => mistake.status === "mastered");
  const dueMistakes = mistakes.filter(isDueForReview);
  const subjectCounts = subjects
    .map((subject) => ({
      color: subject.color,
      id: subject.id,
      name: subject.name,
      total: mistakes.filter((mistake) => mistake.subjectId === subject.id)
        .length,
    }))
    .sort((a, b) => b.total - a.total);
  const masteryRate = mistakes.length
    ? Math.round((mastered.length / mistakes.length) * 100)
    : 0;
  const questionTrend = buildStudyQuestionTrend(questionPractice);
  const questionSummary = getStudyQuestionSummary(questionPractice);
  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Study tools"
        title="Study Dashboard"
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/pomodoro">
                <TimerReset className="h-4 w-4" />
                Focus timer
              </Link>
            </Button>
            <Button asChild>
              <Link href="/study/mistakes">
                <AlertCircle className="h-4 w-4" />
                Open mistake log
              </Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 md:grid-cols-3">
        <StudyActionCard
          description="Build the week board and register studied time."
          href="/study/planner"
          icon={ListChecks}
          label="Study Plan"
          meta={`${schedule.length} scheduled`}
        />
        <StudyActionCard
          description="Work through due questions and correction patterns."
          href="/study/mistakes"
          icon={AlertCircle}
          label="Mistake Log"
          meta={`${dueMistakes.length} due`}
        />
        <StudyActionCard
          description="Start a standalone study focus session."
          href="/pomodoro"
          icon={TimerReset}
          label="Focus Timer"
          meta={`${questionSummary.accuracyRate}% accuracy`}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StudyMetricCard icon={AlertCircle} label="Mistakes" value={mistakes.length} />
        <StudyMetricCard
          icon={CalendarClock}
          label="Due review"
          value={dueMistakes.length}
        />
        <StudyMetricCard icon={LibraryBig} label="Subjects" value={subjects.length} />
        <StudyMetricCard
          icon={Target}
          label="Mastery"
          value={`${masteryRate}%`}
        />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <StudyQuestionsChart
          accuracyRate={questionSummary.accuracyRate}
          data={questionTrend}
          title="Question practice"
          totalQuestions={questionSummary.totalQuestions}
        />
        <AccuracyPanel
          correct={questionSummary.correctQuestions}
          rate={questionSummary.accuracyRate}
          total={questionSummary.totalQuestions}
          wrong={questionSummary.wrongQuestions}
        />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ReviewQueuePanel
          isLoading={isMistakesLoading}
          mistakes={dueMistakes}
        />
        <SubjectPressurePanel subjects={subjectCounts} />
      </section>
    </div>
  );
}
