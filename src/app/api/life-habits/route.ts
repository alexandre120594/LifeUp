import { requireCurrentUserId } from "@/lib/auth";
import { normalizeHabitPayload, type HabitPayload } from "@/lib/life-habit-input";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  const archived = req.nextUrl.searchParams.get("archived") === "true";
  const habits = await prisma.lifeHabit.findMany({
    where: { userId, archivedAt: archived ? { not: null } : null },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  try {
    const payload = normalizeHabitPayload((await req.json()) as HabitPayload);
    if (!payload.title) return NextResponse.json({ message: "Informe o nome do hábito." }, { status: 400 });
    if (payload.interval === "weekdays" && !payload.scheduleWeekdays?.length) {
      return NextResponse.json({ message: "Escolha ao menos um dia da semana." }, { status: 400 });
    }
    if (payload.kind === "quantitative" && !payload.unitLabel) {
      return NextResponse.json({ message: "Informe a unidade da meta quantitativa." }, { status: 400 });
    }

    const last = await prisma.lifeHabit.findFirst({ where: { userId }, orderBy: { position: "desc" }, select: { position: true } });
    const habit = await prisma.lifeHabit.create({
      data: { ...(payload as unknown as Prisma.LifeHabitUncheckedCreateInput), position: (last?.position ?? -1) + 1, userId },
    });
    return NextResponse.json(habit, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Não foi possível criar o hábito." }, { status: 500 });
  }
}
