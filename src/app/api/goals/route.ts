import { requireCurrentUserId } from "@/lib/auth";
import { isGoalArea, isGoalStatus, normalizeGoalInput } from "@/lib/goals";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const area = req.nextUrl.searchParams.get("area");
  const status = req.nextUrl.searchParams.get("status");

  if (area && !isGoalArea(area)) {
    return NextResponse.json({ error: "Invalid area." }, { status: 400 });
  }

  if (status && !isGoalStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const areaFilter = area && isGoalArea(area) ? area : undefined;
  const statusFilter = status && isGoalStatus(status) ? status : undefined;

  const goals = await prisma.goal.findMany({
    where: {
      area: areaFilter,
      status: statusFilter,
      userId,
    },
    orderBy: [{ area: "asc" }, { status: "asc" }, { updatedAt: "desc" }],
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
