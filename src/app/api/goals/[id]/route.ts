import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizeGoalInput } from "@/lib/goals";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const goal = await prisma.goal.findFirst({ where: { id, userId } });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  return NextResponse.json(goal);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existing = await prisma.goal.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const result = normalizeGoalInput(body, true);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update goal.", detail: error },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existing = await prisma.goal.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
