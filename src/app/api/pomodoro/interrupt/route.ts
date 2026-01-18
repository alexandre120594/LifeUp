// app/api/pomodoro/interrupt/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pomodoroId, duration } = await req.json();

  if (!pomodoroId && !duration) {
    return;
  }

  await prisma.pomodoroSession.update({
    where: { id: pomodoroId },
    data: {
      duration: Number(duration),
      status: "INTERRUPTED",
    },
  });

  return NextResponse.json({ success: true });
}

