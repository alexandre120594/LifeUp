"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  FileUp,
  Trash2,
} from "lucide-react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAccountSpendTracker,
  useDeleteAccountSpendImport,
  useImportAccountSpendCsv,
} from "@/hooks/useFinanceMutations";
import { formatCurrency } from "@/lib/finance";

const pageSize = 25;
type AccountSpendSourceType = "extrato" | "fatura";

function formatMonthLabel(month?: string | null) {
  if (!month) {
    return "No month selected";
  }

  return new Date(`${month}-02T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString();
}

function getMovementLabel(amount: number) {
  return amount >= 0 ? "Credit" : "Debit";
}

export default function FinanceTrackerPage() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [sourceType, setSourceType] =
    useState<AccountSpendSourceType>("extrato");
  const [importSourceType, setImportSourceType] =
    useState<AccountSpendSourceType>("extrato");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [page, setPage] = useState(1);
  const [isPendingNavigation, startTransition] = useTransition();
  const { data, error, isFetching } = useAccountSpendTracker({
    month: selectedMonth || undefined,
    page,
    pageSize,
    sourceType,
  });
  const {
    error: importError,
    isPending: isImporting,
    mutate: importCsv,
  } = useImportAccountSpendCsv();
  const {
    error: deleteError,
    isPending: isDeletingImport,
    mutate: deleteImport,
  } = useDeleteAccountSpendImport();

  const months = data?.months ?? [];
  const entries = data?.entries ?? [];
  const imports = data?.imports ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  };
  const summary = data?.summary;

  const onImport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file || !name.trim()) {
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("file", file);
    formData.set("sourceType", importSourceType);

    importCsv(formData, {
      onSuccess: (response) => {
        setName("");
        setFile(null);
        setPage(1);
        setSourceType(response.sourceType);
        setSelectedMonth(response.month);
        setIsImportOpen(false);
      },
    });
  };

  const setPageFast = (nextPage: number) => {
    startTransition(() => setPage(nextPage));
  };

  return (
    <div className="min-w-0 space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <MenuPageHeader
          eyebrow="Finance visualization"
          title="Account Spend Tracker"
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-11 gap-2 rounded-lg" variant="outline">
            <Link href="/finance">
              <ArrowLeft className="h-4 w-4" />
              Financial Organizer
            </Link>
          </Button>
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2 rounded-lg">
                <FileUp className="h-4 w-4" />
                Import statement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import bank statement</DialogTitle>
                <DialogDescription>
                  Upload a CSV or OFX statement. Rows stay isolated from the
                  Financial Organizer.
                </DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={onImport}>
                <Select
                  value={importSourceType}
                  onValueChange={(value) =>
                    setImportSourceType(value as AccountSpendSourceType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extrato">Extrato</SelectItem>
                    <SelectItem value="fatura">Fatura</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Example: Nubank May statement"
                  value={name}
                />
                <Input
                  accept=".csv,.ofx,text/csv,application/x-ofx"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  type="file"
                />
                <p className="rounded-lg bg-secondary/35 p-3 text-xs leading-5 text-muted-foreground">
                  CSV columns: tipo, Data, valor, descricao. OFX maps TRNTYPE,
                  DTPOSTED, TRNAMT, and MEMO/NAME. Multi-month files are split
                  by each row date in the selected Extrato/Fatura view.
                </p>
                {importError ? (
                  <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {importError.message}
                  </p>
                ) : null}
                <Button disabled={isImporting || !file || !name.trim()} type="submit">
                  {isImporting ? "Importing..." : "Import file"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,150px)_minmax(0,180px)_minmax(0,1fr)]">
            <Select
              value={sourceType}
              onValueChange={(value) => {
                setSourceType(value as AccountSpendSourceType);
                setSelectedMonth("");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extrato">Extrato</SelectItem>
                <SelectItem value="fatura">Fatura</SelectItem>
              </SelectContent>
            </Select>
            <Input
              disabled={!months.length}
              max="9999-12"
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setPage(1);
              }}
              type="month"
              value={selectedMonth || summary?.month || ""}
            />
            <div className="flex min-w-0 flex-wrap gap-2">
              {imports.length ? (
                imports.map((importRecord) => (
                  <div
                    className="flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-secondary/30 px-3 py-2 text-sm"
                    key={importRecord.id}
                  >
                    <span className="truncate">
                      {importRecord.name} - {importRecord.sourceType} -{" "}
                      {importRecord.rowCount} rows
                    </span>
                    <button
                      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      disabled={isDeletingImport}
                      onClick={() => {
                        setPage(1);
                        deleteImport(importRecord.id);
                      }}
                      title="Delete import"
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="rounded-full bg-secondary/35 px-3 py-2 text-sm text-muted-foreground">
                  No imported statements for this month.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-3 xl:min-w-[520px]">
            <MovementStat
              label="Credits"
              tone="income"
              value={formatCurrency(summary?.totalIncome ?? 0)}
            />
            <MovementStat
              label="Debits"
              tone="expense"
              value={formatCurrency(summary?.totalExpense ?? 0)}
            />
            <MovementStat
              label="Net"
              tone={(summary?.netTotal ?? 0) >= 0 ? "income" : "expense"}
              value={formatCurrency(summary?.netTotal ?? 0)}
            />
          </div>
        </div>
        {deleteError ? (
          <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {deleteError.message}
          </p>
        ) : null}
      </section>

      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Statement rows</CardTitle>
          <CardDescription>
            {pagination.totalItems} movements for {formatMonthLabel(summary?.month)}.
            Showing {sourceType}. Credit values add; debit values subtract.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error ? (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/45 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">
                    {sourceType === "fatura" ? "Fatura" : "Extrato"}
                  </th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descricao</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Import</th>
                </tr>
              </thead>
              <tbody>
                {entries.length ? (
                  entries.map((entry) => {
                    const amount = Number(entry.amount);
                    const isCredit = amount >= 0;

                    return (
                      <tr className="border-t border-border/60" key={entry.id}>
                        <td className="px-4 py-3">
                          <span
                            className={
                              isCredit
                                ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700"
                                : "inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700"
                            }
                          >
                            {isCredit ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {getMovementLabel(amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(entry.date)}
                        </td>
                        <td className="max-w-[340px] truncate px-4 py-3 font-medium">
                          {entry.description}
                        </td>
                        <td
                          className={
                            isCredit
                              ? "px-4 py-3 text-right font-semibold text-emerald-700"
                              : "px-4 py-3 text-right font-semibold text-rose-700"
                          }
                        >
                          {formatCurrency(amount)}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                          {entry.import?.name ?? "Import"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      {isFetching
                        ? "Loading statement rows..."
                        : "Import a CSV or OFX statement to start."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
              {isPendingNavigation || isFetching ? " - loading" : ""}
            </p>
            <Pagination className="mx-0 w-auto justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={pagination.page === 1}
                    className={
                      pagination.page === 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPageFast(Math.max(pagination.page - 1, 1));
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    aria-disabled={pagination.page >= pagination.totalPages}
                    className={
                      pagination.page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPageFast(
                        Math.min(pagination.page + 1, pagination.totalPages)
                      );
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MovementStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "expense" | "income";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          tone === "income"
            ? "mt-1 text-lg font-semibold text-emerald-700"
            : "mt-1 text-lg font-semibold text-rose-700"
        }
      >
        {value}
      </div>
    </div>
  );
}
