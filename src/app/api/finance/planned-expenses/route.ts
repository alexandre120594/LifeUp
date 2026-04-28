import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function parseDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { amount, categoryId, isPaid = false, notes, plannedDate, title } =
      await req.json();
    const parsedAmount = Number(amount);
    const parsedDate = parseDate(plannedDate);

    if (
      !title ||
      !categoryId ||
      !parsedDate ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return NextResponse.json(
        { message: "Valid title, amount, planned date, and category are required." },
        { status: 400 }
      );
    }

    const plannedExpense = await prisma.plannedExpense.create({
      data: {
        amount: parsedAmount,
        categoryId,
        isPaid: Boolean(isPaid),
        notes: notes || null,
        plannedDate: parsedDate,
        title,
        userId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      { ...plannedExpense, amount: Number(plannedExpense.amount) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to create planned expense.", error },
      { status: 500 }
    );
  }
}
