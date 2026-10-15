import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isTrtPiPlanId, TRT_PI_PLAN_TOTAL_DAYS } from "@/lib/study-plan";

export async function GET(request: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  const planId = request.nextUrl.searchParams.get("planId");
  if (!isTrtPiPlanId(planId)) {
    return NextResponse.json({ message: "Cronograma inválido." }, { status: 400 });
  }

  const progress = await prisma.studyPlanProgress.findMany({
    where: { planId, userId },
    orderBy: { dayNumber: "asc" },
    select: { completed: true, dayNumber: true, score: true },
  });

  return NextResponse.json(progress);
}

export async function PATCH(request: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  const body = await request.json().catch(() => null) as {
    completed?: unknown;
    dayNumber?: unknown;
    planId?: unknown;
    score?: unknown;
  } | null;
  const includesCompleted = Boolean(body && Object.prototype.hasOwnProperty.call(body, "completed"));
  const includesScore = Boolean(body && Object.prototype.hasOwnProperty.call(body, "score"));

  if (
    !body ||
    !isTrtPiPlanId(body.planId) ||
    !Number.isInteger(body.dayNumber) ||
    Number(body.dayNumber) < 1 ||
    Number(body.dayNumber) > TRT_PI_PLAN_TOTAL_DAYS ||
    (!includesCompleted && !includesScore) ||
    (includesCompleted && typeof body.completed !== "boolean") ||
    (includesScore && body.score !== null && (!Number.isInteger(body.score) || Number(body.score) < 0 || Number(body.score) > 100))
  ) {
    return NextResponse.json({ message: "Progresso do cronograma inválido." }, { status: 400 });
  }

  const dayNumber = Number(body.dayNumber);
  const completed = typeof body.completed === "boolean" ? body.completed : false;
  const score = body.score === null || body.score === undefined ? null : Number(body.score);
  const progress = await prisma.studyPlanProgress.upsert({
    where: { userId_planId_dayNumber: { dayNumber, planId: body.planId, userId } },
    create: { completed, dayNumber, planId: body.planId, score, userId },
    update: {
      ...(includesCompleted ? { completed } : {}),
      ...(includesScore ? { score } : {}),
    },
    select: { completed: true, dayNumber: true, score: true },
  });

  return NextResponse.json(progress);
}

export async function DELETE(request: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  const planId = request.nextUrl.searchParams.get("planId");
  if (!isTrtPiPlanId(planId)) {
    return NextResponse.json({ message: "Cronograma inválido." }, { status: 400 });
  }

  await prisma.studyPlanProgress.deleteMany({ where: { planId, userId } });
  return NextResponse.json({ ok: true });
}
