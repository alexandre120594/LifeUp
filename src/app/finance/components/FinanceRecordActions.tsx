"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";
import { MoneyInput } from "@/components/money-input";
import { Button } from "@/components/ui/button";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteBudget,
  useDeleteFinancialCategory,
  useDeleteFinancialTransaction,
  useDeleteRecurringBill,
  useDeleteSavingsGoal,
  useUpdateBudget,
  useUpdateFinancialCategory,
  useUpdateFinancialTransaction,
  useUpdateRecurringBill,
  useUpdateSavingsGoal,
} from "@/hooks/useFinanceMutations";
import { moneyToNumber } from "@/lib/finance";
import type {
  Budget,
  BudgetCreateInput,
  FinanceRecordType,
  FinancialCategory,
  FinancialCategoryCreateInput,
  FinancialTransaction,
  FinancialTransactionCreateInput,
  RecurringBill,
  RecurringBillCreateInput,
  SavingsGoal,
  SavingsGoalCreateInput,
} from "@/types/BaseInterfaces";

function toDateInputValue(value?: Date | string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function ActionShell({
  children,
  deleteDisabled,
  deleteLabel = "Delete",
  error,
  isDeleting,
  onDelete,
  onOpenChange,
  open,
  title,
}: {
  children: React.ReactNode;
  deleteDisabled?: boolean;
  deleteLabel?: string;
  error?: Error | null;
  isDeleting: boolean;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Update the record while keeping finance summaries in sync.
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
      <Button
        disabled={isDeleting || deleteDisabled}
        onClick={onDelete}
        size="sm"
        variant="destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? "Deleting..." : deleteLabel}
      </Button>
      {error ? (
        <span className="text-xs text-destructive">{error.message}</span>
      ) : null}
    </div>
  );
}

export function TransactionActions({
  categories,
  transaction,
}: {
  categories: FinancialCategory[];
  transaction: FinancialTransaction;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FinancialTransactionCreateInput>({
    defaultValues: {
      amount: moneyToNumber(transaction.amount),
      categoryId: transaction.categoryId,
      date: toDateInputValue(transaction.date),
      notes: transaction.notes ?? "",
      title: transaction.title,
      type: transaction.type,
    },
  });
  const { error: deleteError, mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteFinancialTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateFinancialTransaction();
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  const availableCategories = categories.filter(
    (category) => category.type === selectedType
  );

  const onSubmit = (data: FinancialTransactionCreateInput) => {
    updateTransaction(
      { data, id: transaction.id },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <ActionShell
      error={deleteError}
      isDeleting={isDeleting}
      onDelete={() => deleteTransaction(transaction.id)}
      onOpenChange={setOpen}
      open={open}
      title="Edit transaction"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Input {...form.register("title", { required: true })} />
          <Controller
            name="amount"
            control={form.control}
            rules={{ min: 0.01, required: true }}
            render={({ field }) => (
              <MoneyInput value={field.value} onValueChange={field.onChange} />
            )}
          />
          <Controller
            name="type"
            control={form.control}
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
            control={form.control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Input {...form.register("date", { required: true })} type="date" />
          <Input {...form.register("notes")} placeholder="Optional note" />
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
      </form>
    </ActionShell>
  );
}

export function CategoryActions({
  category,
}: {
  category: FinancialCategory;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FinancialCategoryCreateInput>({
    defaultValues: {
      color: category.color ?? "#0f766e",
      name: category.name,
      type: category.type,
    },
  });
  const { error: deleteError, mutate: deleteCategory, isPending: isDeleting } =
    useDeleteFinancialCategory();
  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateFinancialCategory();

  const onSubmit = (data: FinancialCategoryCreateInput) => {
    updateCategory(
      { data, id: category.id },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <ActionShell
      deleteDisabled={category.isDefault}
      deleteLabel={category.isDefault ? "Default" : "Delete"}
      error={deleteError}
      isDeleting={isDeleting}
      onDelete={() => deleteCategory(category.id)}
      onOpenChange={setOpen}
      open={open}
      title="Edit category"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Input {...form.register("name", { required: true })} />
          <Controller
            name="type"
            control={form.control}
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
          <Input {...form.register("color")} type="color" />
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
      </form>
    </ActionShell>
  );
}

export function BudgetActions({
  budget,
  expenseCategories,
}: {
  budget: Budget;
  expenseCategories: FinancialCategory[];
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<BudgetCreateInput>({
    defaultValues: {
      amount: moneyToNumber(budget.amount),
      categoryId: budget.categoryId,
      month: budget.month,
      title: budget.title,
    },
  });
  const { error: deleteError, mutate: deleteBudget, isPending: isDeleting } =
    useDeleteBudget();
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();

  const onSubmit = (data: BudgetCreateInput) => {
    updateBudget(
      { data, id: budget.id },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <ActionShell
      error={deleteError}
      isDeleting={isDeleting}
      onDelete={() => deleteBudget(budget.id)}
      onOpenChange={setOpen}
      open={open}
      title="Edit budget"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Input {...form.register("title", { required: true })} />
          <Controller
            name="amount"
            control={form.control}
            rules={{ min: 0.01, required: true }}
            render={({ field }) => (
              <MoneyInput value={field.value} onValueChange={field.onChange} />
            )}
          />
          <Controller
            name="categoryId"
            control={form.control}
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
          <Input {...form.register("month", { required: true })} type="month" />
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
      </form>
    </ActionShell>
  );
}

export function BillActions({
  bill,
  expenseCategories,
}: {
  bill: RecurringBill;
  expenseCategories: FinancialCategory[];
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<RecurringBillCreateInput>({
    defaultValues: {
      amount: moneyToNumber(bill.amount),
      categoryId: bill.categoryId,
      dueDay: bill.dueDay,
      title: bill.title,
    },
  });
  const { error: deleteError, mutate: deleteBill, isPending: isDeleting } =
    useDeleteRecurringBill();
  const { mutate: updateBill, isPending: isUpdating } =
    useUpdateRecurringBill();

  const onSubmit = (data: RecurringBillCreateInput) => {
    updateBill(
      { data, id: bill.id },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <ActionShell
      error={deleteError}
      isDeleting={isDeleting}
      onDelete={() => deleteBill(bill.id)}
      onOpenChange={setOpen}
      open={open}
      title="Edit recurring bill"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Input {...form.register("title", { required: true })} />
          <Controller
            name="amount"
            control={form.control}
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
          />
          <Controller
            name="categoryId"
            control={form.control}
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
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
      </form>
    </ActionShell>
  );
}

export function SavingsGoalActions({ goal }: { goal: SavingsGoal }) {
  const [open, setOpen] = useState(false);
  const form = useForm<SavingsGoalCreateInput>({
    defaultValues: {
      currentAmount: moneyToNumber(goal.currentAmount),
      targetAmount: moneyToNumber(goal.targetAmount),
      targetDate: toDateInputValue(goal.targetDate),
      title: goal.title,
    },
  });
  const { error: deleteError, mutate: deleteGoal, isPending: isDeleting } =
    useDeleteSavingsGoal();
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateSavingsGoal();

  const onSubmit = (data: SavingsGoalCreateInput) => {
    updateGoal(
      { data, id: goal.id },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <ActionShell
      error={deleteError}
      isDeleting={isDeleting}
      onDelete={() => deleteGoal(goal.id)}
      onOpenChange={setOpen}
      open={open}
      title="Edit savings goal"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Input {...form.register("title", { required: true })} />
          <Controller
            name="targetAmount"
            control={form.control}
            rules={{ min: 0.01, required: true }}
            render={({ field }) => (
              <MoneyInput value={field.value} onValueChange={field.onChange} />
            )}
          />
          <Controller
            name="currentAmount"
            control={form.control}
            rules={{ min: 0 }}
            render={({ field }) => (
              <MoneyInput value={field.value} onValueChange={field.onChange} />
            )}
          />
          <Input {...form.register("targetDate")} type="date" />
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
      </form>
    </ActionShell>
  );
}
