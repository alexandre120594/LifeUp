import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

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
          userId,
        },
      },
      create: {
        amount: parsedAmount,
        categoryId,
        month,
        title,
        userId,
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
