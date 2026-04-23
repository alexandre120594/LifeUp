import type {
  Budget,
  FinanceInsight,
  FinanceSummary,
  FinancialTransaction,
  RecurringBill,
  SavingsGoal,
} from "@/types/BaseInterfaces";

export function moneyToNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(value);
}

function isTransactionInMonth(
  transaction: FinancialTransaction,
  month: string
) {
  return new Date(transaction.date).toISOString().slice(0, 7) === month;
}

export function buildFinanceSummary({
  transactions,
  budgets,
  recurringBills,
  savingsGoals,
  month = getCurrentMonthKey(),
}: {
  transactions: FinancialTransaction[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  savingsGoals: SavingsGoal[];
  month?: string;
}): FinanceSummary {
  const monthlyTransactions = transactions.filter((transaction) =>
    isTransactionInMonth(transaction, month)
  );
  const totalIncome = monthlyTransactions.reduce((total, transaction) => {
    return (
      total +
      (transaction.type === "income" ? moneyToNumber(transaction.amount) : 0)
    );
  }, 0);
  const totalExpenses = monthlyTransactions.reduce((total, transaction) => {
    return (
      total +
      (transaction.type === "expense" ? moneyToNumber(transaction.amount) : 0)
    );
  }, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const activeBills = recurringBills.filter((bill) => bill.isActive);
  const upcomingBillsTotal = activeBills.reduce(
    (total, bill) => total + moneyToNumber(bill.amount),
    0
  );
  const monthlyBudgets = budgets.filter((budget) => budget.month === month);
  const budgetLimit = monthlyBudgets.reduce(
    (total, budget) => total + moneyToNumber(budget.amount),
    0
  );
  const budgetUsedPercent =
    budgetLimit > 0 ? Math.round((totalExpenses / budgetLimit) * 100) : 0;
  const totalSavingsTarget = savingsGoals.reduce(
    (total, goal) => total + moneyToNumber(goal.targetAmount),
    0
  );
  const totalSavingsCurrent = savingsGoals.reduce(
    (total, goal) => total + moneyToNumber(goal.currentAmount),
    0
  );
  const savingsProgress =
    totalSavingsTarget > 0
      ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100)
      : 0;

  return {
    month,
    totalIncome,
    totalExpenses,
    netCashFlow,
    upcomingBillsTotal,
    savingsProgress,
    budgetUsedPercent,
    insights: buildFinanceInsights({
      budgetUsedPercent,
      netCashFlow,
      savingsGoals,
      totalExpenses,
      totalIncome,
      upcomingBillsTotal,
    }),
  };
}

function buildFinanceInsights({
  budgetUsedPercent,
  netCashFlow,
  savingsGoals,
  totalExpenses,
  totalIncome,
  upcomingBillsTotal,
}: {
  budgetUsedPercent: number;
  netCashFlow: number;
  savingsGoals: SavingsGoal[];
  totalExpenses: number;
  totalIncome: number;
  upcomingBillsTotal: number;
}): FinanceInsight[] {
  const insights: FinanceInsight[] = [];

  if (totalIncome === 0 && totalExpenses === 0) {
    insights.push({
      title: "Start with one record",
      description:
        "Add your first income or expense to make the monthly view useful.",
      tone: "neutral",
    });
  }

  if (budgetUsedPercent >= 90) {
    insights.push({
      title: "Budget pressure is high",
      description: `You have used ${budgetUsedPercent}% of this month's budget.`,
      tone: "warning",
    });
  }

  if (netCashFlow < 0) {
    insights.push({
      title: "Negative cash flow",
      description:
        "Expenses are currently higher than income for this month.",
      tone: "warning",
    });
  }

  if (upcomingBillsTotal > Math.max(netCashFlow, 0) && upcomingBillsTotal > 0) {
    insights.push({
      title: "Bills need attention",
      description:
        "Upcoming recurring bills are higher than your current monthly surplus.",
      tone: "warning",
    });
  }

  if (savingsGoals.some((goal) => !goal.isCompleted)) {
    insights.push({
      title: "Savings goals are active",
      description:
        "Track contributions weekly to avoid missing the target silently.",
      tone: "good",
    });
  }

  return insights.slice(0, 3);
}
