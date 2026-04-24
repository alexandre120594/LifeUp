import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, categoryId, date, notes, title, type } = await req.json();
    const parsedAmount = Number(amount);
    const parsedDate = date ? new Date(date) : null;

    if (
      !title ||
      !categoryId ||
      !["income", "expense"].includes(type) ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !parsedDate ||
      Number.isNaN(parsedDate.getTime())
    ) {
      return NextResponse.json(
        { message: "Valid title, amount, type, date, and category are required." },
        { status: 400 }
      );
    }

    const transaction = await prisma.financialTransaction.update({
      where: { id, userId: DEV_USER_ID },
      data: {
        amount: parsedAmount,
        categoryId,
        date: parsedDate,
        notes,
        title,
        type,
      },
      include: { category: true },
    });

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to update transaction." },
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

    await prisma.financialTransaction.delete({
      where: { id, userId: DEV_USER_ID },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete transaction." },
      { status: 500 }
    );
  }
}
