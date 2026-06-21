"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  GraduationCap,
  LibraryBig,
  ListChecks,
  Percent,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import {
  StudyFocusBySubjectChart,
  StudyQuestionsBySubjectChart,
  StudyQuestionsChart,
} from "@/components/ChartsComponent/InsightsCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudyMistakes } from "@/hooks/useStudyMistakeMutations";
import { usePomodoroDashboard } from "@/hooks/usePomodoroMutations";
import {
  useStudyQuestionPractice,
  useStudySchedule,
  useStudySubjects,
} from "@/hooks/useStudyMutations";
import {
  buildStudyQuestionsBySubject,
  buildStudyQuestionTrend,
  getStudyQuestionPeriodRange,
  getStudyQuestionSummary,
  type StudyQuestionPeriod,
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

function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
      className="group grid min-h-44 min-w-0 gap-3 rounded-xl border border-border/70 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
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

function DashboardSectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof GraduationCap;
  title: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
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
  const [questionPeriod, setQuestionPeriod] =
    useState<StudyQuestionPeriod>("week");
  const [questionSubjectId, setQuestionSubjectId] = useState("all");
  const { data: mistakes = [], isLoading: isMistakesLoading } =
    useStudyMistakes();
  const { data: subjects = [] } = useStudySubjects();
  const { data: schedule = [] } = useStudySchedule();
  const { data: pomodoro } = usePomodoroDashboard();
  const questionPracticeWindow = getQuestionPracticeWindow();
  const { data: questionPractice = [] } = useStudyQuestionPractice(
    questionPracticeWindow
  );
  const subjectQuestionFilters = useMemo(
    () => ({
      ...getStudyQuestionPeriodRange(questionPeriod),
      ...(questionSubjectId === "all"
        ? {}
        : { subjectId: questionSubjectId }),
    }),
    [questionPeriod, questionSubjectId]
  );
  const { data: subjectQuestionPractice = [] } = useStudyQuestionPractice(
    subjectQuestionFilters
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
  const todayQuestionSummary = getStudyQuestionSummary(
    questionPractice.filter(
      (practice) => toDayKey(practice.practiceDate) === toDayKey(new Date())
    )
  );
  const questionsBySubject = buildStudyQuestionsBySubject(
    subjectQuestionPractice
  );
  const totalFocusMinutes = pomodoro?.totalMinutes ?? 0;
  const heroRecommendation =
    dueMistakes.length > 0
      ? `Start with ${dueMistakes.length} due review${dueMistakes.length === 1 ? "" : "s"} before opening a new study block.`
      : todayQuestionSummary.totalQuestions === 0
        ? "Register a question session today to keep your study history current."
        : "Your review queue is clear. Continue with the next planned study block.";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 md:p-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/12 via-card to-accent/20 shadow-sm">
        <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Study command center
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Study Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {heroRecommendation}
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Questions today",
                  value: todayQuestionSummary.totalQuestions,
                },
                {
                  label: "7-day accuracy",
                  value: `${questionSummary.accuracyRate}%`,
                },
                {
                  label: "Due reviews",
                  value: dueMistakes.length,
                },
                {
                  label: "Focus saved",
                  value: formatMinutes(totalFocusMinutes),
                },
              ].map((item) => (
                <div
                  className="rounded-lg border border-border/60 bg-background/65 px-3 py-2.5 backdrop-blur-sm"
                  key={item.label}
                >
                  <div className="text-xs text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:max-w-48 xl:flex-col">
            <Button asChild className="flex-1 xl:w-full">
              <Link href="/study/planner">
                <ListChecks className="h-4 w-4" />
                Open study plan
              </Link>
            </Button>
            <Button asChild className="flex-1 xl:w-full" variant="outline">
              <Link href="/study/mistakes">
                <AlertCircle className="h-4 w-4" />
                Review mistakes
              </Link>
            </Button>
            <Button asChild className="flex-1 xl:w-full" variant="outline">
              <Link href="/pomodoro">
                <TimerReset className="h-4 w-4" />
                Start focus
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <DashboardSectionHeader
          description="Jump directly into planning, correction, or focused study."
          icon={GraduationCap}
          title="Study workspace"
        />
        <div className="grid gap-3 md:grid-cols-3">
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
        </div>
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

      <section className="space-y-4">
        <DashboardSectionHeader
          description="Track recent volume, accuracy, and subject-level performance."
          icon={Target}
          title="Question performance"
        />
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
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
        </div>
        <div className="grid min-w-0 gap-3">
          <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-semibold">Compare subjects</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Narrow the radar to the calendar period and subject you need.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Period
                <Select
                  value={questionPeriod}
                  onValueChange={(value) =>
                    setQuestionPeriod(value as StudyQuestionPeriod)
                  }
                >
                  <SelectTrigger className="sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Current day</SelectItem>
                    <SelectItem value="week">Current week</SelectItem>
                    <SelectItem value="month">Current month</SelectItem>
                    <SelectItem value="year">Current year</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Subject
                <Select
                  value={questionSubjectId}
                  onValueChange={setQuestionSubjectId}
                >
                  <SelectTrigger className="sm:w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          </div>
          <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-2">
            <StudyQuestionsBySubjectChart data={questionsBySubject} />
            <StudyFocusBySubjectChart data={pomodoro?.bySubject ?? []} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <DashboardSectionHeader
          description="Prioritize overdue reviews and subjects with the most correction pressure."
          icon={AlertCircle}
          title="Review priorities"
        />
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ReviewQueuePanel
            isLoading={isMistakesLoading}
            mistakes={dueMistakes}
          />
          <SubjectPressurePanel subjects={subjectCounts} />
        </div>
      </section>
    </div>
  );
}
