import { DEFAULT_FINANCE_CATEGORIES } from "@/lib/finance-defaults";
import prisma from "@/lib/prisma";

export async function ensureFinanceFoundation(userId: number) {
  await Promise.all(DEFAULT_FINANCE_CATEGORIES.map((category) =>
    prisma.financialCategory.upsert({
      where: { userId_name_type: { userId, name: category.name, type: category.type } },
      create: { ...category, isDefault: true, userId },
      update: { color: category.color, isDefault: true },
    })
  ));

  const account = await prisma.financialAccount.upsert({
    where: { userId_name: { userId, name: "Conta principal" } },
    create: { name: "Conta principal", userId },
    update: {},
  });

  await prisma.financialTransaction.updateMany({
    where: { accountId: null, userId },
    data: { accountId: account.id },
  });
}
