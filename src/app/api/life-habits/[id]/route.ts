import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const dayKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const lifeHabitKinds = new Set(["good", "bad"]);

type LifeHabitPatchPayload = {
  action?: unknown;
  color?: unknown;
  dayKey?: unknown;
  kind?: unknown;
  notes?: unknown;
  title?: unknown;
};

function normalizeDayKey(value: unknown) {
  if (typeof value === "string" && dayKeyPattern.test(value)) {
    return value;
  }

  return new Date().toISOString().slice(0, 10);
}

function normalizePatchPayload(body: LifeHabitPatchPayload) {
  const data: {
    color?: string | null;
    kind?: string;
    notes?: string | null;
    title?: string;
  } = {};

  if (typeof body.title === "string") {
    data.title = body.title.trim();
  }

  if (typeof body.kind === "string" && lifeHabitKinds.has(body.kind)) {
    data.kind = body.kind;
  }

  if ("color" in body) {
    data.color = typeof body.color === "string" && body.color ? body.color : null;
  }

  if ("notes" in body) {
    data.notes = typeof body.notes === "string" && body.notes ? body.notes : null;
  }

  return data;
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
    const body = (await req.json()) as LifeHabitPatchPayload;
    const habit = await prisma.lifeHabit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json(
        { message: "Life habit not found." },
        { status: 404 }
      );
    }

    if (body.action === "toggle-checkin") {
      if (habit.kind !== "good") {
        return NextResponse.json(
          { message: "Only good habits can be checked out." },
          { status: 400 }
        );
      }

      const dayKey = normalizeDayKey(body.dayKey);
      const hasCheckin = habit.checkins.includes(dayKey);
      const checkins = hasCheckin
        ? habit.checkins.filter((item) => item !== dayKey)
        : [...habit.checkins, dayKey];

      const updatedHabit = await prisma.lifeHabit.update({
        where: { id },
        data: { checkins },
      });

      return NextResponse.json(updatedHabit);
    }

    if (body.action === "reset-bad") {
      if (habit.kind !== "bad") {
        return NextResponse.json(
          { message: "Only bad habits can be reset." },
          { status: 400 }
        );
      }

      const dayKey = normalizeDayKey(body.dayKey);
      const updatedHabit = await prisma.lifeHabit.update({
        where: { id },
        data: {
          badEvents: [...habit.badEvents, dayKey],
          lastBadAt: new Date(),
        },
      });

      return NextResponse.json(updatedHabit);
    }

    const data = normalizePatchPayload(body);

    if ("title" in data && !data.title) {
      return NextResponse.json(
        { message: "Habit name is required." },
        { status: 400 }
      );
    }

    const updatedHabit = await prisma.lifeHabit.update({
      where: { id },
      data: {
        ...data,
        checkins: data.kind === "bad" ? [] : undefined,
        lastBadAt: data.kind === "bad" ? habit.lastBadAt ?? new Date() : null,
      },
    });

    return NextResponse.json(updatedHabit);
  } catch {
    return NextResponse.json(
      { message: "Unable to update life habit." },
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
    const habit = await prisma.lifeHabit.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!habit) {
      return NextResponse.json(
        { message: "Life habit not found." },
        { status: 404 }
      );
    }

    await prisma.lifeHabit.delete({ where: { id } });

    return NextResponse.json({ message: "Life habit deleted." });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete life habit." },
      { status: 500 }
    );
  }
}
