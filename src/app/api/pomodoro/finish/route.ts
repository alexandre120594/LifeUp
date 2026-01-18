// app/api/pomodoro/finish/route.ts
import  prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pomodoroId } = await req.json();

  const pomodoro = await prisma.pomodoroSession.update({
    where: { id: pomodoroId },
    data: {
      endedAt: new Date(),
      status: "COMPLETED",
    },
  });

  await prisma.task.update({
    where: { id: pomodoro.taskId },
    data: {
      totalFocusSeconds: {
        increment: pomodoro.duration,
      },
    },
  });

  return NextResponse.json({ success: true });
}
