import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_COOKIE = "lifeup_user_id";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const rawUserId = cookieStore.get(AUTH_COOKIE)?.value;
  const userId = rawUserId ? Number(rawUserId) : NaN;

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
    };
  }

  return { response: null, userId };
}
