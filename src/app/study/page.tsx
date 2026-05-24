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

      <OverviewPanel
        title="Review what you missed, then protect the rule"
        description="Your study workspace keeps mistakes, subject planning, and focus time separate from personal management."
        stats={[
          { label: "Mistakes", value: mistakes.length, icon: AlertCircle },
          { label: "Due review", value: dueMistakes.length, icon: CalendarClock },
          { label: "Subjects", value: subjects.length, icon: LibraryBig },
        ]}
        progress={{
          detail: `${mastered.length} mastered out of ${mistakes.length} logged mistakes`,
          icon: BookOpenCheck,
          label: "Mastery",
          value: masteryRate,
        }}
        focusTitle="Review queue"
        focusDescription="Start with due mistakes and unresolved patterns before adding new study blocks."
        focusItems={[
          { label: "Unresolved", value: unresolved.length, icon: AlertCircle },
          { label: "Reviewed", value: reviewed.length, icon: BookOpenCheck },
          { label: "Scheduled hours", value: schedule.length, icon: Target },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
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
      </div>
    </div>
  );
}
