import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;
  const session = await prisma.studySession.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!session) {
    return NextResponse.json(
      { message: "Study session not found." },
      { status: 404 }
    );
  }

  await prisma.studySession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
