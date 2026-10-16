import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { buildInstallmentSchedule } from "@/lib/finance-core";
import { normalizePlannedPurchaseInput } from "@/lib/planner";
import prisma from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

function serialize<T extends { estimatedAmount: unknown; financialCommitments?: Array<{ amount: unknown }> }>(purchase: T) {
  return {
    ...purchase,
    estimatedAmount: purchase.estimatedAmount === null ? null : Number(purchase.estimatedAmount),
    financialCommitments: purchase.financialCommitments?.map((commitment) => ({
      ...commitment,
      amount: Number(commitment.amount),
    })) ?? [],
  };
}

export async function PATCH(req: NextRequest, context: Context) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const current = await prisma.plannedPurchase.findFirst({
    where: { id, userId },
    include: { financialCommitments: { orderBy: { dueDate: "asc" } } },
  });
  if (!current) return NextResponse.json({ message: "Compra não encontrada." }, { status: 404 });
  if (current.status === "bought" || current.status === "cancelled") {
    return NextResponse.json({ message: "Compras finalizadas permanecem no histórico e não podem ser editadas." }, { status: 409 });
  }
  if (current.financialCommitments.some((commitment) => commitment.status === "completed")) {
    return NextResponse.json({ message: "Desfaça as parcelas já quitadas antes de editar a compra." }, { status: 409 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const result = normalizePlannedPurchaseInput(body as Record<string, unknown>, true);
  if ("error" in result) return NextResponse.json({ message: result.error }, { status: 400 });
  const goal = result.data.goalId
    ? await prisma.goal.findFirst({ where: { id: result.data.goalId, userId }, select: { id: true } })
    : null;
  if (result.data.goalId && !goal) return NextResponse.json({ message: "Meta não encontrada." }, { status: 400 });

  const nextAmount = result.data.estimatedAmount === undefined ? current.estimatedAmount : result.data.estimatedAmount;
  const nextDate = result.data.plannedDate === undefined ? current.plannedDate : result.data.plannedDate;
  if (current.status === "planned" && (!nextAmount || !nextDate || !current.financialCommitments.length)) {
    return NextResponse.json({ message: "Uma compra planejada exige valor, data e compromisso financeiro." }, { status: 409 });
  }
  const purchase = await prisma.$transaction(async (tx) => {
    const updated = await tx.plannedPurchase.update({
      where: { id },
      data: { ...result.data, goalId: result.data.goalId === undefined ? undefined : goal?.id ?? null },
      include: {
        financialCommitments: { include: { account: true, category: true }, orderBy: { dueDate: "asc" } },
        goal: { select: { color: true, id: true, title: true } },
      },
    });
    if (current.status === "planned" && current.financialCommitments.length) {
      const schedule = buildInstallmentSchedule(Number(nextAmount), current.financialCommitments.length, nextDate!);
      for (const [index, commitment] of current.financialCommitments.entries()) {
        await tx.financialCommitment.update({
          where: { id: commitment.id },
          data: {
            amount: schedule[index].amount,
            dueDate: schedule[index].date,
            notes: updated.description,
            title: updated.title,
          },
        });
      }
    }
    return updated;
  });
  return NextResponse.json(serialize(purchase));
}

export async function DELETE(_req: NextRequest, context: Context) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const current = await prisma.plannedPurchase.findFirst({ where: { id, userId }, select: { id: true, status: true } });
  if (!current) return NextResponse.json({ message: "Compra não encontrada." }, { status: 404 });
  if (current.status === "planned") return NextResponse.json({ message: "Cancele a compra antes de excluí-la." }, { status: 409 });
  if (current.status === "bought") return NextResponse.json({ message: "Compras realizadas permanecem no histórico." }, { status: 409 });
  await prisma.plannedPurchase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
