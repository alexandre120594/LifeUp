import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json().catch(() => ({}));
  const rawIds: unknown[] = Array.isArray(body.ids) ? body.ids : [];
  const ids: string[] = [...new Set(rawIds.filter((id): id is string => typeof id === "string" && id.length > 0))];
  if (!ids.length) return NextResponse.json({ message: "Selecione ao menos um compromisso." }, { status: 400 });
  const linked = await prisma.financialCommitment.findFirst({
    where: { id: { in: ids }, plannedPurchaseId: { not: null }, userId },
    select: { id: true },
  });
  if (linked) return NextResponse.json({ message: "Cancele as compras vinculadas pelo Planner antes de excluir seus compromissos." }, { status: 409 });
  const result = await prisma.financialCommitment.deleteMany({ where: { id: { in: ids }, userId } });
  return NextResponse.json({ count: result.count });
}
