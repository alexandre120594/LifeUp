import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function POST(req: NextRequest) {
  try {
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

    const bill = await prisma.recurringBill.create({
      data: {
        amount: parsedAmount,
        categoryId,
        dueDay: parsedDueDay,
        title,
        userId: DEV_USER_ID,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      { ...bill, amount: Number(bill.amount) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Unable to create recurring bill.", error }, { status: 500 });
  }
}
