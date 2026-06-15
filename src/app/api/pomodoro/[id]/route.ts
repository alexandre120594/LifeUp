import prisma from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;

  const session = await prisma.pomodoroSession.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Pomodoro session not found." },
      { status: 404 }
    );
  }

  const deleted = await prisma.pomodoroSession.delete({
    where: { id },
  });

  return NextResponse.json(deleted);
}
