import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { getMonthRange } from "@/lib/finance-core";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json().catch(() => ({}));
  const rawIds: unknown[] = Array.isArray(body.ids) ? body.ids : [];
  const ids: string[] = [...new Set(rawIds.filter((id): id is string => typeof id === "string" && id.length > 0))];
  if (Array.isArray(body.ids) && !ids.length) {
    return NextResponse.json({ message: "Selecione ao menos uma movimentacao." }, { status: 400 });
  }
  if (ids.length) {
    const result = await prisma.financialTransaction.deleteMany({ where: { id: { in: ids }, userId } });
    return NextResponse.json({ count: result.count });
  }

  const year = Number(body.period?.year ?? body.year);
  const month = body.period?.month === undefined ? undefined : Number(body.period.month);
  if (!Number.isInteger(year) || year < 1900 || year > 2200 || (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12))) {
    return NextResponse.json({ message: "Informe ids ou um periodo valido." }, { status: 400 });
  }
  const range = month
    ? getMonthRange(new Date(year, month - 1, 1))
    : { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
  const result = await prisma.financialTransaction.deleteMany({
    where: { date: { gte: range.start, lt: range.end }, userId },
  });
  return NextResponse.json({ count: result.count });
}
