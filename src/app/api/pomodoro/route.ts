
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  try {
    const sessions = await prisma.pomodoroSession.findMany({
      where: taskId ? { taskId: taskId } : {},
      include: {
        task: true
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}