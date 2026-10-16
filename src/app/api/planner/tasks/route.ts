import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { isPlannerTaskStatus, normalizePlannerTaskInput, parseOptionalDate } from "@/lib/planner";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const status = req.nextUrl.searchParams.get("status");
  const goalId = req.nextUrl.searchParams.get("goalId");
  const from = parseOptionalDate(req.nextUrl.searchParams.get("from"));
  const to = parseOptionalDate(req.nextUrl.searchParams.get("to"));
  if ((status && !isPlannerTaskStatus(status)) || "error" in from || "error" in to) {
    return NextResponse.json({ message: "Filtros inválidos." }, { status: 400 });
  }
  const tasks = await prisma.plannerTask.findMany({
    where: {
      userId,
      status: status || undefined,
      goalId: goalId || undefined,
      dueDate: from.value || to.value ? { gte: from.value ?? undefined, lt: to.value ?? undefined } : undefined,
    },
    include: { goal: { select: { color: true, id: true, title: true } } },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const result = normalizePlannerTaskInput(body as Record<string, unknown>);
  if ("error" in result) return NextResponse.json({ message: result.error }, { status: 400 });
  const goal = result.data.goalId
    ? await prisma.goal.findFirst({ where: { id: result.data.goalId, userId }, select: { id: true } })
    : null;
  if (result.data.goalId && !goal) return NextResponse.json({ message: "Meta não encontrada." }, { status: 400 });
  const task = await prisma.plannerTask.create({
    data: { ...result.data, goalId: goal?.id ?? null, title: result.data.title!, userId },
    include: { goal: { select: { color: true, id: true, title: true } } },
  });
  return NextResponse.json(task, { status: 201 });
}
