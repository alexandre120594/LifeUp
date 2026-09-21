import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const openingBalance = Number(body.openingBalance ?? 0);
  if (!name || !Number.isFinite(openingBalance)) {
    return NextResponse.json({ message: "Nome e saldo inicial valido sao obrigatorios." }, { status: 400 });
  }
  const account = await prisma.financialAccount.create({ data: { name, openingBalance, userId } });
  return NextResponse.json({ ...account, balance: Number(account.openingBalance), openingBalance: Number(account.openingBalance) }, { status: 201 });
}
