"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  GraduationCap,
  ListChecks,
  Percent,
  ShieldCheck,
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
import {
  useStudyQuestionPractice,
  useStudySessions,
  useStudySubjects,
} from "@/hooks/useStudyMutations";
import {
  buildStudiedTimeBySubject,
  buildStudyQuestionsBySubject,
  buildStudyQuestionTrend,
  filterStudyMistakesByPeriod,
  filterStudySessionsByPeriod,
  getStudyQuestionPeriodRange,
  getStudyQuestionSummary,
  getStudyReviewsForPeriod,
  type StudyQuestionPeriod,
} from "@/lib/analytics";
import type { StudyMistake } from "@/types/BaseInterfaces";
import { cn } from "@/lib/utils";

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

function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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

function AccuracyPanel({
  correct,
  period,
  rate,
  total,
  wrong,
}: {
  correct: number;
  period: StudyQuestionPeriod;
  rate: number;
  total: number;
  wrong: number;
}) {
  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardHeader className="gap-3">
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Question accuracy
        </CardTitle>
        <CardDescription>
          Right and wrong answers from the selected calendar {period}.
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

function CompactPagination({
  itemLabel,
  onPageChange,
  page,
  pageSize,
  totalItems,
}: {
  itemLabel: string;
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  totalItems: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
      <span className="text-xs text-muted-foreground">
        {page * pageSize + 1}–
        {Math.min((page + 1) * pageSize, totalItems)} of {totalItems}{" "}
        {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <Button
          disabled={page === 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          size="sm"
          type="button"
          variant="outline"
        >
          Previous
        </Button>
        <span className="min-w-14 text-center text-xs font-medium">
          {page + 1} / {totalPages}
        </span>
        <Button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          size="sm"
          type="button"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
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
  const pageSize = 5;
  const [page, setPage] = useState(0);
  const pressureSubjects = subjects.filter((subject) => subject.total > 0);
  const totalPages = Math.max(1, Math.ceil(pressureSubjects.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleSubjects = pressureSubjects.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const maxTotal = Math.max(
    ...pressureSubjects.map((subject) => subject.total),
    1
  );

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
        <CompactPagination
          itemLabel="subjects"
          onPageChange={setPage}
          page={currentPage}
          pageSize={pageSize}
          totalItems={pressureSubjects.length}
        />
      </CardContent>
    </Card>
  );
}

function ReviewQueuePanel({
  isLoading,
  mistakes,
  period,
}: {
  isLoading: boolean;
  mistakes: StudyMistake[];
  period: StudyQuestionPeriod;
}) {
  const pageSize = 5;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(mistakes.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleMistakes = mistakes.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Due for review</CardTitle>
            <CardDescription>
              Non-mastered reviews due in the current calendar {period}.
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
        ) : visibleMistakes.length ? (
          visibleMistakes.map((mistake) => (
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
        <CompactPagination
          itemLabel="reviews"
          onPageChange={setPage}
          page={currentPage}
          pageSize={pageSize}
          totalItems={mistakes.length}
        />
      </CardContent>
    </Card>
  );
}

export default function StudyDashboardPage() {
  const [dashboardPeriod, setDashboardPeriod] =
    useState<StudyQuestionPeriod>("week");
  const [questionSubjectId, setQuestionSubjectId] = useState("all");
  const { data: mistakes = [], isLoading: isMistakesLoading } =
    useStudyMistakes();
  const { data: subjects = [] } = useStudySubjects();
  const { data: studySessions = [] } = useStudySessions();
  const dashboardQuestionFilters = useMemo(
    () => ({
      ...getStudyQuestionPeriodRange(dashboardPeriod),
      ...(questionSubjectId === "all"
        ? {}
        : { subjectId: questionSubjectId }),
    }),
    [dashboardPeriod, questionSubjectId]
  );
  const { data: filteredQuestionPractice = [] } = useStudyQuestionPractice(
    dashboardQuestionFilters
  );
  const allSubjectQuestionFilters = useMemo(
    () => getStudyQuestionPeriodRange(dashboardPeriod),
    [dashboardPeriod]
  );
  const { data: allSubjectQuestionPractice = [] } = useStudyQuestionPractice(
    allSubjectQuestionFilters
  );

  const periodMistakes = filterStudyMistakesByPeriod(
    mistakes,
    dashboardPeriod
  );
  const periodSessions = filterStudySessionsByPeriod(
    studySessions,
    dashboardPeriod
  );
  const mastered = periodMistakes.filter(
    (mistake) => mistake.status === "mastered"
  );
  const dueMistakes = getStudyReviewsForPeriod(mistakes, dashboardPeriod);
  const subjectCounts = subjects
    .map((subject) => ({
      color: subject.color,
      id: subject.id,
      name: subject.name,
      total: periodMistakes.filter(
        (mistake) => mistake.subjectId === subject.id
      ).length,
    }))
    .sort((a, b) => b.total - a.total);
  const masteryRate = periodMistakes.length
    ? Math.round((mastered.length / periodMistakes.length) * 100)
    : 0;
  const questionTrend = buildStudyQuestionTrend(
    allSubjectQuestionPractice,
    dashboardPeriod
  );
  const questionPerformanceSummary = getStudyQuestionSummary(
    allSubjectQuestionPractice
  );
  const questionsBySubject = buildStudyQuestionsBySubject(
    filteredQuestionPractice
  );
  const studiedTimeBySubject = buildStudiedTimeBySubject(
    periodSessions,
    subjects
  );
  const studiedMinutes = periodSessions
    .reduce((total, session) => total + session.durationMinutes, 0);
  const activeSubjectCount = new Set(
    periodSessions.map((session) => session.subjectId)
  ).size;
  const periodLabel =
    dashboardPeriod === "week"
      ? "This week"
      : dashboardPeriod === "month"
        ? "This month"
        : "This year";
  const heroRecommendation =
    dueMistakes.length > 0
      ? `Start with ${dueMistakes.length} due review${dueMistakes.length === 1 ? "" : "s"} before opening a new study block.`
      : questionPerformanceSummary.totalQuestions === 0
        ? `Register a question session for this ${dashboardPeriod} to keep your study history current.`
        : "Your review queue is clear. Continue with the next planned study block.";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 md:p-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/12 via-card to-accent/20 shadow-sm">
        <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Study command center
              </div>
              <Select
                onValueChange={(value) =>
                  setDashboardPeriod(value as StudyQuestionPeriod)
                }
                value={dashboardPeriod}
              >
                <SelectTrigger
                  aria-label="Study dashboard period"
                  className="h-9 w-36 bg-background/75"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Study Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {heroRecommendation}
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {[
                {
                  label: `${periodLabel} questions`,
                  value: questionPerformanceSummary.totalQuestions,
                },
                {
                  label: `${periodLabel} accuracy`,
                  value: `${questionPerformanceSummary.accuracyRate}%`,
                },
                {
                  label: `${periodLabel} studied`,
                  value: formatMinutes(studiedMinutes),
                },
                {
                  label: "Due reviews",
                  value: dueMistakes.length,
                },
                {
                  label: "Mastery",
                  value: `${masteryRate}%`,
                },
                {
                  label: "Active subjects",
                  value: `${activeSubjectCount}/${subjects.length}`,
                },
              ].map((item) => (
                <div
                  className="min-w-0 rounded-lg border border-border/60 bg-background/65 px-3 py-2.5 backdrop-blur-sm"
                  key={item.label}
                >
                  <div className="truncate text-xs text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-1 truncate text-lg font-semibold tabular-nums">
                    {item.value}
                  </div>
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
            <Button asChild className="flex-1 xl:w-full" variant="outline">
              <Link href="/study/trt-plan">
                <BookOpenCheck className="h-4 w-4" />
                Dataprev plan
              </Link>
            </Button>
            <Button asChild className="flex-1 xl:w-full" variant="outline">
              <Link href="/study/trt-audit-plan">
                <ShieldCheck className="h-4 w-4" />
                Audit plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <DashboardSectionHeader
          description="Track recent volume, accuracy, and subject-level performance."
          icon={Target}
          title="Question performance"
        />
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <StudyQuestionsChart
            accuracyRate={questionPerformanceSummary.accuracyRate}
            data={questionTrend}
            period={dashboardPeriod}
            title="Question practice"
            totalQuestions={questionPerformanceSummary.totalQuestions}
          />
          <AccuracyPanel
            correct={questionPerformanceSummary.correctQuestions}
            period={dashboardPeriod}
            rate={questionPerformanceSummary.accuracyRate}
            total={questionPerformanceSummary.totalQuestions}
            wrong={questionPerformanceSummary.wrongQuestions}
          />
        </div>
        <div className="grid min-w-0 gap-3">
          <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-semibold">Compare subjects</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Narrow the subject comparison inside the selected dashboard period.
              </p>
            </div>
            <div className="grid gap-3">
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
            <StudyFocusBySubjectChart data={studiedTimeBySubject} />
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
            period={dashboardPeriod}
          />
          <SubjectPressurePanel subjects={subjectCounts} />
        </div>
      </section>
    </div>
  );
}
