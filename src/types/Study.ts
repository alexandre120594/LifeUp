export type StudyReviewStatus = "pending" | "mastered";

export interface StudyTopic {
  id: string;
  name: string;
  isActive: boolean;
  subjectId: string;
}

export interface StudySubjectCore {
  id: string;
  name: string;
  color?: string | null;
  plannedMinutesPerWeek: number;
  notes?: string | null;
  isActive: boolean;
  topics: StudyTopic[];
}

export interface StudySessionCore {
  id: string;
  subjectId: string;
  topicId?: string | null;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  totalQuestions?: number | null;
  correctQuestions?: number | null;
  notes?: string | null;
  subject?: Pick<StudySubjectCore, "id" | "name" | "color">;
  topic?: StudyTopic | null;
}

export interface StudyReview {
  id: string;
  prompt: string;
  answer?: string | null;
  notes?: string | null;
  dueAt: string;
  status: StudyReviewStatus;
  lastReviewedAt?: string | null;
  subjectId: string;
  topicId?: string | null;
  subject?: Pick<StudySubjectCore, "id" | "name" | "color">;
  topic?: StudyTopic | null;
}

export interface StudyRecommendation {
  subjectId: string;
  subjectName: string;
  topicId?: string | null;
  topicName?: string | null;
  reason: string;
  durationMinutes: number;
}

export interface StudyWorkspace {
  subjects: StudySubjectCore[];
  sessions: StudySessionCore[];
  reviews: StudyReview[];
  recommendation: StudyRecommendation | null;
  metrics: {
    studiedMinutes: number;
    totalQuestions: number;
    correctQuestions: number;
    accuracy: number;
    pendingReviews: number;
    overdueReviews: number;
  };
}

export interface StudyTopicInput { name: string; subjectId: string; }
export interface StudySubjectInput { name: string; plannedMinutesPerWeek?: number; }
export interface StudyReviewInput {
  prompt: string;
  answer?: string | null;
  notes?: string | null;
  dueAt: string;
  subjectId: string;
  topicId?: string | null;
}

export interface StudySessionCoreInput {
  subjectId: string;
  topicId?: string | null;
  startedAt: string;
  endedAt: string;
  totalQuestions?: number | null;
  correctQuestions?: number | null;
  notes?: string | null;
  reviews?: Array<Pick<StudyReviewInput, "prompt" | "answer" | "notes" | "dueAt">>;
}
