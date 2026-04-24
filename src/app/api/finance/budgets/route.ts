import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function POST(req: NextRequest) {
  try {
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

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          categoryId,
          month,
          userId: DEV_USER_ID,
        },
      },
      create: {
        amount: parsedAmount,
        categoryId,
        month,
        title,
        userId: DEV_USER_ID,
      },
      update: {
        amount: parsedAmount,
        title,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      { ...budget, amount: Number(budget.amount) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Unable to save budget.", error }, { status: 500 });
  }
}
