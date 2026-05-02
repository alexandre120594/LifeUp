import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const { date } = await req.json();
    const paidDate = date ? new Date(date) : new Date();

    if (Number.isNaN(paidDate.getTime())) {
      return NextResponse.json(
        { message: "A valid payment date is required." },
        { status: 400 }
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const plannedExpense = await tx.plannedExpense.findFirst({
        where: { id, userId },
      });

      if (!plannedExpense) {
        return null;
      }

      const transaction = await tx.financialTransaction.create({
        data: {
          amount: plannedExpense.amount,
          categoryId: plannedExpense.categoryId,
          date: paidDate,
          notes: plannedExpense.notes
            ? `${plannedExpense.notes} Created from planned expense.`
            : `Created from planned expense ${plannedExpense.title}.`,
          title: plannedExpense.title,
          type: "expense",
          userId,
        },
        include: { category: true },
      });

      await tx.plannedExpense.delete({
        where: { id: plannedExpense.id, userId },
      });

      return transaction;
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Planned expense was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ...transaction, amount: Number(transaction.amount) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to mark planned expense as done." },
      { status: 500 }
    );
  }
}
