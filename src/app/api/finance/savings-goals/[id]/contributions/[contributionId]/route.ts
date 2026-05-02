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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contributionId: string; id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { contributionId, id } = await params;
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
      const [goal, existingContribution] = await Promise.all([
        tx.savingsGoal.findFirst({ where: { id, userId } }),
        tx.savingsContribution.findFirst({
          where: { goalId: id, id: contributionId, userId },
        }),
      ]);

      if (!goal || !existingContribution) {
        return null;
      }

      const currentAmount =
        Number(goal.currentAmount) -
        Number(existingContribution.amount) +
        parsedAmount;

      const updated = await tx.savingsContribution.update({
        where: { id: existingContribution.id, userId },
        data: {
          amount: parsedAmount,
          date: parsedDate,
          notes: notes || null,
        },
      });

      await tx.savingsGoal.update({
        where: { id: goal.id, userId },
        data: {
          currentAmount,
          isCompleted: currentAmount >= Number(goal.targetAmount),
        },
      });

      return updated;
    });

    if (!contribution) {
      return NextResponse.json(
        { message: "Savings contribution was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...contribution,
      amount: Number(contribution.amount),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to update savings contribution." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ contributionId: string; id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { contributionId, id } = await params;

    const deleted = await prisma.$transaction(async (tx) => {
      const [goal, contribution] = await Promise.all([
        tx.savingsGoal.findFirst({ where: { id, userId } }),
        tx.savingsContribution.findFirst({
          where: { goalId: id, id: contributionId, userId },
        }),
      ]);

      if (!goal || !contribution) {
        return false;
      }

      const currentAmount = Math.max(
        Number(goal.currentAmount) - Number(contribution.amount),
        0
      );

      await tx.savingsContribution.delete({
        where: { id: contribution.id, userId },
      });

      await tx.savingsGoal.update({
        where: { id: goal.id, userId },
        data: {
          currentAmount,
          isCompleted: currentAmount >= Number(goal.targetAmount),
        },
      });

      return true;
    });

    if (!deleted) {
      return NextResponse.json(
        { message: "Savings contribution was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete savings contribution." },
      { status: 500 }
    );
  }
}
