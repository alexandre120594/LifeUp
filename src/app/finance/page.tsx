"use client";

import { Children, type ReactNode, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  CalendarClock,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  Landmark,
  PiggyBank,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { MoneyInput } from "@/components/money-input";
import { OverviewPanel } from "@/components/overview-panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BillActions,
  BudgetActions,
  CategoryActions,
  PlannedExpenseActions,
  SavingsGoalActions,
  TransactionActions,
} from "./components/FinanceRecordActions";
import {
  useCreateBudget,
  useCreateFinancialCategory,
  useCreateFinancialTransaction,
  useCreatePlannedExpense,
  useCreateRecurringBill,
  useCreateSavingsGoal,
  useFinanceDashboard,
} from "@/hooks/useFinanceMutations";
import {
  buildFinancePeriodSummary,
  formatCurrency,
  getCurrentMonthKey,
  getCurrentYearKey,
  isTransactionInFinancePeriod,
  moneyToNumber,
  type FinancePeriodMode,
} from "@/lib/finance";
import type {
  BudgetCreateInput,
  FinanceRecordType,
  FinancialCategoryCreateInput,
  FinancialTransactionCreateInput,
  PlannedExpenseCreateInput,
  RecurringBillCreateInput,
  SavingsGoalCreateInput,
} from "@/types/BaseInterfaces";

type AddRecordKind =
  | "transaction"
  | "planned-expense"
  | "bill"
  | "saving"
  | "budget"
  | "category";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = getCurrentMonthKey();
const currentYear = getCurrentYearKey();

const moneyConfig = {
  amount: {
    label: "Amount",
    color: "var(--chart-1)",
  },
  current: {
    label: "Saved",
    color: "var(--chart-2)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const totalConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function FinancePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<FinancePeriodMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [recordKind, setRecordKind] = useState<AddRecordKind>("transaction");
  const { data: finance, isLoading } = useFinanceDashboard();
  const categories = finance?.categories ?? [];
  const expenseCategories = categories.filter(
    (category) => category.type === "expense"
  );

  const transactionForm = useForm<FinancialTransactionCreateInput>({
    defaultValues: {
      amount: 0,
      categoryId: "",
      date: today,
      notes: "",
      title: "",
      type: "expense",
    },
  });
  const categoryForm = useForm<FinancialCategoryCreateInput>({
    defaultValues: {
      color: "#0f766e",
      name: "",
      type: "expense",
    },
  });
  const budgetForm = useForm<BudgetCreateInput>({
    defaultValues: {
      amount: 0,
      categoryId: "",
      month: currentMonth,
      title: "",
    },
  });
  const billForm = useForm<RecurringBillCreateInput>({
    defaultValues: {
      amount: 0,
      categoryId: "",
      dueDay: 1,
      title: "",
    },
  });
  const plannedExpenseForm = useForm<PlannedExpenseCreateInput>({
    defaultValues: {
      amount: 0,
      categoryId: "",
      isPaid: false,
      notes: "",
      plannedDate: today,
      title: "",
    },
  });
  const savingsForm = useForm<SavingsGoalCreateInput>({
    defaultValues: {
      currentAmount: 0,
      targetAmount: 0,
      targetDate: "",
      title: "",
    },
  });

  const selectedTransactionType = useWatch({
    control: transactionForm.control,
    name: "type",
  });
  const transactionCategories = categories.filter(
    (category) => category.type === selectedTransactionType
  );

  const { mutate: createTransaction, isPending: isCreatingTransaction } =
    useCreateFinancialTransaction();
  const {
    error: categoryError,
    mutate: createCategory,
    isPending: isCreatingCategory,
  } = useCreateFinancialCategory();
  const { mutate: createBudget, isPending: isCreatingBudget } =
    useCreateBudget();
  const { mutate: createBill, isPending: isCreatingBill } =
    useCreateRecurringBill();
  const { mutate: createPlannedExpense, isPending: isCreatingPlannedExpense } =
    useCreatePlannedExpense();
  const { mutate: createSavingsGoal, isPending: isCreatingSavingsGoal } =
    useCreateSavingsGoal();

  const periodKey = periodMode === "month" ? selectedMonth : selectedYear;
  const periodLabel =
    periodMode === "month"
      ? new Date(`${selectedMonth}-02`).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : selectedYear;
  const periodDescriptor =
    periodMode === "month" ? "selected month" : "selected year";
  const periodTransactions =
    finance?.transactions.filter((transaction) =>
      isTransactionInFinancePeriod(transaction, periodMode, periodKey)
    ) ?? [];
  const summary = finance
    ? buildFinancePeriodSummary({
        budgets: finance.budgets,
        periodKey,
        periodMode,
        recurringBills: finance.recurringBills,
        savingsGoals: finance.savingsGoals,
        transactions: finance.transactions,
      })
    : undefined;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const netCashFlow = summary?.netCashFlow ?? 0;
  const activeBillsTotal = summary?.upcomingBillsTotal ?? 0;
  const periodPlannedExpenses =
    finance?.plannedExpenses.filter((expense) => {
      const plannedDate = new Date(expense.plannedDate).toISOString();

      return periodMode === "month"
        ? plannedDate.slice(0, 7) === periodKey
        : plannedDate.slice(0, 4) === periodKey;
    }) ?? [];
  const unpaidPlannedExpenses = periodPlannedExpenses.filter(
    (expense) => !expense.isPaid
  );
  const plannedExpensesTotal = unpaidPlannedExpenses.reduce(
    (total, expense) => total + moneyToNumber(expense.amount),
    0
  );
  const totalSavingsCurrent =
    finance?.savingsGoals.reduce(
      (total, goal) => total + moneyToNumber(goal.currentAmount),
      0
    ) ?? 0;
  const totalSavingsTarget =
    finance?.savingsGoals.reduce(
      (total, goal) => total + moneyToNumber(goal.targetAmount),
      0
    ) ?? 0;
  const remainingSavings = Math.max(totalSavingsTarget - totalSavingsCurrent, 0);
  const cashAfterBills = netCashFlow - activeBillsTotal - plannedExpensesTotal;
  const totalMoneyTracked = cashAfterBills + totalSavingsCurrent;
  const activeBillsCount =
    finance?.recurringBills.filter((bill) => bill.isActive).length ?? 0;

  const billsChartData =
    finance?.recurringBills
      .filter((bill) => bill.isActive)
      .slice(0, 6)
      .map((bill) => ({
        name: bill.title,
        amount: moneyToNumber(bill.amount),
      })) ?? [];
  const savingsChartData =
    finance?.savingsGoals.slice(0, 6).map((goal) => {
      const current = moneyToNumber(goal.currentAmount);
      const target = moneyToNumber(goal.targetAmount);

      return {
        name: goal.title,
        current,
        remaining: Math.max(target - current, 0),
      };
    }) ?? [];
  const totalChartData = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpenses },
    { name: "Bills", value: activeBillsTotal },
    { name: "Planned", value: plannedExpensesTotal },
    { name: "Saved", value: totalSavingsCurrent },
    { name: "Total", value: totalMoneyTracked },
  ];

  const closeCreateDialog = () => setIsCreateOpen(false);

  const onCreateTransaction = (data: FinancialTransactionCreateInput) => {
    createTransaction(data, {
      onSuccess: () => {
        transactionForm.reset({
          amount: 0,
          categoryId: "",
          date: today,
          notes: "",
          title: "",
          type: data.type,
        });
        closeCreateDialog();
      },
    });
  };

  const onCreateCategory = (data: FinancialCategoryCreateInput) => {
    createCategory(data, {
      onSuccess: () => {
        categoryForm.reset({
          color: "#0f766e",
          name: "",
          type: data.type,
        });
        closeCreateDialog();
      },
    });
  };

  const onCreateBudget = (data: BudgetCreateInput) => {
    createBudget(data, {
      onSuccess: () => {
        budgetForm.reset({
          amount: 0,
          categoryId: "",
          month: data.month,
          title: "",
        });
        closeCreateDialog();
      },
    });
  };

  const onCreateBill = (data: RecurringBillCreateInput) => {
    createBill(data, {
      onSuccess: () => {
        billForm.reset({
          amount: 0,
          categoryId: "",
          dueDay: 1,
          title: "",
        });
        closeCreateDialog();
      },
    });
  };

  const onCreatePlannedExpense = (data: PlannedExpenseCreateInput) => {
    createPlannedExpense(data, {
      onSuccess: () => {
        plannedExpenseForm.reset({
          amount: 0,
          categoryId: "",
          isPaid: false,
          notes: "",
          plannedDate: data.plannedDate,
          title: "",
        });
        closeCreateDialog();
      },
    });
  };

  const onCreateSavingsGoal = (data: SavingsGoalCreateInput) => {
    createSavingsGoal(data, {
      onSuccess: () => {
        savingsForm.reset({
          currentAmount: 0,
          targetAmount: 0,
          targetDate: "",
          title: "",
        });
        closeCreateDialog();
      },
    });
  };

  return (
    <div className="min-w-0 space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <MenuPageHeader
          eyebrow="Personal finance"
          title="Financial Organizer"
        />
        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,150px)_minmax(0,180px)_auto] lg:mt-1">
          <Select
            value={periodMode}
            onValueChange={(value) => setPeriodMode(value as FinancePeriodMode)}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {periodMode === "month" ? (
            <Input
              className="h-11"
              onChange={(event) => setSelectedMonth(event.target.value)}
              type="month"
              value={selectedMonth}
            />
          ) : (
            <Input
              className="h-11"
              max="9999"
              min="1900"
              onChange={(event) => setSelectedYear(event.target.value)}
              type="number"
              value={selectedYear}
            />
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2 rounded-lg">
                <Plus className="h-4 w-4" />
                Add record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add finance record</DialogTitle>
                <DialogDescription>
                  Choose what you want to add, then fill only the fields needed for
                  that record.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <Select
                  value={recordKind}
                  onValueChange={(value) => setRecordKind(value as AddRecordKind)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">Transaction</SelectItem>
                    <SelectItem value="planned-expense">
                      Planned expense
                    </SelectItem>
                    <SelectItem value="bill">Recurring bill</SelectItem>
                    <SelectItem value="saving">Savings goal</SelectItem>
                    <SelectItem value="budget">Monthly budget</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>

                {recordKind === "transaction" ? (
                  <TransactionCreateForm
                    categories={transactionCategories}
                    control={transactionForm.control}
                    form={transactionForm}
                    isPending={isCreatingTransaction}
                    onSubmit={transactionForm.handleSubmit(onCreateTransaction)}
                  />
                ) : null}
                {recordKind === "bill" ? (
                  <BillCreateForm
                    control={billForm.control}
                    expenseCategories={expenseCategories}
                    form={billForm}
                    isPending={isCreatingBill}
                    onSubmit={billForm.handleSubmit(onCreateBill)}
                  />
                ) : null}
                {recordKind === "planned-expense" ? (
                  <PlannedExpenseCreateForm
                    control={plannedExpenseForm.control}
                    expenseCategories={expenseCategories}
                    form={plannedExpenseForm}
                    isPending={isCreatingPlannedExpense}
                    onSubmit={plannedExpenseForm.handleSubmit(
                      onCreatePlannedExpense
                    )}
                  />
                ) : null}
                {recordKind === "saving" ? (
                  <SavingsCreateForm
                    control={savingsForm.control}
                    form={savingsForm}
                    isPending={isCreatingSavingsGoal}
                    onSubmit={savingsForm.handleSubmit(onCreateSavingsGoal)}
                  />
                ) : null}
                {recordKind === "budget" ? (
                  <BudgetCreateForm
                    control={budgetForm.control}
                    expenseCategories={expenseCategories}
                    form={budgetForm}
                    isPending={isCreatingBudget}
                    onSubmit={budgetForm.handleSubmit(onCreateBudget)}
                  />
                ) : null}
                {recordKind === "category" ? (
                  <CategoryCreateForm
                    control={categoryForm.control}
                    error={categoryError?.message}
                    form={categoryForm}
                    isPending={isCreatingCategory}
                    onSubmit={categoryForm.handleSubmit(onCreateCategory)}
                  />
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <OverviewPanel
        title={`Money tracked for ${periodLabel}`}
        description={`The first number is your tracked total for the ${periodDescriptor}: cash after expenses, active bills, and unpaid planned expenses, plus money already placed in savings goals.`}
        stats={[
          {
            label: "Total tracked",
            value: formatCurrency(totalMoneyTracked),
            icon: CircleDollarSign,
          },
          {
            label: "Cash after plans",
            value: formatCurrency(cashAfterBills),
            icon: WalletCards,
          },
          {
            label: "Saved",
            value: formatCurrency(totalSavingsCurrent),
            icon: PiggyBank,
          },
        ]}
        progress={{
          label: `${summary?.budgetUsedPercent ?? 0}% budget used`,
          value: summary?.budgetUsedPercent ?? 0,
          detail: `${formatCurrency(
            activeBillsTotal + plannedExpensesTotal
          )} in active bills and unpaid planned expenses for this ${periodMode}`,
          icon: ReceiptText,
        }}
        focusTitle="What needs attention"
        focusDescription={`Use bills and savings together with ${periodLabel}'s cash flow before making spending decisions.`}
        focusItems={[
          {
            label: "Active bills",
            value: `${activeBillsCount} - ${formatCurrency(activeBillsTotal)}`,
            icon: CalendarClock,
          },
          {
            label: "Planned expenses",
            value: `${unpaidPlannedExpenses.length} - ${formatCurrency(
              plannedExpensesTotal
            )}`,
            icon: ClipboardList,
          },
          {
            label: "Savings target left",
            value: formatCurrency(remainingSavings),
            icon: Landmark,
          },
        ]}
      />

      <section className="grid min-w-0 gap-4 xl:grid-cols-4">
        <FinanceMetricCard
          icon={Banknote}
          label={`Income this ${periodMode}`}
          value={formatCurrency(totalIncome)}
        />
        <FinanceMetricCard
          icon={ReceiptText}
          label={`Expenses this ${periodMode}`}
          value={formatCurrency(totalExpenses)}
        />
        <FinanceMetricCard
          icon={ClipboardList}
          label={`Planned this ${periodMode}`}
          value={formatCurrency(plannedExpensesTotal)}
        />
        <FinanceMetricCard
          icon={ChartNoAxesCombined}
          label="Net flow"
          value={formatCurrency(netCashFlow)}
        />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FinanceBarChart
          data={billsChartData}
          emptyLabel="No active recurring bills yet."
          title="Bills visualization"
          valueKey="amount"
        />
        <FinanceSavingsChart
          data={savingsChartData}
          emptyLabel="No savings goals yet."
          title="Savings visualization"
        />
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <FinanceTotalChart data={totalChartData} />

        <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartNoAxesCombined className="h-5 w-5 text-primary" />
              Smart insights
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading financial context...
              </p>
            ) : summary?.insights.length ? (
              summary.insights.map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-lg border border-border/70 bg-secondary/35 p-4"
                >
                  <div className="text-sm font-medium">{insight.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
                Add budgets, bills, and transactions to unlock useful alerts.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {periodTransactions.length ? (
              periodTransactions.slice(0, 8).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex min-w-0 flex-col justify-between gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {transaction.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.category?.name ?? "Uncategorized"} -{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div
                      className={
                        transaction.type === "income"
                          ? "font-semibold text-emerald-600"
                          : "font-semibold text-foreground"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(moneyToNumber(transaction.amount))}
                    </div>
                    <TransactionActions
                      categories={categories}
                      transaction={transaction}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
                No transactions yet for {periodLabel}. Use Add record to start
                this {periodMode} summary.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FinanceListBlock
              emptyLabel="No recurring bills yet."
              items={finance?.recurringBills.map((bill) => ({
                label: `${bill.title} - day ${bill.dueDay}`,
                value: formatCurrency(moneyToNumber(bill.amount)),
              }))}
              title="Bills"
            />
            <FinanceListBlock
              emptyLabel={`No planned expenses for ${periodLabel}.`}
              items={periodPlannedExpenses.map((expense) => ({
                label: `${expense.title} - ${new Date(
                  expense.plannedDate
                ).toLocaleDateString()}`,
                value: `${expense.isPaid ? "Paid" : "Planned"} ${formatCurrency(
                  moneyToNumber(expense.amount)
                )}`,
              }))}
              title="Planned expenses"
            />
            <FinanceListBlock
              emptyLabel="No savings goals yet."
              items={finance?.savingsGoals.map((goal) => ({
                label: goal.title,
                value: `${Math.round(
                  (moneyToNumber(goal.currentAmount) /
                    Math.max(moneyToNumber(goal.targetAmount), 1)) *
                    100
                )}%`,
              }))}
              title="Savings"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Manage finance records</CardTitle>
          <CardDescription>
            Edit or delete the records that feed your totals, charts, and
            insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-2">
          <FinanceManageBlock
            count={finance?.categories.length ?? 0}
            description="Labels used by income, expenses, budgets, and bills."
            emptyLabel="No categories found."
            title="Categories"
          >
            {finance?.categories.map((category) => (
              <FinanceRecordRow
                accentColor={category.color}
                action={<CategoryActions category={category} />}
                key={category.id}
                meta={`${category.type}${category.isDefault ? " - default" : ""}`}
                title={category.name}
                value={category.type === "income" ? "Income" : "Expense"}
              />
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock
            count={finance?.budgets.length ?? 0}
            description="Monthly spending limits by expense category."
            emptyLabel="No budgets yet."
            title="Budgets"
          >
            {finance?.budgets.map((budget) => (
              <FinanceRecordRow
                action={
                  <BudgetActions
                    budget={budget}
                    expenseCategories={expenseCategories}
                  />
                }
                key={budget.id}
                meta={`${budget.category?.name ?? "Uncategorized"} - ${budget.month}`}
                title={budget.title}
                value={formatCurrency(moneyToNumber(budget.amount))}
              />
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock
            count={finance?.recurringBills.length ?? 0}
            description="Expected recurring expenses included in cash after bills."
            emptyLabel="No recurring bills yet."
            title="Bills"
          >
            {finance?.recurringBills.map((bill) => (
              <FinanceRecordRow
                action={
                  <BillActions bill={bill} expenseCategories={expenseCategories} />
                }
                key={bill.id}
                meta={`${bill.category?.name ?? "Uncategorized"} - due day ${
                  bill.dueDay
                }${bill.isActive ? "" : " - inactive"}`}
                title={bill.title}
                value={formatCurrency(moneyToNumber(bill.amount))}
              />
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock
            count={finance?.plannedExpenses.length ?? 0}
            description="One-time future expenses included while they remain unpaid."
            emptyLabel="No planned expenses yet."
            title="Planned expenses"
          >
            {finance?.plannedExpenses.map((expense) => (
              <FinanceRecordRow
                action={
                  <PlannedExpenseActions
                    expense={expense}
                    expenseCategories={expenseCategories}
                  />
                }
                key={expense.id}
                meta={`${expense.category?.name ?? "Uncategorized"} - ${new Date(
                  expense.plannedDate
                ).toLocaleDateString()}${expense.isPaid ? " - paid" : ""}`}
                title={expense.title}
                value={formatCurrency(moneyToNumber(expense.amount))}
              />
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock
            count={finance?.savingsGoals.length ?? 0}
            description="Targets and current balances included in saved money."
            emptyLabel="No savings goals yet."
            title="Savings"
          >
            {finance?.savingsGoals.map((goal) => (
              <FinanceRecordRow
                action={<SavingsGoalActions goal={goal} />}
                key={goal.id}
                meta={`${formatCurrency(
                  moneyToNumber(goal.currentAmount)
                )} saved of ${formatCurrency(moneyToNumber(goal.targetAmount))}`}
                title={goal.title}
                value={`${Math.round(
                    (moneyToNumber(goal.currentAmount) /
                      Math.max(moneyToNumber(goal.targetAmount), 1)) *
                      100
                  )}%`}
              />
            ))}
          </FinanceManageBlock>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionCreateForm({
  categories,
  control,
  form,
  isPending,
  onSubmit,
}: {
  categories: Array<{ id: string; name: string }>;
  control: ReturnType<typeof useForm<FinancialTransactionCreateInput>>["control"];
  form: ReturnType<typeof useForm<FinancialTransactionCreateInput>>;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          {...form.register("title", { required: "Title is required" })}
          placeholder="Example: Grocery run"
        />
        <Controller
          name="amount"
          control={control}
          rules={{ min: 0.01, required: true }}
          render={({ field }) => (
            <MoneyInput value={field.value} onValueChange={field.onChange} />
          )}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value as FinanceRecordType);
                form.setValue("categoryId", "");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name="categoryId"
          control={control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <Input {...form.register("date", { required: true })} type="date" />
      </div>
      <Input {...form.register("notes")} placeholder="Optional note" />
      <Button type="submit" disabled={isPending || categories.length === 0}>
        {isPending ? "Adding..." : "Add transaction"}
      </Button>
    </form>
  );
}

function CategoryCreateForm({
  control,
  error,
  form,
  isPending,
  onSubmit,
}: {
  control: ReturnType<typeof useForm<FinancialCategoryCreateInput>>["control"];
  error?: string;
  form: ReturnType<typeof useForm<FinancialCategoryCreateInput>>;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input {...form.register("name", { required: true })} placeholder="Category name" />
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save category"}
      </Button>
    </form>
  );
}

function BudgetCreateForm({
  control,
  expenseCategories,
  form,
  isPending,
  onSubmit,
}: {
  control: ReturnType<typeof useForm<BudgetCreateInput>>["control"];
  expenseCategories: Array<{ id: string; name: string }>;
  form: ReturnType<typeof useForm<BudgetCreateInput>>;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input {...form.register("title", { required: true })} placeholder="Budget title" />
      <Controller
        name="amount"
        control={control}
        rules={{ min: 0.01, required: true }}
        render={({ field }) => (
          <MoneyInput
            placeholder="Budget limit"
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Controller
        name="categoryId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Expense category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <Input {...form.register("month")} type="month" />
      <Button disabled={isPending || expenseCategories.length === 0} type="submit">
        {isPending ? "Saving..." : "Save budget"}
      </Button>
    </form>
  );
}

function BillCreateForm({
  control,
  expenseCategories,
  form,
  isPending,
  onSubmit,
}: {
  control: ReturnType<typeof useForm<RecurringBillCreateInput>>["control"];
  expenseCategories: Array<{ id: string; name: string }>;
  form: ReturnType<typeof useForm<RecurringBillCreateInput>>;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input {...form.register("title", { required: true })} placeholder="Bill name" />
      <Controller
        name="amount"
        control={control}
        rules={{ min: 0.01, required: true }}
        render={({ field }) => (
          <MoneyInput value={field.value} onValueChange={field.onChange} />
        )}
      />
      <Input
        {...form.register("dueDay", {
          required: true,
          valueAsNumber: true,
        })}
        max="31"
        min="1"
        type="number"
        placeholder="Due day"
      />
      <Controller
        name="categoryId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <Button disabled={isPending || expenseCategories.length === 0} type="submit">
        {isPending ? "Saving..." : "Save bill"}
      </Button>
    </form>
  );
}

function PlannedExpenseCreateForm({
  control,
  expenseCategories,
  form,
  isPending,
  onSubmit,
}: {
  control: ReturnType<typeof useForm<PlannedExpenseCreateInput>>["control"];
  expenseCategories: Array<{ id: string; name: string }>;
  form: ReturnType<typeof useForm<PlannedExpenseCreateInput>>;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input
        {...form.register("title", { required: true })}
        placeholder="Expense title"
      />
      <Controller
        name="amount"
        control={control}
        rules={{ min: 0.01, required: true }}
        render={({ field }) => (
          <MoneyInput value={field.value} onValueChange={field.onChange} />
        )}
      />
      <Input
        {...form.register("plannedDate", { required: true })}
        type="date"
      />
      <Controller
        name="categoryId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Expense category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <Input {...form.register("notes")} placeholder="Optional note" />
      <Controller
        name="isPaid"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            />
            Mark as paid
          </label>
        )}
      />
      <Button disabled={isPending || expenseCategories.length === 0} type="submit">
        {isPending ? "Saving..." : "Save planned expense"}
      </Button>
    </form>
  );
}

function SavingsCreateForm({
  control,
  form,
  isPending,
  onSubmit,
}: {
  control: ReturnType<typeof useForm<SavingsGoalCreateInput>>["control"];
  form: ReturnType<typeof useForm<SavingsGoalCreateInput>>;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input {...form.register("title", { required: true })} placeholder="Goal title" />
      <Controller
        name="targetAmount"
        control={control}
        rules={{ min: 0.01, required: true }}
        render={({ field }) => (
          <MoneyInput
            placeholder="Target"
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Controller
        name="currentAmount"
        control={control}
        rules={{ min: 0 }}
        render={({ field }) => (
          <MoneyInput
            placeholder="Current"
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Input {...form.register("targetDate")} type="date" />
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save goal"}
      </Button>
    </form>
  );
}

function FinanceMetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardContent className="flex min-w-0 items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 break-words text-xl font-semibold tracking-tight sm:text-2xl">
            {value}
          </div>
        </div>
        <div className="shrink-0 rounded-lg bg-secondary p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function FinanceBarChart({
  data,
  emptyLabel,
  title,
  valueKey,
}: {
  data: Array<{ name: string; amount: number }>;
  emptyLabel: string;
  title: string;
  valueKey: "amount";
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer config={moneyConfig} className="h-[240px] w-full sm:h-[260px]">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={56}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey={valueKey}
                fill="var(--color-amount)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FinanceSavingsChart({
  data,
  emptyLabel,
  title,
}: {
  data: Array<{ name: string; current: number; remaining: number }>;
  emptyLabel: string;
  title: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer config={moneyConfig} className="h-[240px] w-full sm:h-[260px]">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={56}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="current"
                stackId="saving"
                fill="var(--color-current)"
                radius={[0, 0, 6, 6]}
              />
              <Bar
                dataKey="remaining"
                stackId="saving"
                fill="var(--color-remaining)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FinanceTotalChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Total money picture</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={totalConfig} className="h-[240px] w-full sm:h-[280px]">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function FinanceManageBlock({
  children,
  count,
  description,
  emptyLabel,
  title,
}: {
  children?: ReactNode;
  count: number;
  description: string;
  emptyLabel: string;
  title: string;
}) {
  const hasItems = Children.count(children) > 0;

  return (
    <div className="rounded-lg border border-border/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        {hasItems ? (
          children
        ) : (
          <p className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function FinanceRecordRow({
  accentColor,
  action,
  meta,
  title,
  value,
}: {
  accentColor?: string | null;
  action: ReactNode;
  meta: string;
  title: string;
  value: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg bg-secondary/35 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 gap-3">
        {accentColor ? (
          <span
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        ) : null}
        <div className="min-w-0">
          <div className="truncate font-medium">{title}</div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {meta}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="shrink-0 font-semibold">{value}</div>
        {action}
      </div>
    </div>
  );
}

function FinanceListBlock({
  emptyLabel,
  items = [],
  title,
}: {
  emptyLabel: string;
  items?: Array<{ label: string; value: string }>;
  title: string;
}) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-2 grid gap-2">
        {items.length ? (
          items.slice(0, 4).map((item) => (
            <div
              key={`${title}-${item.label}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-secondary/35 p-3 text-sm"
            >
              <span className="truncate text-muted-foreground">{item.label}</span>
              <span className="shrink-0 font-medium">{item.value}</span>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary/35 p-3 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
}
