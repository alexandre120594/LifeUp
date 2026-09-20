import type {
  StudyMistake,
  StudyQuestionPractice,
  StudySession,
  StudySubject,
} from "@/types/BaseInterfaces";

export type StudyQuestionPeriod = "day" | "week" | "month" | "year";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfWeek(date: Date) {
  const copy = startOfDay(date);
  const offset = copy.getDay() === 0 ? -6 : 1 - copy.getDay();
  copy.setDate(copy.getDate() + offset);
  return copy;
}

function isInside(date: Date | string | null | undefined, start: Date, end: Date) {
  if (!date) {
    return false;
  }

  const value = new Date(date);
  return value >= start && value <= end;
}

export function getStudyQuestionPeriodRange(period: StudyQuestionPeriod) {
  const now = new Date();
  let start = startOfDay(now);
  let end = endOfDay(now);

  if (period === "week") {
    start = startOfWeek(now);
    end = endOfDay(new Date(start));
    end.setDate(start.getDate() + 6);
  }

  if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  }

  if (period === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = endOfDay(new Date(now.getFullYear(), 11, 31));
  }

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

export function filterStudyMistakesByPeriod(
  mistakes: StudyMistake[] = [],
  period: StudyQuestionPeriod
) {
  const { from, to } = getStudyQuestionPeriodRange(period);
  const start = new Date(from);
  const end = new Date(to);

  return mistakes.filter((mistake) =>
    isInside(mistake.reviewDate ?? mistake.updatedAt ?? mistake.createdAt, start, end)
  );
}

export function filterStudySessionsByPeriod(
  sessions: StudySession[] = [],
  period: StudyQuestionPeriod
) {
  const { from, to } = getStudyQuestionPeriodRange(period);
  const start = new Date(from);
  const end = new Date(to);

  return sessions.filter((session) => isInside(session.startedAt, start, end));
}

export function getDueStudyMistakes(mistakes: StudyMistake[] = []) {
  const today = endOfDay(new Date());

  return mistakes
    .filter((mistake) => mistake.status !== "mastered")
    .filter((mistake) => mistake.reviewDate && new Date(mistake.reviewDate) <= today)
    .sort(
      (a, b) =>
        new Date(a.reviewDate ?? 0).getTime() - new Date(b.reviewDate ?? 0).getTime()
    );
}

export function getStudyReviewsForPeriod(
  mistakes: StudyMistake[] = [],
  period: StudyQuestionPeriod
) {
  const { to } = getStudyQuestionPeriodRange(period);
  const end = new Date(to);

  return mistakes
    .filter((mistake) => mistake.status !== "mastered")
    .filter((mistake) => mistake.reviewDate && new Date(mistake.reviewDate) <= end)
    .sort(
      (a, b) =>
        new Date(a.reviewDate ?? 0).getTime() - new Date(b.reviewDate ?? 0).getTime()
    );
}

export function buildWeakSubjectMistakes(mistakes: StudyMistake[] = []) {
  const totals = new Map<
    string,
    {
      due: number;
      mastered: number;
      name: string;
      reviewed: number;
      subjectId: string;
      total: number;
      unresolved: number;
    }
  >();
  const due = new Set(getDueStudyMistakes(mistakes).map((mistake) => mistake.id));

  for (const mistake of mistakes) {
    const id = mistake.subjectId;
    const current = totals.get(id) ?? {
      due: 0,
      mastered: 0,
      name: mistake.subject?.name ?? "Subject",
      reviewed: 0,
      subjectId: id,
      total: 0,
      unresolved: 0,
    };

    current.total += 1;
    current.due += due.has(mistake.id) ? 1 : 0;
    current.mastered += mistake.status === "mastered" ? 1 : 0;
    current.reviewed += mistake.status === "reviewed" ? 1 : 0;
    current.unresolved += mistake.status === "unresolved" ? 1 : 0;
    totals.set(id, {
      ...current,
      name: mistake.subject?.name ?? current.name,
    });
  }

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

export function getStudyQuestionSummary(practices: StudyQuestionPractice[] = []) {
  const totals = practices.reduce(
    (summary, practice) => ({
      correctQuestions: summary.correctQuestions + practice.correctQuestions,
      totalQuestions: summary.totalQuestions + practice.totalQuestions,
      wrongQuestions: summary.wrongQuestions + practice.wrongQuestions,
    }),
    { correctQuestions: 0, totalQuestions: 0, wrongQuestions: 0 }
  );

  return {
    ...totals,
    accuracyRate: totals.totalQuestions
      ? Math.round((totals.correctQuestions / totals.totalQuestions) * 100)
      : 0,
    accuracy: totals.totalQuestions
      ? Math.round((totals.correctQuestions / totals.totalQuestions) * 100)
      : 0,
  };
}

export function buildStudyQuestionTrend(
  practices: StudyQuestionPractice[] = [],
  period: StudyQuestionPeriod
) {
  void period;
  const byDay = new Map<
    string,
    { correctQuestions: number; date: string; totalQuestions: number; wrongQuestions: number }
  >();

  for (const practice of practices) {
    const day = new Date(practice.practiceDate).toISOString().slice(0, 10);
    const current = byDay.get(day) ?? {
      correctQuestions: 0,
      date: day,
      totalQuestions: 0,
      wrongQuestions: 0,
    };

    current.correctQuestions += practice.correctQuestions;
    current.totalQuestions += practice.totalQuestions;
    current.wrongQuestions += practice.wrongQuestions;
    byDay.set(day, current);
  }

  return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildStudyQuestionsBySubject(practices: StudyQuestionPractice[] = []) {
  const bySubject = new Map<
    string,
    {
      accuracyRate: number;
      correctQuestions: number;
      name: string;
      subjectId: string;
      totalQuestions: number;
      wrongQuestions: number;
    }
  >();

  for (const practice of practices) {
    const id = practice.subjectId;
    const current = bySubject.get(id) ?? {
      accuracyRate: 0,
      correctQuestions: 0,
      name: practice.subject?.name ?? "Subject",
      subjectId: id,
      totalQuestions: 0,
      wrongQuestions: 0,
    };

    current.correctQuestions += practice.correctQuestions;
    current.totalQuestions += practice.totalQuestions;
    current.wrongQuestions += practice.wrongQuestions;
    current.accuracyRate = current.totalQuestions
      ? Math.round((current.correctQuestions / current.totalQuestions) * 100)
      : 0;
    bySubject.set(id, current);
  }

  return Array.from(bySubject.values()).sort((a, b) => b.totalQuestions - a.totalQuestions);
}

export function buildStudiedTimeBySubject(
  sessions: StudySession[] = [],
  subjects: StudySubject[] = []
) {
  const bySubject = new Map<
    string,
    { color?: string | null; id: string; minutes: number; title: string }
  >();

  for (const subject of subjects) {
    bySubject.set(subject.id, {
      color: subject.color,
      id: subject.id,
      minutes: 0,
      title: subject.name,
    });
  }

  for (const session of sessions) {
    const id = session.subjectId;
    const current = bySubject.get(id) ?? {
      color: session.subject?.color,
      id,
      minutes: 0,
      title: session.subject?.name ?? "Subject",
    };

    current.minutes += session.durationMinutes;
    bySubject.set(id, current);
  }

  return Array.from(bySubject.values()).sort((a, b) => b.minutes - a.minutes);
}
