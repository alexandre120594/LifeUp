import type { FinanceRecordType } from "@/types/Finance";

export function isFinanceRecordType(value: unknown): value is FinanceRecordType {
  return value === "income" || value === "expense";
}

export function getMonthRange(value = new Date()) {
  return {
    start: new Date(value.getFullYear(), value.getMonth(), 1),
    end: new Date(value.getFullYear(), value.getMonth() + 1, 1),
  };
}

export function calculateAccountBalance(
  openingBalance: number,
  transactions: Array<{ amount: number; type: FinanceRecordType }>
) {
  return transactions.reduce(
    (balance, transaction) =>
      balance + (transaction.type === "income" ? transaction.amount : -transaction.amount),
    openingBalance
  );
}

export function calculateFinanceSummary(
  transactions: Array<{ amount: number; type: FinanceRecordType }>
) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return { income, expenses, net: income - expenses };
}

export function calculateCommitmentSummary(
  income: number,
  commitments: Array<{
    amount: number;
    status: string;
    type: FinanceRecordType;
  }>,
  futureCommitted: number
) {
  const committed = commitments
    .filter((commitment) => commitment.status === "active" && commitment.type === "expense")
    .reduce((total, commitment) => total + commitment.amount, 0);

  return {
    committed,
    futureCommitted,
    income,
    percentage: income > 0 ? (committed / income) * 100 : null,
    remaining: income - committed,
  };
}

export function addOneMonth(value: Date) {
  const next = new Date(value);
  const originalDay = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, lastDay));
  return next;
}
