import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type SubjectPayload = {
  color?: unknown;
  name?: unknown;
  notes?: unknown;
  plannedHoursPerWeek?: unknown;
};

function normalizeSubjectPayload(body: SubjectPayload) {
  const plannedHoursPerWeek = Math.max(
    1,
    Math.floor(Number(body.plannedHoursPerWeek) || 1)
  );

  return {
    color: typeof body.color === "string" && body.color ? body.color : null,
    name: typeof body.name === "string" ? body.name.trim() : "",
    notes: typeof body.notes === "string" && body.notes ? body.notes : null,
    plannedHoursPerWeek,
  };
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const subjects = await prisma.studySubject.findMany({
    where: { userId },
    include: {
      scheduleBlocks: {
        orderBy: [{ dayIndex: "asc" }, { hour: "asc" }],
      },
    },
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

    const subject = await prisma.studySubject.create({
      data: {
        ...payload,
        userId,
      },
      include: {
        scheduleBlocks: true,
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create study subject." },
      { status: 500 }
    );
  }
}
