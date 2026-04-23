"use client";

import { Children, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Banknote,
  CalendarClock,
  ChartNoAxesCombined,
  CircleDollarSign,
  Landmark,
  PiggyBank,
  ReceiptText,
  Tags,
  WalletCards,
} from "lucide-react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { MoneyInput } from "@/components/money-input";
import { OverviewPanel } from "@/components/overview-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  SavingsGoalActions,
  TransactionActions,
} from "./components/FinanceRecordActions";
import {
  useCreateBudget,
  useCreateFinancialCategory,
  useCreateFinancialTransaction,
  useCreateRecurringBill,
  useCreateSavingsGoal,
  useFinanceDashboard,
} from "@/hooks/useFinanceMutations";
import { formatCurrency, getCurrentMonthKey, moneyToNumber } from "@/lib/finance";
import type {
  BudgetCreateInput,
  FinanceRecordType,
  FinancialCategoryCreateInput,
  FinancialTransactionCreateInput,
  RecurringBillCreateInput,
  SavingsGoalCreateInput,
} from "@/types/BaseInterfaces";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = getCurrentMonthKey();

export default function FinancePage() {
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
  const { mutate: createSavingsGoal, isPending: isCreatingSavingsGoal } =
    useCreateSavingsGoal();

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
      },
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader
        eyebrow="Personal finance"
        title="Financial Organizer"
      />

      <OverviewPanel
        title="Money clarity for this month"
        description="Track cash flow, budgets, recurring bills, and savings goals without turning the app into accounting software."
        stats={[
          {
            label: "Income",
            value: formatCurrency(finance?.summary.totalIncome ?? 0),
            icon: Banknote,
          },
          {
            label: "Expenses",
            value: formatCurrency(finance?.summary.totalExpenses ?? 0),
            icon: ReceiptText,
          },
          {
            label: "Net Flow",
            value: formatCurrency(finance?.summary.netCashFlow ?? 0),
            icon: ChartNoAxesCombined,
          },
        ]}
        progress={{
          label: `${finance?.summary.budgetUsedPercent ?? 0}% budget used`,
          value: finance?.summary.budgetUsedPercent ?? 0,
          detail: `${formatCurrency(
            finance?.summary.upcomingBillsTotal ?? 0
          )} in recurring bills tracked`,
          icon: WalletCards,
        }}
        focusTitle="Plan before it becomes urgent"
        focusDescription="Add recurring bills and savings goals early so weekly decisions have context."
        focusItems={[
          {
            label: "Savings progress",
            value: `${finance?.summary.savingsProgress ?? 0}%`,
            icon: PiggyBank,
          },
          {
            label: "Active bills",
            value: finance?.recurringBills.filter((bill) => bill.isActive)
              .length ?? 0,
            icon: CalendarClock,
          },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-primary" />
              Add transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={transactionForm.handleSubmit(onCreateTransaction)}
              className="grid gap-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  {...transactionForm.register("title", {
                    required: "Title is required",
                  })}
                  placeholder="Example: Grocery run"
                />
                <Controller
                  name="amount"
                  control={transactionForm.control}
                  rules={{ min: 0.01, required: true }}
                  render={({ field }) => (
                    <MoneyInput
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Controller
                  name="type"
                  control={transactionForm.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value as FinanceRecordType);
                        transactionForm.setValue("categoryId", "");
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
                  control={transactionForm.control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {transactionCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  {...transactionForm.register("date", { required: true })}
                  type="date"
                />
              </div>

              <Input
                {...transactionForm.register("notes")}
                placeholder="Optional note"
              />

              <Button
                type="submit"
                disabled={isCreatingTransaction || transactionCategories.length === 0}
                className="h-11 rounded-xl"
              >
                {isCreatingTransaction ? "Adding..." : "Add transaction"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
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
            ) : finance?.summary.insights.length ? (
              finance.summary.insights.map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-2xl border border-border/70 bg-secondary/35 p-4"
                >
                  <div className="text-sm font-medium">{insight.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                Add budgets, bills, and transactions to unlock useful alerts.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <FinanceFormCard icon={Tags} title="Category">
          <form
            onSubmit={categoryForm.handleSubmit(onCreateCategory)}
            className="grid gap-3"
          >
            <Input
              {...categoryForm.register("name", { required: true })}
              placeholder="Category name"
            />
            <Controller
              name="type"
              control={categoryForm.control}
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
            {categoryError ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {categoryError.message}
              </p>
            ) : null}
            <Button disabled={isCreatingCategory} type="submit">
              {isCreatingCategory ? "Saving..." : "Save category"}
            </Button>
          </form>
        </FinanceFormCard>

        <FinanceFormCard icon={WalletCards} title="Budget">
          <form
            onSubmit={budgetForm.handleSubmit(onCreateBudget)}
            className="grid gap-3"
          >
            <Input
              {...budgetForm.register("title", { required: true })}
              placeholder="Budget title"
            />
            <Controller
              name="amount"
              control={budgetForm.control}
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
              control={budgetForm.control}
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
            <Input {...budgetForm.register("month")} type="month" />
            <Button disabled={isCreatingBudget} type="submit">
              {isCreatingBudget ? "Saving..." : "Save budget"}
            </Button>
          </form>
        </FinanceFormCard>

        <FinanceFormCard icon={CalendarClock} title="Recurring bill">
          <form
            onSubmit={billForm.handleSubmit(onCreateBill)}
            className="grid gap-3"
          >
            <Input
              {...billForm.register("title", { required: true })}
              placeholder="Bill name"
            />
            <Controller
              name="amount"
              control={billForm.control}
              rules={{ min: 0.01, required: true }}
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Input
              {...billForm.register("dueDay", {
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
              control={billForm.control}
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
            <Button disabled={isCreatingBill} type="submit">
              {isCreatingBill ? "Saving..." : "Save bill"}
            </Button>
          </form>
        </FinanceFormCard>

        <FinanceFormCard icon={PiggyBank} title="Savings goal">
          <form
            onSubmit={savingsForm.handleSubmit(onCreateSavingsGoal)}
            className="grid gap-3"
          >
            <Input
              {...savingsForm.register("title", { required: true })}
              placeholder="Goal title"
            />
            <Controller
              name="targetAmount"
              control={savingsForm.control}
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
              control={savingsForm.control}
              rules={{ min: 0 }}
              render={({ field }) => (
                <MoneyInput
                  placeholder="Current"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Input {...savingsForm.register("targetDate")} type="date" />
            <Button disabled={isCreatingSavingsGoal} type="submit">
              {isCreatingSavingsGoal ? "Saving..." : "Save goal"}
            </Button>
          </form>
        </FinanceFormCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {finance?.transactions.length ? (
              finance.transactions.slice(0, 8).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 p-3"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {transaction.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.category?.name ?? "Uncategorized"} ·{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
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
              <p className="rounded-2xl bg-secondary/35 p-4 text-sm text-muted-foreground">
                No transactions yet. Add one above to start the month summary.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
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
                label: `${bill.title} · day ${bill.dueDay}`,
                value: formatCurrency(moneyToNumber(bill.amount)),
              }))}
              title="Bills"
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

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Manage finance records</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-2">
          <FinanceManageBlock emptyLabel="No categories found." title="Categories">
            {finance?.categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/35 p-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {category.name} - {category.type}
                </span>
                <CategoryActions category={category} />
              </div>
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock emptyLabel="No budgets yet." title="Budgets">
            {finance?.budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/35 p-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {budget.title} - {formatCurrency(moneyToNumber(budget.amount))}
                </span>
                <BudgetActions
                  budget={budget}
                  expenseCategories={expenseCategories}
                />
              </div>
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock emptyLabel="No recurring bills yet." title="Bills">
            {finance?.recurringBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/35 p-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {bill.title} - day {bill.dueDay} -{" "}
                  {formatCurrency(moneyToNumber(bill.amount))}
                </span>
                <BillActions bill={bill} expenseCategories={expenseCategories} />
              </div>
            ))}
          </FinanceManageBlock>

          <FinanceManageBlock emptyLabel="No savings goals yet." title="Savings">
            {finance?.savingsGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/35 p-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {goal.title} -{" "}
                  {Math.round(
                    (moneyToNumber(goal.currentAmount) /
                      Math.max(moneyToNumber(goal.targetAmount), 1)) *
                      100
                  )}
                  %
                </span>
                <SavingsGoalActions goal={goal} />
              </div>
            ))}
          </FinanceManageBlock>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceFormCard({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: typeof Tags;
  title: string;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FinanceManageBlock({
  children,
  emptyLabel,
  title,
}: {
  children?: ReactNode;
  emptyLabel: string;
  title: string;
}) {
  const hasItems = Children.count(children) > 0;

  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-2 grid gap-2">
        {hasItems ? (
          children
        ) : (
          <p className="rounded-2xl bg-secondary/35 p-3 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
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
              className="flex items-center justify-between rounded-2xl bg-secondary/35 p-3 text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-secondary/35 p-3 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </div>
    </div>
  );
}
