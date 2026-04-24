import { Prisma } from "@/generated/client";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEV_USER_ID = 1;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { color, name, type } = await req.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedName || !["income", "expense"].includes(type)) {
      return NextResponse.json(
        { message: "Category name and valid type are required." },
        { status: 400 }
      );
    }

    const category = await prisma.financialCategory.update({
      where: { id, userId: DEV_USER_ID },
      data: {
        color,
        name: normalizedName,
        type,
      },
    });

    return NextResponse.json(category);
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
      { message: "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.financialCategory.findUnique({
      where: { id, userId: DEV_USER_ID },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    if (category.isDefault) {
      return NextResponse.json(
        { message: "Default categories cannot be deleted." },
        { status: 409 }
      );
    }

    await prisma.financialCategory.delete({
      where: { id, userId: DEV_USER_ID },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { message: "Categories with linked records cannot be deleted." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to delete category." },
      { status: 500 }
    );
  }
}
