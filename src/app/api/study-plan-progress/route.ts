import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

const VALID_PLAN_KEYS = new Set(["dataprev-perfil3", "trt-audit"]);

function getValidPlanKey(req: NextRequest) {
  const planKey = req.nextUrl.searchParams.get("planKey");

  return planKey && VALID_PLAN_KEYS.has(planKey) ? planKey : null;
}

function normalizeItemIds(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const itemIds = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );

  return Array.from(new Set(itemIds));
}

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const planKey = getValidPlanKey(req);

  if (!planKey) {
    return NextResponse.json({ error: "Invalid plan key" }, { status: 400 });
  }

  const progress = await prisma.studyPlanProgress.findMany({
    select: { itemId: true },
    where: { planKey, userId },
  });

  return NextResponse.json({ itemIds: progress.map((item) => item.itemId) });
}

export async function PUT(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();

  if (response) {
    return response;
  }

  const planKey = getValidPlanKey(req);

  if (!planKey) {
    return NextResponse.json({ error: "Invalid plan key" }, { status: 400 });
  }

  const body: unknown = await req.json().catch(() => null);
  const itemIds = normalizeItemIds(
    body && typeof body === "object" && "itemIds" in body
      ? body.itemIds
      : null
  );

  if (!itemIds) {
    return NextResponse.json({ error: "Invalid itemIds" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.studyPlanProgress.deleteMany({
      where: { planKey, userId },
    }),
    prisma.studyPlanProgress.createMany({
      data: itemIds.map((itemId) => ({
        itemId,
        planKey,
        userId,
      })),
      skipDuplicates: true,
    }),
  ]);

  return NextResponse.json({ itemIds });
}
