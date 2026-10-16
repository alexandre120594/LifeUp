import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { normalizePlannerTaskInput } from "@/lib/planner";
import prisma from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const current = await prisma.plannerTask.findFirst({ where: { id, userId }, select: { id: true } });
  if (!current) return NextResponse.json({ message: "Tarefa não encontrada." }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const result = normalizePlannerTaskInput(body as Record<string, unknown>, true);
  if ("error" in result) return NextResponse.json({ message: result.error }, { status: 400 });
  const goal = result.data.goalId
    ? await prisma.goal.findFirst({ where: { id: result.data.goalId, userId }, select: { id: true } })
    : null;
  if (result.data.goalId && !goal) return NextResponse.json({ message: "Meta não encontrada." }, { status: 400 });
  const task = await prisma.plannerTask.update({
    where: { id },
    data: { ...result.data, goalId: result.data.goalId === undefined ? undefined : goal?.id ?? null },
    include: { goal: { select: { color: true, id: true, title: true } } },
  });
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, context: Context) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const current = await prisma.plannerTask.findFirst({ where: { id, userId }, select: { id: true } });
  if (!current) return NextResponse.json({ message: "Tarefa não encontrada." }, { status: 404 });
  await prisma.plannerTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
