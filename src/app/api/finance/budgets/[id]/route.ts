import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, categoryId, month, title } = await req.json();
    const parsedAmount = Number(amount);

    if (
      !title ||
      !categoryId ||
      !/^\d{4}-\d{2}$/.test(month) ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return NextResponse.json(
        { message: "Valid title, amount, month, and category are required." },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.update({
      where: { id, userId: DEV_USER_ID },
      data: {
        amount: parsedAmount,
        categoryId,
        month,
        title,
      },
      include: { category: true },
    });

    return NextResponse.json({ ...budget, amount: Number(budget.amount) });
  } catch {
    return NextResponse.json(
      { message: "Unable to update budget." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.budget.delete({
      where: { id, userId: DEV_USER_ID },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete budget." },
      { status: 500 }
    );
  }
}
