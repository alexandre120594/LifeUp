import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const category = searchParams.get("category");

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      inboxItems: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { category, content, title } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        category: typeof category === "string" && category ? category : null,
        content,
        title,
        userId,
      },
      include: {
        inboxItems: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create note.", detail: error },
      { status: 500 }
    );
  }
}
