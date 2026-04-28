import prisma from "@/lib/prisma";
import { AUTH_COOKIE } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      name: typeof name === "string" && name.trim() ? name.trim() : null,
    },
    update: {
      ...(typeof name === "string" && name.trim()
        ? { name: name.trim() }
        : {}),
    },
  });

  const response = NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  response.cookies.set(AUTH_COOKIE, String(user.id), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
