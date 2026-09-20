import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const lifeHabitKinds = new Set(["good", "bad"]);

type LifeHabitPayload = {
  color?: unknown;
  kind?: unknown;
  notes?: unknown;
  reward?: unknown;
  targetDays?: unknown;
  title?: unknown;
};

function normalizeLifeHabitPayload(body: LifeHabitPayload) {
  const kind = typeof body.kind === "string" ? body.kind : "good";
  const parsedTargetDays =
    typeof body.targetDays === "number"
      ? body.targetDays
      : typeof body.targetDays === "string"
        ? Number.parseInt(body.targetDays, 10)
        : 30;

  return {
    color: typeof body.color === "string" && body.color ? body.color : null,
    kind: lifeHabitKinds.has(kind) ? kind : "good",
    notes: typeof body.notes === "string" && body.notes ? body.notes : null,
    reward: typeof body.reward === "string" && body.reward ? body.reward : null,
    targetDays: Number.isFinite(parsedTargetDays)
      ? Math.min(Math.max(parsedTargetDays, 10), 365)
      : 30,
    title: typeof body.title === "string" ? body.title.trim() : "",
  };
}

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const habits = await prisma.lifeHabit.findMany({
    where: { userId },
    orderBy: [{ kind: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const payload = normalizeLifeHabitPayload(
      (await req.json()) as LifeHabitPayload
    );

    if (!payload.title) {
      return NextResponse.json(
        { message: "Habit name is required." },
        { status: 400 }
      );
    }

    const habit = await prisma.lifeHabit.create({
      data: {
        ...payload,
        lastBadAt: payload.kind === "bad" ? new Date() : null,
        userId,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create life habit." },
      { status: 500 }
    );
  }
}
