import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function parseDate(value: unknown) {
  if (!value) {
    return new Date();
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

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
    const { amount, date, notes } = await req.json();
    const parsedAmount = Number(amount);
    const parsedDate = parseDate(date);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !parsedDate
    ) {
      return NextResponse.json(
        { message: "A valid contribution amount and date are required." },
        { status: 400 }
      );
    }

    const contribution = await prisma.$transaction(async (tx) => {
      const goal = await tx.savingsGoal.findFirst({
        where: { id, userId },
      });

      if (!goal) {
        return null;
      }

      const currentAmount = Number(goal.currentAmount) + parsedAmount;

      const created = await tx.savingsContribution.create({
        data: {
          amount: parsedAmount,
          date: parsedDate,
          goalId: goal.id,
          notes: notes || null,
          userId,
        },
      });

      await tx.savingsGoal.update({
        where: { id: goal.id, userId },
        data: {
          currentAmount,
          isCompleted: currentAmount >= Number(goal.targetAmount),
        },
      });

      return created;
    });

    if (!contribution) {
      return NextResponse.json(
        { message: "Savings goal was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ...contribution, amount: Number(contribution.amount) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to add savings contribution." },
      { status: 500 }
    );
  }
}
