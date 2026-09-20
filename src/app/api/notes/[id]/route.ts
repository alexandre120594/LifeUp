import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const currentNote = await prisma.note.findFirst({ where: { id, userId } });

    if (!currentNote) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...("category" in body
          ? { category: typeof body.category === "string" ? body.category : null }
          : {}),
        ...(typeof body.content === "string" ? { content: body.content } : {}),
        ...(typeof body.title === "string" && body.title
          ? { title: body.title }
          : {}),
      },
      include: {
        inboxItems: true,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update note.", detail: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { id } = await params;
  const note = await prisma.note.findFirst({ where: { id, userId } });

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
