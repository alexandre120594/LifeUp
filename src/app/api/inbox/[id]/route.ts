import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const inboxItemTypes = [
  "idea",
  "note",
  "study",
  "finance",
  "thought",
];
const inboxItemStatuses = ["unprocessed", "processed"];

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
    const currentItem = await prisma.inboxItem.findFirst({
      where: { id, userId },
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: "Inbox item not found." },
        { status: 404 }
      );
    }

    const noteId = "noteId" in body ? body.noteId || null : currentItem.noteId;

    const noteIsValid = noteId
      ? await prisma.note.findFirst({ where: { id: noteId, userId } })
      : true;

    if (!noteIsValid) {
      return NextResponse.json(
        { error: "Linked note was not found." },
        { status: 404 }
      );
    }

    if (body.convertToNote) {
      const item = await prisma.$transaction(async (tx) => {
        const note = await tx.note.create({
          data: {
            category: currentItem.type,
            content: currentItem.content ?? currentItem.title,
            title: currentItem.title,
            userId,
          },
        });

        return tx.inboxItem.update({
          where: { id },
          data: {
            noteId: note.id,
            status: "processed",
          },
          include: {
            note: true,
          },
        });
      });

      return NextResponse.json(item);
    }

    const nextType =
      typeof body.type === "string" && inboxItemTypes.includes(body.type)
        ? body.type
        : currentItem.type;
    const nextStatus =
      typeof body.status === "string" && inboxItemStatuses.includes(body.status)
        ? body.status
        : currentItem.status;

    const item = await prisma.inboxItem.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" && body.title
          ? { title: body.title }
          : {}),
        ...("content" in body
          ? { content: typeof body.content === "string" ? body.content : null }
          : {}),
        noteId,
        status: nextStatus,
        type: nextType,
      },
      include: {
        note: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to update inbox item.", detail: error },
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
  const item = await prisma.inboxItem.findFirst({ where: { id, userId } });

  if (!item) {
    return NextResponse.json({ error: "Inbox item not found." }, { status: 404 });
  }

  await prisma.inboxItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
