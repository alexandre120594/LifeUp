import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MAX_NAME_LENGTH = 120;

export async function GET() {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, id: true, name: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Corpo da requisição inválido." }, { status: 400 });
  }

  const fields = Object.keys(body);
  if (fields.length !== 1 || fields[0] !== "name") {
    return NextResponse.json(
      { message: "Apenas o campo nome pode ser alterado." },
      { status: 400 },
    );
  }

  const { name } = body as { name?: unknown };
  if (typeof name !== "string") {
    return NextResponse.json({ message: "O nome deve ser um texto." }, { status: 400 });
  }

  const normalizedName = name.trim();
  if (normalizedName.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { message: `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.` },
      { status: 400 },
    );
  }

  const currentUser = await prisma.user.findUnique({
    select: { id: true },
    where: { id: userId },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.update({
    data: { name: normalizedName || null },
    select: { email: true, id: true, name: true },
    where: { id: userId },
  });

  return NextResponse.json(user);
}
