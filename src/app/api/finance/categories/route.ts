import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/client";
import { requireCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { name, type, color } = await req.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedName || !["income", "expense"].includes(type)) {
      return NextResponse.json(
        { message: "Category name and valid type are required." },
        { status: 400 }
      );
    }

    const category = await prisma.financialCategory.create({
      data: {
        color,
        name: normalizedName,
        type,
        userId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "This category already exists for that type." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to create category." },
      { status: 500 }
    );
  }
}
