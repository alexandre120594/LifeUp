"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateStudyMistake,
  useDeleteStudyMistake,
  useStudyMistakes,
  useUpdateStudyMistake,
} from "@/hooks/useStudyMistakeMutations";
import { useStudySubjects } from "@/hooks/useStudyMutations";
import {
  buildWeakSubjectMistakes,
  getDueStudyMistakes,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type {
  StudyMistake,
  StudyMistakeCorrectionStatus,
  StudyMistakeErrorLevel,
  StudyMistakeResult,
  StudyMistakeStatus,
} from "@/types/BaseInterfaces";

const mistakePageSize = 8;
const focusPageSize = 5;
const statusOptions: StudyMistakeStatus[] = [
  "unresolved",
  "reviewed",
  "mastered",
];
const resultOptions: StudyMistakeResult[] = [
  "wrong",
  "correct_with_doubt",
  "correct",
];
const errorLevelOptions: StudyMistakeErrorLevel[] = [
  "minor",
  "moderate",
  "severe",
];
const requiredFieldClass =
  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30";
const longTextFieldClass =
  "w-full max-w-full resize-y overflow-y-auto break-words rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] [overflow-wrap:anywhere] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const tallTextFieldClass = `${longTextFieldClass} min-h-32 max-h-72`;
const mediumTextFieldClass = `${longTextFieldClass} min-h-24 max-h-56`;

function RequiredFieldError({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return <p className="text-xs font-medium text-destructive">Required field.</p>;
}

function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid min-w-0 gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function toDateInputValue(date?: Date | string | null) {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
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

function statusLabel(status: StudyMistakeStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function resultLabel(result?: StudyMistakeResult | null) {
  if (result === "correct") {
    return "Correct";
  }

  if (result === "correct_with_doubt") {
    return "Correct with doubt";
  }

  return "Wrong";
}

function correctionLabel(status?: StudyMistakeCorrectionStatus | null) {
  if (status === "completed") {
    return "Correction completed";
  }

  if (status === "pending") {
    return "Correction pending";
  }

  return "Legacy record";
}

function normalizeErrorLevel(
  level?: StudyMistake["errorLevel"] | "leve" | "medio" | "grave"
): StudyMistakeErrorLevel {
  if (level === "minor" || level === "leve") {
    return "minor";
  }

  if (level === "moderate" || level === "medio") {
    return "moderate";
  }

  return "severe";
}

function isStatusBlockedByCorrection(
  mistake: StudyMistake,
  status: StudyMistakeStatus
) {
  return (
    mistake.correctionStatus === "pending" &&
    (status === "reviewed" || status === "mastered")
  );
}

export default function StudyMistakesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudyMistakeStatus | "all">(
    "all"
  );
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [errorTypeFilter, setErrorTypeFilter] = useState("all");
  const [dueOnly, setDueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [duePage, setDuePage] = useState(1);
  const [weakSubjectPage, setWeakSubjectPage] = useState(1);
  const { data: subjects = [] } = useStudySubjects();
  const { data: allMistakes = [] } = useStudyMistakes();
  const { data: mistakes = [], isLoading } = useStudyMistakes({
    due: dueOnly,
    errorType: errorTypeFilter === "all" ? undefined : errorTypeFilter,
    q: query,
    status: statusFilter,
    subjectId: subjectFilter === "all" ? undefined : subjectFilter,
  });
  const createMistake = useCreateStudyMistake();
  const updateMistake = useUpdateStudyMistake();
  const deleteMistake = useDeleteStudyMistake();

  const errorTypes = useMemo(
    () =>
      Array.from(
        new Set(mistakes.map((mistake) => mistake.errorType).filter(Boolean))
      ),
    [mistakes]
  );
  const dueMistakes = getDueStudyMistakes(mistakes);
  const allDueMistakes = getDueStudyMistakes(allMistakes);
  const weakSubjects = buildWeakSubjectMistakes(allMistakes);
  const unresolved = mistakes.filter(
    (mistake) => mistake.status === "unresolved"
  );
  const mastered = mistakes.filter((mistake) => mistake.status === "mastered");
  const totalPages = Math.max(Math.ceil(mistakes.length / mistakePageSize), 1);
  const visibleMistakes = mistakes.slice(
    (page - 1) * mistakePageSize,
    page * mistakePageSize
  );

  const updateFilter = (callback: () => void) => {
    callback();
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Study tools"
        title="Mistake Log"
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/study">
                <GraduationCap className="h-4 w-4" />
                Study dashboard
              </Link>
            </Button>
            <MistakeForm
              isSaving={createMistake.isPending}
              onSubmit={(data) => createMistake.mutate(data)}
              subjects={subjects}
            />
          </div>
        }
      />

      <OverviewPanel
        title="Track the exact error, rule, and trap"
        description="Log each missed question with the correct rule and review date so study time targets the patterns that actually cost points."
        stats={[
          { label: "Mistakes", value: mistakes.length, icon: AlertCircle },
          { label: "Unresolved", value: unresolved.length, icon: CalendarClock },
          { label: "Mastered", value: mastered.length, icon: CheckCircle2 },
        ]}
        progress={{
          detail: `${dueMistakes.length} mistakes due for review in the current filter`,
          icon: BookOpenCheck,
          label: "Review pressure",
          value: mistakes.length
            ? Math.round(((mistakes.length - dueMistakes.length) / mistakes.length) * 100)
            : 100,
        }}
        focusTitle="Review first"
        focusDescription="Use unresolved and due filters before adding more material."
        focusItems={[
          { label: "Due now", value: dueMistakes.length, icon: CalendarClock },
          { label: "Subjects", value: subjects.length, icon: GraduationCap },
          { label: "Error types", value: errorTypes.length, icon: AlertCircle },
        ]}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <WeakSubjectsPanel
          page={weakSubjectPage}
          pageSize={focusPageSize}
          setPage={setWeakSubjectPage}
          subjects={weakSubjects}
        />
        <DueReviewPanel
          mistakes={allDueMistakes}
          page={duePage}
          pageSize={focusPageSize}
          setPage={setDuePage}
        />
      </section>

      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3">
          <div>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>
              Search, filter, review, and update mistake status.
            </CardDescription>
          </div>
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) =>
                  updateFilter(() => setQuery(event.target.value))
                }
                placeholder="Search question, rule, trap word, or answer"
                value={query}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                updateFilter(() =>
                  setStatusFilter(value as StudyMistakeStatus | "all")
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={subjectFilter}
              onValueChange={(value) => updateFilter(() => setSubjectFilter(value))}
            >
              <SelectTrigger>
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
            <Select
              value={errorTypeFilter}
              onValueChange={(value) =>
                updateFilter(() => setErrorTypeFilter(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All error types</SelectItem>
                {errorTypes.map((errorType) => (
                  <SelectItem key={errorType} value={errorType}>
                    {errorType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => updateFilter(() => setDueOnly((current) => !current))}
              type="button"
              variant={dueOnly ? "default" : "outline"}
            >
              Due
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading ? (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              Loading mistakes...
            </p>
          ) : visibleMistakes.length ? (
            visibleMistakes.map((mistake) => (
              <div
                className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background/75 p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                key={mistake.id}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge>{mistake.subject?.name ?? "Subject"}</Badge>
                    <Badge variant="outline">{statusLabel(mistake.status)}</Badge>
                    <Badge
                      variant={
                        mistake.correctionStatus === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {correctionLabel(mistake.correctionStatus)}
                    </Badge>
                    <span>{resultLabel(mistake.result)}</span>
                    <span>Review {formatDate(mistake.reviewDate)}</span>
                    {mistake.examBoard ? <span>{mistake.examBoard}</span> : null}
                    {mistake.initialTopic ? <span>{mistake.initialTopic}</span> : null}
                    {mistake.errorType ? <span>{mistake.errorType}</span> : null}
                  </div>
                  <h3 className="break-words text-base font-semibold [overflow-wrap:anywhere]">
                    {mistake.question}
                  </h3>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p className="break-words [overflow-wrap:anywhere]">
                      Your answer: {mistake.myAnswer}
                    </p>
                    <p className="break-words [overflow-wrap:anywhere]">
                      Correct answer: {mistake.correctAnswer}
                    </p>
                  </div>
                  {mistake.correctRule ? (
                    <p className="break-words text-sm [overflow-wrap:anywhere]">
                      Rule: {mistake.correctRule}
                    </p>
                  ) : null}
                  {mistake.microTopic ? (
                    <p className="break-words text-sm [overflow-wrap:anywhere]">
                      Microtopic: {mistake.microTopic}
                    </p>
                  ) : null}
                  {mistake.memorizationPhrase ? (
                    <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      Memorization: {mistake.memorizationPhrase}
                    </p>
                  ) : null}
                  {mistake.comment ? (
                    <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      Comment: {mistake.comment}
                    </p>
                  ) : null}
                  {mistake.trapWord ? (
                    <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      Trap word: {mistake.trapWord}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  {statusOptions.map((status) => (
                    <Button
                      disabled={
                        updateMistake.isPending ||
                        mistake.status === status ||
                        isStatusBlockedByCorrection(mistake, status)
                      }
                      key={status}
                      onClick={() =>
                        updateMistake.mutate({
                          id: mistake.id,
                          data: { status },
                        })
                      }
                      size="sm"
                      type="button"
                      variant={mistake.status === status ? "default" : "outline"}
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                  {!mistake.correctionStatus ? (
                    <Button
                      disabled={updateMistake.isPending}
                      onClick={() =>
                        updateMistake.mutate({
                          id: mistake.id,
                          data: {
                            correctionStatus: "pending",
                            result: mistake.result ?? "wrong",
                            status: "unresolved",
                          },
                        })
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <BookOpenCheck className="h-4 w-4" />
                      Send to correction
                    </Button>
                  ) : null}
                  {mistake.correctionStatus ? (
                    <GuidedCorrectionDialog
                      isSaving={updateMistake.isPending}
                      mistake={mistake}
                      onSave={(data) =>
                        updateMistake.mutate({ id: mistake.id, data })
                      }
                    />
                  ) : null}
                  <MistakeDialog
                    isSaving={updateMistake.isPending}
                    mistake={mistake}
                    onSave={(data) =>
                      updateMistake.mutate({ id: mistake.id, data })
                    }
                    subjects={subjects}
                  />
                  <Button
                    onClick={() => deleteMistake.mutate(mistake.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              No mistakes found for the current filters.
            </p>
          )}

          {mistakes.length ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} / {mistakes.length} mistakes
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((currentPage) => Math.max(currentPage - 1, 1))
                  }
                  type="button"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.min(currentPage + 1, totalPages)
                    )
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
    </div>
  );
}

function WeakSubjectsPanel({
  page,
  pageSize,
  setPage,
  subjects,
}: {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  subjects: ReturnType<typeof buildWeakSubjectMistakes>;
}) {
  const totalPages = Math.max(Math.ceil(subjects.length / pageSize), 1);
  const visibleSubjects = subjects.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Weak subjects</CardTitle>
        <CardDescription>
          Subjects with the most logged mistakes.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {visibleSubjects.length ? (
          visibleSubjects.map((subject) => (
            <div
              className="grid gap-2 rounded-lg border border-border/60 bg-background/70 p-3"
              key={subject.subjectId}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{subject.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {subject.unresolved} unresolved / {subject.mastered} mastered
                  </div>
                </div>
                <Badge>{subject.total} mistakes</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">{subject.due} due</Badge>
                <Badge variant="outline">{subject.reviewed} reviewed</Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No subjects have logged mistakes yet.
          </p>
        )}

        <PanelPagination
          page={page}
          setPage={setPage}
          totalItems={subjects.length}
          totalPages={totalPages}
        />
      </CardContent>
    </Card>
  );
}

function DueReviewPanel({
  mistakes,
  page,
  pageSize,
  setPage,
}: {
  mistakes: StudyMistake[];
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
}) {
  const totalPages = Math.max(Math.ceil(mistakes.length / pageSize), 1);
  const visibleMistakes = mistakes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Due for review</CardTitle>
        <CardDescription>
          Mistakes with a review date up to today and not mastered.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {visibleMistakes.length ? (
          visibleMistakes.map((mistake) => (
            <div
              className="grid gap-2 rounded-lg border border-border/60 bg-background/70 p-3"
              key={mistake.id}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge>{mistake.subject?.name ?? "Subject"}</Badge>
                <Badge variant="outline">{statusLabel(mistake.status)}</Badge>
                <span>Review {formatDate(mistake.reviewDate)}</span>
              </div>
              <div className="line-clamp-2 break-words text-sm font-medium [overflow-wrap:anywhere]">
                {mistake.question}
              </div>
              <div className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                {mistake.errorType}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            No mistakes are due for review.
          </p>
        )}

        <PanelPagination
          page={page}
          setPage={setPage}
          totalItems={mistakes.length}
          totalPages={totalPages}
        />
      </CardContent>
    </Card>
  );
}

function PanelPagination({
  page,
  setPage,
  totalItems,
  totalPages,
}: {
  page: number;
  setPage: (page: number) => void;
  totalItems: number;
  totalPages: number;
}) {
  if (totalItems <= focusPageSize) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => setPage(Math.max(page - 1, 1))}
          type="button"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          disabled={page >= totalPages}
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          type="button"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function MistakeForm({
  isSaving,
  onSubmit,
  subjects,
}: {
  isSaving: boolean;
  onSubmit: (data: {
    comment?: string | null;
    correctAnswer: string;
    correctRule: string;
    examBoard?: string | null;
    errorType: string;
    initialTopic?: string | null;
    myAnswer: string;
    question: string;
    result: StudyMistakeResult;
    reviewDate?: string | null;
    status: StudyMistakeStatus;
    subjectId: string;
    trapWord?: string | null;
  }) => void;
  subjects: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctRule, setCorrectRule] = useState("");
  const [comment, setComment] = useState("");
  const [errorType, setErrorType] = useState("");
  const [examBoard, setExamBoard] = useState("");
  const [initialTopic, setInitialTopic] = useState("");
  const [myAnswer, setMyAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [result, setResult] = useState<StudyMistakeResult>("wrong");
  const [status, setStatus] = useState<StudyMistakeStatus>("unresolved");
  const [subjectId, setSubjectId] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [trapWord, setTrapWord] = useState("");
  const showSubjectError = submitAttempted && !subjectId;
  const showQuestionError = submitAttempted && !question.trim();

  const resetForm = () => {
    setCorrectAnswer("");
    setCorrectRule("");
    setComment("");
    setErrorType("");
    setExamBoard("");
    setInitialTopic("");
    setMyAnswer("");
    setQuestion("");
    setReviewDate("");
    setResult("wrong");
    setStatus("unresolved");
    setSubjectId("");
    setSubmitAttempted(false);
    setTrapWord("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (
      !subjectId ||
      !question.trim()
    ) {
      return;
    }

    onSubmit({
      comment: comment.trim() || null,
      correctAnswer: correctAnswer.trim(),
      correctRule: correctRule.trim(),
      examBoard: examBoard.trim() || null,
      errorType: errorType.trim(),
      initialTopic: initialTopic.trim() || null,
      myAnswer: myAnswer.trim(),
      question: question.trim(),
      result,
      reviewDate: reviewDate || null,
      status,
      subjectId,
      trapWord: trapWord.trim() || null,
    });
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="h-4 w-4" />
          Add mistake
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Add mistake</DialogTitle>
          <DialogDescription>Log the question and review target.</DialogDescription>
        </DialogHeader>
        {subjects.length ? (
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <FormSection title="Context">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger className={cn(showSubjectError && requiredFieldClass)}>
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <RequiredFieldError show={showSubjectError} />
                </div>
                <Input
                  onChange={(event) => setExamBoard(event.target.value)}
                  placeholder="Exam board"
                  value={examBoard}
                />
                <Select
                  value={result}
                  onValueChange={(value) => setResult(value as StudyMistakeResult)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resultOptions.map((currentResult) => (
                      <SelectItem key={currentResult} value={currentResult}>
                        {resultLabel(currentResult)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  onChange={(event) => setInitialTopic(event.target.value)}
                  placeholder="Topic"
                  value={initialTopic}
                />
              </div>
              {result !== "correct" ? (
                <div className="rounded-md border border-primary/25 bg-primary/5 p-2 text-xs text-muted-foreground">
                  Creates a pending Guided Correction after saving.
                </div>
              ) : null}
            </FormSection>

            <FormSection title="Question">
              <FieldLabel label="Question">
                <textarea
                  className={cn(
                    tallTextFieldClass,
                    showQuestionError && requiredFieldClass
                  )}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Paste question"
                  value={question}
                />
                <RequiredFieldError show={showQuestionError} />
              </FieldLabel>
              <FieldLabel label="Comment">
                <textarea
                  className={mediumTextFieldClass}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Optional"
                  value={comment}
                />
              </FieldLabel>
            </FormSection>

            <FormSection title="Answer and rule">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldLabel label="My answer">
                  <textarea
                    className={mediumTextFieldClass}
                    onChange={(event) => setMyAnswer(event.target.value)}
                    placeholder="Your answer"
                    value={myAnswer}
                  />
                </FieldLabel>
                <FieldLabel label="Correct answer">
                  <textarea
                    className={mediumTextFieldClass}
                    onChange={(event) => setCorrectAnswer(event.target.value)}
                    placeholder="Correct answer"
                    value={correctAnswer}
                  />
                </FieldLabel>
              </div>
              <FieldLabel label="Correct rule">
                <textarea
                  className={mediumTextFieldClass}
                  onChange={(event) => setCorrectRule(event.target.value)}
                  placeholder="Rule or explanation"
                  value={correctRule}
                />
              </FieldLabel>
            </FormSection>

            <FormSection title="Review">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  onChange={(event) => setErrorType(event.target.value)}
                  placeholder="Error type"
                  value={errorType}
                />
                <Input
                  onChange={(event) => setTrapWord(event.target.value)}
                  placeholder="Trap word"
                  value={trapWord}
                />
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <Input
                  onChange={(event) => setReviewDate(event.target.value)}
                  placeholder="Review date"
                  type="date"
                  value={reviewDate}
                />
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as StudyMistakeStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((currentStatus) => (
                      <SelectItem key={currentStatus} value={currentStatus}>
                        {statusLabel(currentStatus)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full lg:w-auto" disabled={isSaving} type="submit">
                  <Plus className="h-4 w-4" />
                  Save mistake
                </Button>
              </div>
            </FormSection>
          </form>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            Create a study subject in the Study Planner before logging mistakes.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GuidedCorrectionDialog({
  isSaving,
  mistake,
  onSave,
}: {
  isSaving: boolean;
  mistake: StudyMistake;
  onSave: (data: {
    chargedDetail: string;
    correctionStatus: StudyMistakeCorrectionStatus;
    correctiveAction: string;
    errorLevel: StudyMistakeErrorLevel;
    errorReason: string;
    generalSubject: string;
    memorizationPhrase: string;
    microTopic: string;
    reviewDate: string;
    status: StudyMistakeStatus;
    topic: string;
    trap?: string | null;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [generalSubject, setGeneralSubject] = useState(
    mistake.generalSubject ?? mistake.subject?.name ?? ""
  );
  const [topic, setTopic] = useState(mistake.topic ?? mistake.initialTopic ?? "");
  const [microTopic, setMicroTopic] = useState(mistake.microTopic ?? "");
  const [errorReason, setErrorReason] = useState(mistake.errorReason ?? "");
  const [chargedDetail, setChargedDetail] = useState(mistake.chargedDetail ?? "");
  const [trap, setTrap] = useState(mistake.trap ?? mistake.trapWord ?? "");
  const [memorizationPhrase, setMemorizationPhrase] = useState(
    mistake.memorizationPhrase ?? ""
  );
  const [correctiveAction, setCorrectiveAction] = useState(
    mistake.correctiveAction ?? ""
  );
  const [errorLevel, setErrorLevel] = useState<StudyMistakeErrorLevel>(
    normalizeErrorLevel(mistake.errorLevel)
  );
  const [reviewDate, setReviewDate] = useState(
    toDateInputValue(mistake.reviewDate)
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const canSubmit =
    microTopic.trim() &&
    errorReason.trim() &&
    chargedDetail.trim() &&
    memorizationPhrase.trim() &&
    correctiveAction.trim() &&
    reviewDate;
  const showMicroTopicError = submitAttempted && !microTopic.trim();
  const showErrorReasonError = submitAttempted && !errorReason.trim();
  const showChargedDetailError = submitAttempted && !chargedDetail.trim();
  const showMemorizationPhraseError =
    submitAttempted && !memorizationPhrase.trim();
  const showCorrectiveActionError = submitAttempted && !correctiveAction.trim();
  const showReviewDateError = submitAttempted && !reviewDate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <BookOpenCheck className="h-4 w-4" />
          Guided Correction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Guided Correction</DialogTitle>
          <DialogDescription>Complete the correction.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <FormSection title="Classify">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                onChange={(event) => setGeneralSubject(event.target.value)}
                placeholder="Subject"
                value={generalSubject}
              />
              <Input
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Topic"
                value={topic}
              />
              <Select
                value={errorLevel}
                onValueChange={(value) =>
                  setErrorLevel(value as StudyMistakeErrorLevel)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {errorLevelOptions.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Input
                className={cn(showMicroTopicError && requiredFieldClass)}
                onChange={(event) => setMicroTopic(event.target.value)}
                placeholder="Real microtopic tested"
                value={microTopic}
              />
              <RequiredFieldError show={showMicroTopicError} />
            </div>
          </FormSection>

          <FormSection title="Diagnose">
            <FieldLabel label="Error reason">
              <textarea
                className={cn(
                  mediumTextFieldClass,
                  showErrorReasonError && requiredFieldClass
                )}
                onChange={(event) => setErrorReason(event.target.value)}
                placeholder="Why it went wrong"
                value={errorReason}
              />
              <RequiredFieldError show={showErrorReasonError} />
            </FieldLabel>
            <FieldLabel label="Charged detail">
              <textarea
                className={cn(
                  mediumTextFieldClass,
                  showChargedDetailError && requiredFieldClass
                )}
                onChange={(event) => setChargedDetail(event.target.value)}
                placeholder="Tested detail"
                value={chargedDetail}
              />
              <RequiredFieldError show={showChargedDetailError} />
            </FieldLabel>
            <Input
              onChange={(event) => setTrap(event.target.value)}
              placeholder="Trap"
              value={trap}
            />
          </FormSection>

          <FormSection title="Remember">
            <FieldLabel label="Memorization phrase">
              <textarea
                className={cn(
                  mediumTextFieldClass,
                  showMemorizationPhraseError && requiredFieldClass
                )}
                onChange={(event) => setMemorizationPhrase(event.target.value)}
                placeholder="Memory phrase"
                value={memorizationPhrase}
              />
              <RequiredFieldError show={showMemorizationPhraseError} />
            </FieldLabel>
            <FieldLabel label="Corrective action">
              <textarea
                className={cn(
                  mediumTextFieldClass,
                  showCorrectiveActionError && requiredFieldClass
                )}
                onChange={(event) => setCorrectiveAction(event.target.value)}
                placeholder="Next action"
                value={correctiveAction}
              />
              <RequiredFieldError show={showCorrectiveActionError} />
            </FieldLabel>
            <div className="grid gap-1">
              <Input
                className={cn(showReviewDateError && requiredFieldClass)}
                onChange={(event) => setReviewDate(event.target.value)}
                type="date"
                value={reviewDate}
              />
              <RequiredFieldError show={showReviewDateError} />
            </div>
          </FormSection>
          {!canSubmit ? (
            <p className="rounded-md bg-secondary/35 p-2 text-xs text-muted-foreground">
              Required fields are highlighted.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            disabled={isSaving}
            onClick={() => {
              setSubmitAttempted(true);

              if (!canSubmit) {
                return;
              }

              onSave({
                chargedDetail: chargedDetail.trim(),
                correctionStatus: "completed",
                correctiveAction: correctiveAction.trim(),
                errorLevel,
                errorReason: errorReason.trim(),
                generalSubject: generalSubject.trim(),
                memorizationPhrase: memorizationPhrase.trim(),
                microTopic: microTopic.trim(),
                reviewDate,
                status: "reviewed",
                topic: topic.trim(),
                trap: trap.trim() || null,
              });
              setOpen(false);
            }}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finish correction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MistakeDialog({
  isSaving,
  mistake,
  onSave,
  subjects,
}: {
  isSaving: boolean;
  mistake: StudyMistake;
  onSave: (data: {
    correctAnswer: string;
    correctRule: string;
    errorType: string;
    myAnswer: string;
    question: string;
    reviewDate: string;
    status: StudyMistakeStatus;
    subjectId: string;
    trapWord?: string | null;
  }) => void;
  subjects: Array<{ id: string; name: string }>;
}) {
  const [correctAnswer, setCorrectAnswer] = useState(mistake.correctAnswer);
  const [correctRule, setCorrectRule] = useState(mistake.correctRule);
  const [errorType, setErrorType] = useState(mistake.errorType);
  const [myAnswer, setMyAnswer] = useState(mistake.myAnswer);
  const [question, setQuestion] = useState(mistake.question);
  const [reviewDate, setReviewDate] = useState(toDateInputValue(mistake.reviewDate));
  const [status, setStatus] = useState<StudyMistakeStatus>(mistake.status);
  const [subjectId, setSubjectId] = useState(mistake.subjectId);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [trapWord, setTrapWord] = useState(mistake.trapWord ?? "");
  const showSubjectError = submitAttempted && !subjectId;
  const showQuestionError = submitAttempted && !question.trim();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Eye className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Study mistake</DialogTitle>
          <DialogDescription>
            Update the error details, review date, and mastery status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-1">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className={cn(showSubjectError && requiredFieldClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RequiredFieldError show={showSubjectError} />
            </div>
            <Input
              onChange={(event) => setErrorType(event.target.value)}
              value={errorType}
            />
            <Input
              onChange={(event) => setTrapWord(event.target.value)}
              placeholder="Trap word"
              value={trapWord}
            />
          </div>
          <label className="grid min-w-0 gap-1 text-sm font-medium">
            Question
            <textarea
              className={cn(
                tallTextFieldClass,
                showQuestionError && requiredFieldClass
              )}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Question"
              value={question}
            />
            <RequiredFieldError show={showQuestionError} />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid min-w-0 gap-1 text-sm font-medium">
              My answer
              <textarea
                className={mediumTextFieldClass}
                onChange={(event) => setMyAnswer(event.target.value)}
                placeholder="What you answered"
                value={myAnswer}
              />
            </label>
            <label className="grid min-w-0 gap-1 text-sm font-medium">
              Correct answer
              <textarea
                className={mediumTextFieldClass}
                onChange={(event) => setCorrectAnswer(event.target.value)}
                placeholder="Expected answer"
                value={correctAnswer}
              />
            </label>
          </div>
          <label className="grid min-w-0 gap-1 text-sm font-medium">
            Correct rule
          <textarea
            className={mediumTextFieldClass}
            onChange={(event) => setCorrectRule(event.target.value)}
            placeholder="Rule, formula, concept, or explanation"
            value={correctRule}
          />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              onChange={(event) => setReviewDate(event.target.value)}
              type="date"
              value={reviewDate}
            />
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StudyMistakeStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((currentStatus) => (
                  <SelectItem key={currentStatus} value={currentStatus}>
                    {statusLabel(currentStatus)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isSaving}
            onClick={() => {
              setSubmitAttempted(true);

              if (!subjectId || !question.trim()) {
                return;
              }

              onSave({
                correctAnswer,
                correctRule,
                errorType,
                myAnswer,
                question,
                reviewDate,
                status,
                subjectId,
                trapWord: trapWord || null,
              })
            }}
            type="button"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
