import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const inboxItemTypes = [
  "idea",
  "task",
  "note",
  "study",
  "finance",
  "habit",
  "project",
  "thought",
];

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const items = await prisma.inboxItem.findMany({
    where: {
      userId,
      ...(status && status !== "all" ? { status } : {}),
    },
    include: {
      project: true,
      habit: true,
      task: true,
      note: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  try {
    const { content, title, type = "idea" } = await req.json();

    if (!title || typeof title !== "string" || !inboxItemTypes.includes(type)) {
      return NextResponse.json(
        { error: "Valid title and inbox type are required." },
        { status: 400 }
      );
    }

    const item = await prisma.inboxItem.create({
      data: {
        content: typeof content === "string" && content ? content : null,
        title,
        type,
        userId,
      },
      include: {
        project: true,
        habit: true,
        task: true,
        note: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create inbox item.", detail: error },
      { status: 500 }
    );
  }
}
