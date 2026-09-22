import type { StudyRecommendation, StudyReview, StudySessionCore, StudySubjectCore } from "@/types/Study";

function startOfWeek(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + (date.getDay() === 0 ? -6 : 1 - date.getDay()));
  return date;
}

export function buildStudySubjectAttention(
  subjects: StudySubjectCore[], sessions: StudySessionCore[], reviews: StudyReview[]
) {
  const weekStart = startOfWeek();
  const now = new Date();
  return subjects.filter((subject) => subject.isActive).map((subject) => {
    const weekly = sessions.filter((session) => session.subjectId === subject.id && new Date(session.startedAt) >= weekStart);
    const studiedMinutes = weekly.reduce((sum, session) => sum + session.durationMinutes, 0);
    const total = weekly.reduce((sum, session) => sum + (session.totalQuestions ?? 0), 0);
    const correct = weekly.reduce((sum, session) => sum + (session.correctQuestions ?? 0), 0);
    const accuracy = total ? Math.round(correct / total * 100) : 0;
    const overdueReviews = reviews.filter((review) => review.subjectId === subject.id && review.status === "pending" && new Date(review.dueAt) <= now).length;
    const deficit = Math.max(0, subject.plannedMinutesPerWeek - studiedMinutes);
    const reason = overdueReviews ? `${overdueReviews} revisao${overdueReviews === 1 ? "" : "oes"} vencida${overdueReviews === 1 ? "" : "s"}` : deficit ? `Faltam ${deficit} min para a meta semanal` : total >= 10 ? `Acuracia recente de ${accuracy}%` : "Sem urgencia; mantenha a recorrencia";
    const score = overdueReviews * 1_000_000 + deficit * 1_000 + (total >= 10 ? 100 - accuracy : 0);
    return { accuracy, color: subject.color, goalMinutes: subject.plannedMinutesPerWeek, overdueReviews, reason, score, studiedMinutes, subjectId: subject.id, subjectName: subject.name };
  }).sort((a, b) => b.score - a.score || a.subjectName.localeCompare(b.subjectName));
}

export function calculateStudyMetrics(sessions: StudySessionCore[], reviews: StudyReview[]) {
  const weekStart = startOfWeek();
  const weekly = sessions.filter((session) => new Date(session.startedAt) >= weekStart);
  const studiedMinutes = weekly.reduce((total, session) => total + session.durationMinutes, 0);
  const totalQuestions = weekly.reduce((total, session) => total + (session.totalQuestions ?? 0), 0);
  const correctQuestions = weekly.reduce((total, session) => total + (session.correctQuestions ?? 0), 0);
  const pending = reviews.filter((review) => review.status === "pending");
  const now = new Date();
  return {
    studiedMinutes,
    totalQuestions,
    correctQuestions,
    accuracy: totalQuestions ? Math.round((correctQuestions / totalQuestions) * 100) : 0,
    pendingReviews: pending.length,
    overdueReviews: pending.filter((review) => new Date(review.dueAt) <= now).length,
  };
}

export function calculateStudyTodaySummary(
  subjects: StudySubjectCore[], sessions: StudySessionCore[], reviews: StudyReview[], value = new Date()
) {
  const dayStart = new Date(value);
  dayStart.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter((session) => {
    const startedAt = new Date(session.startedAt);
    return startedAt >= dayStart && startedAt <= value;
  });
  const studiedMinutes = todaySessions.reduce((total, session) => total + session.durationMinutes, 0);
  const totalQuestions = todaySessions.reduce((total, session) => total + (session.totalQuestions ?? 0), 0);
  const correctQuestions = todaySessions.reduce((total, session) => total + (session.correctQuestions ?? 0), 0);
  const goalMinutes = Math.round(
    subjects
      .filter((subject) => subject.isActive)
      .reduce((total, subject) => total + subject.plannedMinutesPerWeek, 0) / 7,
  );
  const overdueReviews = reviews
    .filter((review) => review.status === "pending" && new Date(review.dueAt) <= value)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  return {
    accuracy: totalQuestions ? Math.round((correctQuestions / totalQuestions) * 100) : null,
    goalMinutes,
    goalProgress: goalMinutes ? Math.min(100, Math.round((studiedMinutes / goalMinutes) * 100)) : 0,
    overdueReviews,
    studiedMinutes,
    totalQuestions,
  };
}

export function deriveStudyRecommendation(
  subjects: StudySubjectCore[], sessions: StudySessionCore[], reviews: StudyReview[]
): StudyRecommendation | null {
  const active = subjects.filter((subject) => subject.isActive);
  if (!active.length) return null;
  const overdue = reviews.filter((review) => review.status === "pending" && new Date(review.dueAt) <= new Date())
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
  if (overdue) {
    const subject = active.find((item) => item.id === overdue.subjectId);
    if (subject) return {
      subjectId: subject.id, subjectName: subject.name, topicId: overdue.topicId,
      topicName: overdue.topic?.name, reason: "Revisao vencida mais antiga", durationMinutes: 25,
    };
  }

  const weekStart = startOfWeek();
  const deficits = active.map((subject) => {
    const studied = sessions.filter((session) => session.subjectId === subject.id && new Date(session.startedAt) >= weekStart)
      .reduce((total, session) => total + session.durationMinutes, 0);
    return { subject, deficit: subject.plannedMinutesPerWeek - studied };
  }).sort((a, b) => b.deficit - a.deficit);
  if (deficits[0]?.deficit > 0) return {
    subjectId: deficits[0].subject.id, subjectName: deficits[0].subject.name,
    reason: `Deficit de ${deficits[0].deficit} min na meta semanal`, durationMinutes: 25,
  };

  const accuracy = active.map((subject) => {
    const recent = sessions.filter((session) => session.subjectId === subject.id && (session.totalQuestions ?? 0) > 0);
    const total = recent.reduce((sum, session) => sum + (session.totalQuestions ?? 0), 0);
    const correct = recent.reduce((sum, session) => sum + (session.correctQuestions ?? 0), 0);
    return { subject, total, value: total ? correct / total : 1 };
  }).filter((item) => item.total >= 10).sort((a, b) => a.value - b.value)[0];
  if (accuracy) return {
    subjectId: accuracy.subject.id, subjectName: accuracy.subject.name,
    reason: `Menor acuracia recente (${Math.round(accuracy.value * 100)}%)`, durationMinutes: 25,
  };

  const lastStudied = new Map<string, number>();
  sessions.forEach((session) => lastStudied.set(session.subjectId, Math.max(lastStudied.get(session.subjectId) ?? 0, new Date(session.startedAt).getTime())));
  const oldest = [...active].sort((a, b) => (lastStudied.get(a.id) ?? 0) - (lastStudied.get(b.id) ?? 0))[0];
  return { subjectId: oldest.id, subjectName: oldest.name, reason: lastStudied.has(oldest.id) ? "Materia estudada ha mais tempo" : "Primeira materia ativa sem historico", durationMinutes: 25 };
}
