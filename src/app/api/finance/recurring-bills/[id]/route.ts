import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, categoryId, dueDay, title } = await req.json();
    const parsedAmount = Number(amount);
    const parsedDueDay = Number(dueDay);

    if (
      !title ||
      !categoryId ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !Number.isInteger(parsedDueDay) ||
      parsedDueDay < 1 ||
      parsedDueDay > 31
    ) {
      return NextResponse.json(
        { message: "Valid title, amount, due day, and category are required." },
        { status: 400 }
      );
    }

    const bill = await prisma.recurringBill.update({
      where: { id, userId: DEV_USER_ID },
      data: {
        amount: parsedAmount,
        categoryId,
        dueDay: parsedDueDay,
        title,
      },
      include: { category: true },
    });

    return NextResponse.json({ ...bill, amount: Number(bill.amount) });
  } catch {
    return NextResponse.json(
      { message: "Unable to update recurring bill." },
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

    await prisma.recurringBill.delete({
      where: { id, userId: DEV_USER_ID },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete recurring bill." },
      { status: 500 }
    );
  }
}
