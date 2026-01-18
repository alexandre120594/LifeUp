import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { taskId, duration } = await req.json();

    const activeSession = await prisma.pomodoroSession.findFirst({
      where: {
        taskId: taskId,
        status: "IN_PROGRESS",
      },
    });


    if (activeSession) {
      return NextResponse.json(activeSession);
    }


    const newPomodoro = await prisma.pomodoroSession.create({
      data: {
        taskId,
        duration: Number(duration),
        startedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json(newPomodoro);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerenciar sessão" }, { status: 500 });
  }
}



export async function PATCH(req: Request) {
  const { id, duration, status} = await req.json();

  if (!id && !duration) {
    return;
  }

  await prisma.pomodoroSession.update({
    where: { id: id },
    data: {
      duration: Number(duration),
      status: status,
    },
  });

  return NextResponse.json({ success: true });
}
