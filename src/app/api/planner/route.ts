import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUserId } from "@/lib/auth";
import { ensureFinanceFoundation } from "@/lib/finance-foundation";
import { getPlannerMonthRange } from "@/lib/planner";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  const now = new Date();
  const year = Number(req.nextUrl.searchParams.get("year") ?? now.getFullYear());
  const month = Number(req.nextUrl.searchParams.get("month") ?? now.getMonth() + 1);
  if (!Number.isInteger(year) || year < 1900 || year > 2200 || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ message: "Período inválido." }, { status: 400 });
  }
  await ensureFinanceFoundation(userId);
  const { start, end } = getPlannerMonthRange(year, month);
  const [tasks, purchases, upcomingCommitments, accounts, categories] = await Promise.all([
    prisma.plannerTask.findMany({
      where: {
        userId,
        OR: [
          { dueDate: { gte: start, lt: end } },
          { dueDate: null, status: { in: ["pending", "in_progress"] } },
          { status: { in: ["done", "cancelled"] }, updatedAt: { gte: start, lt: end } },
        ],
      },
      include: { goal: { select: { color: true, id: true, title: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.plannedPurchase.findMany({
      where: {
        userId,
        OR: [
          { plannedDate: { gte: start, lt: end } },
          { plannedDate: null, status: { in: ["idea", "planned"] } },
          { status: { in: ["bought", "cancelled"] }, updatedAt: { gte: start, lt: end } },
        ],
      },
      include: {
        goal: { select: { color: true, id: true, title: true } },
        financialCommitments: { include: { account: true, category: true }, orderBy: { dueDate: "asc" } },
      },
      orderBy: [{ plannedDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.financialCommitment.findMany({
      where: { dueDate: { gte: start, lt: end }, status: "active", userId },
      include: { account: true, category: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.financialAccount.findMany({ where: { isActive: true, userId }, orderBy: { name: "asc" } }),
    prisma.financialCategory.findMany({ where: { type: "expense", userId }, orderBy: { name: "asc" } }),
  ]);
  const normalizedPurchases = purchases.map((purchase) => ({
    ...purchase,
    estimatedAmount: purchase.estimatedAmount === null ? null : Number(purchase.estimatedAmount),
    financialCommitments: purchase.financialCommitments.map((commitment) => ({
      ...commitment,
      amount: Number(commitment.amount),
    })),
  }));
  const normalizedCommitments = upcomingCommitments.map((commitment) => ({ ...commitment, amount: Number(commitment.amount) }));
  return NextResponse.json({
    accounts: accounts.map((account) => ({ ...account, balance: 0, openingBalance: Number(account.openingBalance) })),
    categories,
    purchases: normalizedPurchases,
    tasks,
    upcomingCommitments: normalizedCommitments,
    summary: {
      pendingTasks: tasks.filter((task) => task.status === "pending" || task.status === "in_progress").length,
      purchaseIdeas: purchases.filter((purchase) => purchase.status === "idea").length,
      purchaseIdeasAmount: purchases.filter((purchase) => purchase.status === "idea").reduce((sum, purchase) => sum + Number(purchase.estimatedAmount ?? 0), 0),
      plannedPurchases: purchases.filter((purchase) => purchase.status === "planned").length,
      plannedPurchasesAmount: purchases.filter((purchase) => purchase.status === "planned").reduce((sum, purchase) => sum + Number(purchase.estimatedAmount ?? 0), 0),
      financialCommitments: upcomingCommitments.length,
      financialCommitmentsAmount: upcomingCommitments.reduce((sum, commitment) => sum + Number(commitment.amount), 0),
    },
  });
}
