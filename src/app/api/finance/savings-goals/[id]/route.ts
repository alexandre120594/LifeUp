import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const { currentAmount, targetAmount, targetDate, title } = await req.json();
    const parsedCurrentAmount = Number(currentAmount ?? 0);
    const parsedTargetAmount = Number(targetAmount);
    const parsedTargetDate = targetDate ? new Date(targetDate) : null;

    if (
      !title ||
      !Number.isFinite(parsedTargetAmount) ||
      parsedTargetAmount <= 0 ||
      !Number.isFinite(parsedCurrentAmount) ||
      parsedCurrentAmount < 0 ||
      (parsedTargetDate && Number.isNaN(parsedTargetDate.getTime()))
    ) {
      return NextResponse.json(
        { message: "Valid title and savings amounts are required." },
        { status: 400 }
      );
    }

    const goal = await prisma.savingsGoal.update({
      where: { id, userId },
      data: {
        currentAmount: parsedCurrentAmount,
        isCompleted: parsedCurrentAmount >= parsedTargetAmount,
        targetAmount: parsedTargetAmount,
        targetDate: parsedTargetDate,
        title,
      },
    });

    return NextResponse.json({
      ...goal,
      currentAmount: Number(goal.currentAmount),
      targetAmount: Number(goal.targetAmount),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to update savings goal." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;

    await prisma.savingsGoal.delete({
      where: { id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to delete savings goal." },
      { status: 500 }
    );
  }
}
