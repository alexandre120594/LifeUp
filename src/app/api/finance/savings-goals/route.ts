import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { targetAmount, targetDate, title } = await req.json();
    const parsedTargetAmount = Number(targetAmount);
    const parsedTargetDate = targetDate ? new Date(targetDate) : null;

    if (
      !title ||
      !Number.isFinite(parsedTargetAmount) ||
      parsedTargetAmount <= 0 ||
      (parsedTargetDate && Number.isNaN(parsedTargetDate.getTime()))
    ) {
      return NextResponse.json(
        { message: "Valid title and savings amounts are required." },
        { status: 400 }
      );
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        targetAmount: parsedTargetAmount,
        targetDate: parsedTargetDate,
        title,
        userId,
      },
    });

    return NextResponse.json(
      {
        ...goal,
        currentAmount: 0,
        targetAmount: Number(goal.targetAmount),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Unable to create savings goal.", error }, { status: 500 });
  }
}
