import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function POST(req: NextRequest) {
  try {
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

    const goal = await prisma.savingsGoal.create({
      data: {
        currentAmount: parsedCurrentAmount,
        isCompleted: parsedCurrentAmount >= parsedTargetAmount,
        targetAmount: parsedTargetAmount,
        targetDate: parsedTargetDate,
        title,
        userId: DEV_USER_ID,
      },
    });

    return NextResponse.json(
      {
        ...goal,
        currentAmount: Number(goal.currentAmount),
        targetAmount: Number(goal.targetAmount),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Unable to create savings goal.", error }, { status: 500 });
  }
}
