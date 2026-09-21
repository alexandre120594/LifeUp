import { NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateStudyMetrics, deriveStudyRecommendation } from "@/lib/study-core";
import type { StudyReview, StudySessionCore, StudySubjectCore } from "@/types/Study";

export async function GET() {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const [subjectsRaw, sessionsRaw, reviewsRaw] = await Promise.all([
    prisma.studySubject.findMany({ where: { userId }, include: { topics: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }),
    prisma.studySession.findMany({ where: { userId }, include: { subject: true, topic: true }, orderBy: { startedAt: "desc" }, take: 100 }),
    prisma.studyReview.findMany({ where: { userId }, include: { subject: true, topic: true }, orderBy: { dueAt: "asc" } }),
  ]);
  const subjects: StudySubjectCore[] = subjectsRaw.map((subject) => ({
    id: subject.id, name: subject.name, color: subject.color, notes: subject.notes,
    isActive: subject.isActive, plannedMinutesPerWeek: subject.plannedMinutesPerWeek,
    topics: subject.topics,
  }));
  const sessions: StudySessionCore[] = sessionsRaw.map((session) => ({
    id: session.id, subjectId: session.subjectId, topicId: session.topicId,
    startedAt: session.startedAt.toISOString(), endedAt: session.endedAt.toISOString(),
    durationMinutes: session.durationMinutes, totalQuestions: session.totalQuestions,
    correctQuestions: session.correctQuestions, notes: session.notes,
    subject: session.subject, topic: session.topic,
  }));
  const reviews: StudyReview[] = reviewsRaw.map((review) => ({
    id: review.id, prompt: review.prompt, answer: review.answer, notes: review.notes,
    dueAt: review.dueAt.toISOString(), status: review.status as StudyReview["status"],
    lastReviewedAt: review.lastReviewedAt?.toISOString(), subjectId: review.subjectId,
    topicId: review.topicId, subject: review.subject, topic: review.topic,
  }));
  return NextResponse.json({
    subjects, sessions, reviews,
    recommendation: deriveStudyRecommendation(subjects, sessions, reviews),
    metrics: calculateStudyMetrics(sessions, reviews),
  });
}
