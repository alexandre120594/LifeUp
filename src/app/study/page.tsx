"use client";

import Link from "next/link";
import {
  AlertCircle,
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  LibraryBig,
  Target,
} from "lucide-react";
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
import { useStudySchedule, useStudySubjects } from "@/hooks/useStudyMutations";
import type { StudyMistake } from "@/types/BaseInterfaces";

function isDueForReview(mistake: StudyMistake) {
  const reviewDate = new Date(mistake.reviewDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return mistake.status !== "mastered" && reviewDate <= today;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudyDashboardPage() {
  const { data: mistakes = [], isLoading: isMistakesLoading } =
    useStudyMistakes();
  const { data: subjects = [] } = useStudySubjects();
  const { data: schedule = [] } = useStudySchedule();

  const unresolved = mistakes.filter(
    (mistake) => mistake.status === "unresolved"
  );
  const reviewed = mistakes.filter((mistake) => mistake.status === "reviewed");
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
  const metrics = [
    { label: "Mistakes", value: mistakes.length, icon: AlertCircle },
    { label: "Due review", value: dueMistakes.length, icon: CalendarClock },
    { label: "Subjects", value: subjects.length, icon: LibraryBig },
    { label: "Scheduled hours", value: schedule.length, icon: Target },
  ];
  const reviewStats = [
    { label: "Unresolved", value: unresolved.length, icon: AlertCircle },
    { label: "Reviewed", value: reviewed.length, icon: BookOpenCheck },
    { label: "Mastered", value: mastered.length, icon: GraduationCap },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Study tools"
        title="Study Dashboard"
        action={
          <Button asChild>
            <Link href="/study/mistakes">
              <AlertCircle className="h-4 w-4" />
              Open mistake log
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm md:p-5">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Review what you missed, then protect the rule
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your study workspace keeps mistakes, subject planning, and focus
            time separate from personal management.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const MetricIcon = metric.icon;

            return (
              <Card
                className="min-w-0 border-border/70 bg-background/70 shadow-none"
                key={metric.label}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>
                    <span className="rounded-md bg-secondary p-2 text-primary">
                      <MetricIcon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.38fr)]">
          <Card className="min-w-0 border-border/70 bg-background/70 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-primary" />
                Mastery
              </CardTitle>
              <CardDescription>
                {mastered.length} mastered out of {mistakes.length} logged
                mistakes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(masteryRate, 100)}%` }}
                />
              </div>
              <div className="mt-3 text-sm font-medium">
                {masteryRate}% mastery
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 border-border/70 bg-background/70 shadow-none">
            <CardHeader>
              <CardTitle>Review queue</CardTitle>
              <CardDescription>
                Start with due and unresolved patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {reviewStats.map((item) => {
                const ItemIcon = item.icon;

                return (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg bg-secondary/35 p-3 text-sm"
                    key={item.label}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <ItemIcon className="h-4 w-4" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4">
        <Card className="min-w-0 border-border/70 shadow-sm">
          <CardHeader className="gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Due for review</CardTitle>
                <CardDescription>
                  Mistakes with a review date up to today and not mastered.
                </CardDescription>
              </div>
              <Badge variant="outline">{dueMistakes.length} due</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isMistakesLoading ? (
              <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
                Loading study review queue...
              </p>
            ) : dueMistakes.length ? (
              dueMistakes.slice(0, 5).map((mistake) => (
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
                No due mistakes. Add new mistakes or review upcoming ones from
                the log.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Weak subjects
            </CardTitle>
            <CardDescription>
              Subjects with the most logged mistakes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {subjectCounts.some((subject) => subject.total > 0) ? (
              subjectCounts.slice(0, 6).map((subject) => (
                <div
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/75 p-3"
                  key={subject.id}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color ?? "#38bdf8" }}
                    />
                    <span className="truncate font-medium">{subject.name}</span>
                  </div>
                  <Badge variant="outline">{subject.total}</Badge>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
                No subject patterns yet. The mistake log will show where errors
                repeat as you add entries.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
