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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const payload = normalizeSubjectPayload(
      (await req.json()) as SubjectPayload
    );
    const subject = await prisma.studySubject.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    if (!payload.name) {
      return NextResponse.json(
        { message: "Subject name is required." },
        { status: 400 }
      );
    }

    const updatedSubject = await prisma.studySubject.update({
      where: { id },
      data: payload,
      include: {
        scheduleBlocks: {
          orderBy: [{ dayIndex: "asc" }, { hour: "asc" }],
        },
      },
    });

    return NextResponse.json(updatedSubject);
  } catch {
    return NextResponse.json(
      { message: "Unable to update study subject." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const subject = await prisma.studySubject.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Study subject not found." },
        { status: 404 }
      );
    }

    await prisma.studySubject.delete({ where: { id } });

    return NextResponse.json({ message: "Study subject deleted." });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete study subject." },
      { status: 500 }
    );
  }
}
