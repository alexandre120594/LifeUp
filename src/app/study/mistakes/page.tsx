"use client";

import { FormEvent, useMemo, useState } from "react";
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
import type {
  StudyMistake,
  StudyMistakeStatus,
} from "@/types/BaseInterfaces";

const mistakePageSize = 8;
const statusOptions: StudyMistakeStatus[] = [
  "unresolved",
  "reviewed",
  "mastered",
];

function toDateInputValue(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function todayInputValue() {
  return toDateInputValue(new Date());
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isDueForReview(mistake: StudyMistake) {
  const reviewDate = new Date(mistake.reviewDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return mistake.status !== "mastered" && reviewDate <= today;
}

function statusLabel(status: StudyMistakeStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
  const { data: subjects = [] } = useStudySubjects();
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
  const dueMistakes = mistakes.filter(isDueForReview);
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
                    <span>Review {formatDate(mistake.reviewDate)}</span>
                    <span>{mistake.errorType}</span>
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
                  <p className="break-words text-sm [overflow-wrap:anywhere]">
                    Rule: {mistake.correctRule}
                  </p>
                  {mistake.trapWord ? (
                    <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      Trap word: {mistake.trapWord}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  {statusOptions.map((status) => (
                    <Button
                      disabled={updateMistake.isPending || mistake.status === status}
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

function MistakeForm({
  isSaving,
  onSubmit,
  subjects,
}: {
  isSaving: boolean;
  onSubmit: (data: {
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
  const [open, setOpen] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctRule, setCorrectRule] = useState("");
  const [errorType, setErrorType] = useState("");
  const [myAnswer, setMyAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [reviewDate, setReviewDate] = useState(todayInputValue());
  const [status, setStatus] = useState<StudyMistakeStatus>("unresolved");
  const [subjectId, setSubjectId] = useState("");
  const [trapWord, setTrapWord] = useState("");

  const resetForm = () => {
    setCorrectAnswer("");
    setCorrectRule("");
    setErrorType("");
    setMyAnswer("");
    setQuestion("");
    setReviewDate(todayInputValue());
    setStatus("unresolved");
    setSubjectId("");
    setTrapWord("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !subjectId ||
      !question.trim() ||
      !myAnswer.trim() ||
      !correctAnswer.trim() ||
      !errorType.trim() ||
      !correctRule.trim() ||
      !reviewDate
    ) {
      return;
    }

    onSubmit({
      correctAnswer: correctAnswer.trim(),
      correctRule: correctRule.trim(),
      errorType: errorType.trim(),
      myAnswer: myAnswer.trim(),
      question: question.trim(),
      reviewDate,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add mistake</DialogTitle>
          <DialogDescription>
            Capture the question, your answer, the correct answer, and the rule
            that prevents the mistake next time.
          </DialogDescription>
        </DialogHeader>
        {subjects.length ? (
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
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
            <textarea
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Question"
              value={question}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <textarea
                className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onChange={(event) => setMyAnswer(event.target.value)}
                placeholder="My answer"
                value={myAnswer}
              />
              <textarea
                className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onChange={(event) => setCorrectAnswer(event.target.value)}
                placeholder="Correct answer"
                value={correctAnswer}
              />
            </div>
            <textarea
              className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onChange={(event) => setCorrectRule(event.target.value)}
              placeholder="Correct rule"
              value={correctRule}
            />
            <div className="grid gap-3 md:grid-cols-[180px_180px_auto]">
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
              <Button disabled={isSaving} type="submit">
                <Plus className="h-4 w-4" />
                Save mistake
              </Button>
            </div>
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
  const [trapWord, setTrapWord] = useState(mistake.trapWord ?? "");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Eye className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Study mistake</DialogTitle>
          <DialogDescription>
            Update the error details, review date, and mastery status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
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
          <textarea
            className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onChange={(event) => setQuestion(event.target.value)}
            value={question}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <textarea
              className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onChange={(event) => setMyAnswer(event.target.value)}
              value={myAnswer}
            />
            <textarea
              className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onChange={(event) => setCorrectAnswer(event.target.value)}
              value={correctAnswer}
            />
          </div>
          <textarea
            className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onChange={(event) => setCorrectRule(event.target.value)}
            value={correctRule}
          />
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
            onClick={() =>
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
            }
            type="button"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
