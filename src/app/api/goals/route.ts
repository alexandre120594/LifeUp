import { requireCurrentUserId } from "@/lib/auth";
import { normalizeGoalInput } from "@/lib/goals";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const body = await req.json();
    const result = normalizeGoalInput(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.data.title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const title = result.data.title;
    const goal = await prisma.goal.create({
      data: {
        ...result.data,
        title,
        userId,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create goal.", detail: error },
      { status: 500 }
    );
  }
}
