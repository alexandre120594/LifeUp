import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const { id } = await context.params;
  const purchase = await prisma.plannedPurchase.findFirst({
    where: { id, userId },
    include: { financialCommitments: { select: { id: true, status: true } } },
  });
  if (!purchase) return NextResponse.json({ message: "Compra não encontrada." }, { status: 404 });
  if (purchase.status === "bought") return NextResponse.json({ message: "Uma compra realizada não pode ser cancelada." }, { status: 409 });
  if (purchase.status === "cancelled") return NextResponse.json({ message: "A compra já está cancelada." }, { status: 409 });
  if (purchase.status === "planned" && !purchase.financialCommitments.length) {
    return NextResponse.json({ message: "A compra planejada está sem compromissos financeiros associados." }, { status: 409 });
  }
  if (purchase.financialCommitments.some((commitment) => commitment.status === "completed")) {
    return NextResponse.json({ message: "Desfaça as parcelas já quitadas antes de cancelar a compra." }, { status: 409 });
  }
  const updated = await prisma.$transaction(async (tx) => {
    await tx.financialCommitment.updateMany({
      where: { plannedPurchaseId: id, status: "active", userId },
      data: { status: "cancelled" },
    });
    return tx.plannedPurchase.update({
      where: { id },
      data: { status: "cancelled" },
      include: { financialCommitments: { include: { account: true, category: true }, orderBy: { dueDate: "asc" } } },
    });
  });
  return NextResponse.json({
    ...updated,
    estimatedAmount: updated.estimatedAmount === null ? null : Number(updated.estimatedAmount),
    financialCommitments: updated.financialCommitments.map((commitment) => ({
      ...commitment,
      amount: Number(commitment.amount),
    })),
  });
}
