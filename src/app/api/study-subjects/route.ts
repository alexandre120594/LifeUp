import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type SubjectPayload = {
  color?: unknown;
  name?: unknown;
  notes?: unknown;
  plannedMinutesPerWeek?: unknown;
};

function normalizeSubjectPayload(body: SubjectPayload) {
  const requestedMinutes = Number(body.plannedMinutesPerWeek);
  const plannedMinutesPerWeek = Number.isFinite(requestedMinutes)
    ? Math.max(0, Math.floor(requestedMinutes))
    : 0;

  return {
    color: typeof body.color === "string" && body.color ? body.color : null,
    name: typeof body.name === "string" ? body.name.trim() : "",
    notes: typeof body.notes === "string" && body.notes ? body.notes : null,
    plannedMinutesPerWeek,
  };
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const subjects = await prisma.studySubject.findMany({
    where: { userId },
    include: { topics: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeSubjectPayload(
      (await req.json()) as SubjectPayload
    );

    if (!payload.name) {
      return NextResponse.json(
        { message: "Subject name is required." },
        { status: 400 }
      );
    }

    const existingSubject = await prisma.studySubject.findFirst({
      where: {
        name: { equals: payload.name, mode: "insensitive" },
        userId,
      },
      include: { topics: true },
    });

    if (existingSubject) {
      return NextResponse.json(existingSubject);
    }

    const subject = await prisma.studySubject.create({
      data: {
        ...payload,
        userId,
      },
      include: { topics: true },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create study subject." },
      { status: 500 }
    );
  }
}
