import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { isMissingSavingsContributionsTableError } from "@/lib/prisma-errors";
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

async function addContributionToGoalTotal({
  amount,
  date,
  goalId,
  notes,
  userId,
}: {
  amount: number;
  date: Date;
  goalId: string;
  notes: unknown;
  userId: number;
}) {
  const goal = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    return null;
  }

  const currentAmount = Number(goal.currentAmount) + amount;

  await prisma.savingsGoal.update({
    where: { id: goal.id, userId },
    data: {
      currentAmount,
      isCompleted: currentAmount >= Number(goal.targetAmount),
    },
  });

  return {
    amount,
    date,
    goalId: goal.id,
    id: `legacy-${goal.id}-${date.getTime()}`,
    notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;
  const { amount, date, notes } = await req.json();
  const parsedAmount = Number(amount);
  const parsedDate = parseDate(date);

  try {
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
  } catch (error) {
    if (isMissingSavingsContributionsTableError(error)) {
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

      const contribution = await addContributionToGoalTotal({
        amount: parsedAmount,
        date: parsedDate,
        goalId: id,
        notes,
        userId,
      });

      if (!contribution) {
        return NextResponse.json(
          { message: "Savings goal was not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(contribution, { status: 201 });
    }

    return NextResponse.json(
      { message: "Unable to add savings contribution." },
      { status: 500 }
    );
  }
}
