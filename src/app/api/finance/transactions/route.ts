import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function POST(req: NextRequest) {
  try {
    const { amount, categoryId, date, notes, title, type } = await req.json();
    const parsedAmount = Number(amount);
    const parsedDate = date ? new Date(date) : new Date();

    if (
      !title ||
      !categoryId ||
      !["income", "expense"].includes(type) ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      Number.isNaN(parsedDate.getTime())
    ) {
      return NextResponse.json(
        { message: "Valid title, amount, type, date, and category are required." },
        { status: 400 }
      );
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        amount: parsedAmount,
        categoryId,
        date: parsedDate,
        notes,
        title,
        type,
        userId: DEV_USER_ID,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      { ...transaction, amount: Number(transaction.amount) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Unable to create transaction.", error }, { status: 500 });
  }
}
