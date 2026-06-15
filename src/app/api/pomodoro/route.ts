import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { buildPomodoroDashboard } from "@/lib/pomodoro";
import { NextRequest, NextResponse } from "next/server";

function normalizeSession(session: {
  durationMinutes: number;
  endedAt: Date;
  focusType: string;
  id: string;
  notes: string | null;
  startedAt: Date;
  subject: {
    color: string | null;
    createdAt: Date;
    id: string;
    name: string;
    notes: string | null;
    plannedHoursPerWeek: number;
    updatedAt: Date;
  } | null;
  subjectId: string | null;
  task: {
    habit: {
      frequency: string;
      history: string[];
      id: string;
      projectId: string;
      reminderTime: string | null;
      streak: number;
      title: string;
    } | null;
    id: string;
    project: { id: string; title: string; color: string | null; userId: number; createdAt: Date };
    projectId: string;
    title: string;
  } | null;
  taskId: string | null;
}) {
  return {
    durationMinutes: session.durationMinutes,
    endedAt: session.endedAt,
    focusType: "study" as const,
    id: session.id,
    notes: session.notes,
    startedAt: session.startedAt,
    subject: session.subject,
    subjectId: session.subjectId,
    task: session.task
      ? {
          habit: session.task.habit,
          id: session.task.id,
          project: session.task.project,
          projectId: session.task.projectId,
          title: session.task.title,
        }
      : null,
    taskId: session.taskId,
  };
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const sessions = await prisma.pomodoroSession.findMany({
    where: { userId },
    include: {
      subject: true,
      task: {
        include: {
          habit: true,
          project: true,
        },
      },
    },
    orderBy: { endedAt: "desc" },
  });

  return NextResponse.json(
    buildPomodoroDashboard(sessions.map(normalizeSession))
  );
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { durationMinutes, endedAt, notes, startedAt, subjectId } =
      await req.json();
    const parsedDuration = Number(durationMinutes);
    const parsedStartedAt = new Date(startedAt);
    const parsedEndedAt = new Date(endedAt);
    const parsedSubjectId = typeof subjectId === "string" ? subjectId.trim() : "";

    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration <= 0 ||
      parsedDuration > 24 * 60 ||
      !parsedSubjectId ||
      Number.isNaN(parsedStartedAt.getTime()) ||
      Number.isNaN(parsedEndedAt.getTime()) ||
      parsedEndedAt < parsedStartedAt
    ) {
      return NextResponse.json(
        { error: "Valid subject, duration, start, and end times are required." },
        { status: 400 }
      );
    }

    const subject = await prisma.studySubject.findFirst({
      where: { id: parsedSubjectId, userId },
      select: { id: true },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Study subject not found." },
        { status: 404 }
      );
    }

    const session = await prisma.pomodoroSession.create({
      data: {
        durationMinutes: parsedDuration,
        endedAt: parsedEndedAt,
        focusType: "study",
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
        startedAt: parsedStartedAt,
        subjectId: parsedSubjectId,
        userId,
      },
      include: {
        subject: true,
        task: {
          include: {
            habit: true,
            project: true,
          },
        },
      },
    });

    return NextResponse.json(normalizeSession(session), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to save pomodoro session.", detail: error },
      { status: 500 }
    );
  }
}
