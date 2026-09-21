import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const subject = await prisma.studySubject.findFirst({ where: { id: body.subjectId, isActive: true, userId } });
  if (!name || !subject) return NextResponse.json({ message: "Nome e materia ativa sao obrigatorios." }, { status: 400 });
  const topic = await prisma.studyTopic.upsert({
    where: { subjectId_name: { subjectId: subject.id, name } },
    create: { name, subjectId: subject.id, userId },
    update: { isActive: true },
  });
  return NextResponse.json(topic, { status: 201 });
}
