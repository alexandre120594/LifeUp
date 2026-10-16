import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { buildInstallmentSchedule } from "@/lib/finance-core";
import { parseOptionalDate } from "@/lib/planner";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const payload = body as Record<string, unknown>;
  const amount = Number(payload.estimatedAmount);
  const installmentCount = payload.installmentCount === undefined ? 1 : Number(payload.installmentCount);
  const plannedDate = parseOptionalDate(payload.plannedDate);
  if (!Number.isFinite(amount) || amount <= 0 || "error" in plannedDate || !plannedDate.value) {
    return NextResponse.json({ message: "Informe valor e data válidos para planejar a compra." }, { status: 400 });
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 60) {
    return NextResponse.json({ message: "A quantidade de parcelas deve estar entre 1 e 60." }, { status: 400 });
  }
  const [purchase, account, category] = await Promise.all([
    prisma.plannedPurchase.findFirst({
      where: { id, userId },
      include: { financialCommitments: { select: { id: true } } },
    }),
    payload.accountId ? prisma.financialAccount.findFirst({ where: { id: String(payload.accountId), isActive: true, userId } }) : null,
    payload.categoryId ? prisma.financialCategory.findFirst({ where: { id: String(payload.categoryId), type: "expense", userId } }) : null,
  ]);
  if (!purchase) return NextResponse.json({ message: "Compra não encontrada." }, { status: 404 });
  if (purchase.status !== "idea" || purchase.financialCommitments.length) {
    return NextResponse.json({ message: "Somente ideias ainda não planejadas podem criar compromissos." }, { status: 409 });
  }
  if ((payload.accountId && !account) || (payload.categoryId && !category)) {
    return NextResponse.json({ message: "Conta ou categoria inválida." }, { status: 400 });
  }

  const planned = await prisma.$transaction(async (tx) => {
    const claimed = await tx.plannedPurchase.updateMany({
      where: { id, status: "idea", financialCommitments: { none: {} }, userId },
      data: { estimatedAmount: amount, plannedDate: plannedDate.value, status: "planned" },
    });
    if (claimed.count !== 1) throw new Error("PURCHASE_ALREADY_PLANNED");
    const installmentGroupId = installmentCount > 1 ? randomUUID() : null;
    for (const installment of buildInstallmentSchedule(amount, installmentCount, plannedDate.value!)) {
      await tx.financialCommitment.create({
        data: {
          accountId: account?.id ?? null,
          amount: installment.amount,
          categoryId: category?.id ?? null,
          dueDate: installment.date,
          installmentCount: installmentGroupId ? installmentCount : null,
          installmentGroupId,
          installmentNumber: installmentGroupId ? installment.installmentNumber : null,
          notes: purchase.description,
          plannedPurchaseId: id,
          recurrence: "none",
          status: "active",
          title: purchase.title,
          type: "expense",
          userId,
        },
      });
    }
    return tx.plannedPurchase.findUniqueOrThrow({
      where: { id },
      include: {
        financialCommitments: { include: { account: true, category: true }, orderBy: { dueDate: "asc" } },
        goal: { select: { color: true, id: true, title: true } },
      },
    });
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "PURCHASE_ALREADY_PLANNED") return null;
    throw error;
  });
  if (!planned) return NextResponse.json({ message: "A compra já foi planejada por outra operação." }, { status: 409 });
  return NextResponse.json({
    ...planned,
    estimatedAmount: Number(planned.estimatedAmount),
    financialCommitments: planned.financialCommitments.map((commitment) => ({
      ...commitment,
      amount: Number(commitment.amount),
    })),
  });
}
