"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { FinanceDialog, type FinanceDialogMode, type FinanceEditingItem } from "@/components/finance/FinanceDialog";
import { EmptyState, ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useDeleteFinancialCommitment, useDeleteFinancialCommitments, useDeleteFinancialGoal,
  useDeleteFinancialGoals, useDeleteFinancialTransaction, useDeleteFinancialTransactions,
  useDeleteFinancialTransactionsByPeriod, useFinanceWorkspace, usePayFinancialCommitment,
} from "@/hooks/useFinanceWorkspace";
import type { FinancePeriod, FinanceWorkspace, FinancialCommitment, FinancialGoal, FinancialTransaction } from "@/types/Finance";

type FinanceTab = "transactions" | "commitments" | "goals";
type DeleteTarget = { kind: "commitment"; item: FinancialCommitment } | { kind: "goal"; item: FinancialGoal } | { kind: "transaction"; item: FinancialTransaction };
type BulkDeleteTarget = { kind: FinanceTab; ids: string[] } | { kind: "transaction-period" };

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentage = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
function ActionMenu({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  return <details className="relative shrink-0"><summary className="grid size-9 cursor-pointer list-none place-items-center rounded-md text-text-tertiary hover:bg-hover hover:text-foreground" aria-label="Abrir ações"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-30 mt-1 w-32 rounded-lg border border-border bg-panel p-1 shadow-snow-2"><button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-hover" onClick={onEdit} type="button"><Pencil className="size-4" />Editar</button><button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10" onClick={onDelete} type="button"><Trash2 className="size-4" />Apagar</button></div></details>;
}

function SelectionToolbar({ allSelected, count, labels, onCancel, onClear, onDelete, onSelectAll }: {
  allSelected: boolean; count: number; labels: [string, string]; onCancel: () => void; onClear: () => void; onDelete: () => void; onSelectAll: () => void;
}) {
  return <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-panel-subtle px-4 py-2.5 md:px-5"><span className="mr-auto text-sm font-semibold">{count} {count === 1 ? "selecionado" : "selecionados"}</span><Button size="sm" variant="outline" onClick={onSelectAll} disabled={allSelected}>{allSelected ? "Todos selecionados" : "Selecionar todos"}</Button><Button size="sm" variant="ghost" onClick={onClear} disabled={!count}>Limpar</Button><Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button><Button size="sm" variant="destructive" onClick={onDelete} disabled={!count}><Trash2 className="size-4" />Apagar {count || ""} {count === 1 ? labels[0] : labels[1]}</Button></div>;
}

export default function FinancePage() {
  const today = new Date();
  const [month, setMonth] = useState<number | undefined>(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const period = useMemo<FinancePeriod>(() => ({ month, year }), [month, year]);
  const workspace = useFinanceWorkspace(period);
  const payCommitment = usePayFinancialCommitment();
  const deleteTransaction = useDeleteFinancialTransaction();
  const deleteTransactions = useDeleteFinancialTransactions();
  const deleteTransactionsByPeriod = useDeleteFinancialTransactionsByPeriod();
  const deleteCommitment = useDeleteFinancialCommitment();
  const deleteCommitments = useDeleteFinancialCommitments();
  const deleteGoal = useDeleteFinancialGoal();
  const deleteGoals = useDeleteFinancialGoals();
  const [activeTab, setActiveTab] = useState<FinanceTab>("transactions");
  const [dialog, setDialog] = useState<FinanceDialogMode>(null);
  const [editingItem, setEditingItem] = useState<FinanceEditingItem>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<BulkDeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<Record<FinanceTab, boolean>>({ commitments: false, goals: false, transactions: false });
  const [selected, setSelected] = useState<Record<FinanceTab, Set<string>>>(() => ({ commitments: new Set(), goals: new Set(), transactions: new Set() }));
  const data = workspace.data;
  const deleting = deleteTransaction.isPending || deleteCommitment.isPending || deleteGoal.isPending || deleteTransactions.isPending || deleteTransactionsByPeriod.isPending || deleteCommitments.isPending || deleteGoals.isPending;
  const years = useMemo(() => Array.from({ length: 11 }, (_, index) => year - 5 + index), [year]);

  function openCreate(mode: FinanceDialogMode) { setEditingItem(null); setDialog(mode); }
  function openEdit(mode: FinanceDialogMode, item: FinanceEditingItem) { setEditingItem(item); setDialog(mode); }
  function requestDelete(target: DeleteTarget) { setDeleteError(null); setDeleteTarget(target); }
  function toggleSelected(kind: FinanceTab, id: string) { setSelected((current) => { const next = new Set(current[kind]); if (next.has(id)) next.delete(id); else next.add(id); return { ...current, [kind]: next }; }); }
  function selectAll(kind: FinanceTab, ids: string[]) { setSelected((current) => ({ ...current, [kind]: new Set(ids) })); }
  function clearSelection(kind: FinanceTab, exit = false) { setSelected((current) => ({ ...current, [kind]: new Set() })); if (exit) setSelectionMode((current) => ({ ...current, [kind]: false })); }
  function enterSelection(kind: FinanceTab) { setSelectionMode((current) => ({ ...current, [kind]: true })); }
  function resetPeriodSelections() { clearSelection("transactions", true); clearSelection("commitments", true); }
  function changePeriod(direction: -1 | 1) { resetPeriodSelections(); if (!month) { setYear((value) => value + direction); return; } const next = new Date(year, month - 1 + direction, 1); setMonth(next.getMonth() + 1); setYear(next.getFullYear()); }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleteError(null);
      if (deleteTarget.kind === "transaction") await deleteTransaction.mutateAsync(deleteTarget.item.id);
      if (deleteTarget.kind === "commitment") await deleteCommitment.mutateAsync(deleteTarget.item.id);
      if (deleteTarget.kind === "goal") await deleteGoal.mutateAsync(deleteTarget.item.id);
      const selectedKind = deleteTarget.kind === "transaction" ? "transactions" : deleteTarget.kind === "commitment" ? "commitments" : "goals";
      setSelected((current) => { const next = new Set(current[selectedKind]); next.delete(deleteTarget.item.id); return { ...current, [selectedKind]: next }; });
      setDeleteTarget(null);
    } catch (cause) { setDeleteError(cause instanceof Error ? cause.message : "Não foi possível apagar."); }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget) return;
    try {
      setDeleteError(null);
      if (bulkDeleteTarget.kind === "transaction-period") { await deleteTransactionsByPeriod.mutateAsync(period); clearSelection("transactions", true); }
      else if (bulkDeleteTarget.kind === "transactions") { await deleteTransactions.mutateAsync(bulkDeleteTarget.ids); clearSelection("transactions", true); }
      else if (bulkDeleteTarget.kind === "commitments") { await deleteCommitments.mutateAsync(bulkDeleteTarget.ids); clearSelection("commitments", true); }
      else { await deleteGoals.mutateAsync(bulkDeleteTarget.ids); clearSelection("goals", true); }
      setBulkDeleteTarget(null);
    } catch (cause) { setDeleteError(cause instanceof Error ? cause.message : "Não foi possível apagar os registros selecionados."); }
  }

  async function pay(item: FinancialCommitment) {
    if (!data) return;
    try { setPayError(null); await payCommitment.mutateAsync({ id: item.id, accountId: item.accountId ?? data.accounts.find((account) => account.isActive)?.id ?? "" }); }
    catch (cause) { setPayError(cause instanceof Error ? cause.message : "Não foi possível quitar."); }
  }

  const periodLabel = month ? `${months[month - 1]} de ${year}` : String(year);
  const periodBalanceLabel = month ? "Saldo mensal" : "Saldo anual";
  const deleteCopy = deleteTarget?.kind === "transaction"
    ? { title: "Apagar movimentação?", description: `${deleteTarget.item.title} — ${money.format(deleteTarget.item.amount)}. O saldo e os totais do período serão recalculados.` }
    : deleteTarget?.kind === "commitment"
      ? { title: "Apagar compromisso?", description: "Movimentações já relacionadas serão preservadas. Esta ação não pode ser desfeita." }
      : { title: "Apagar objetivo?", description: "O histórico de aportes deste objetivo será removido junto. Esta ação não pode ser desfeita." };
  const bulkCount = bulkDeleteTarget && "ids" in bulkDeleteTarget ? bulkDeleteTarget.ids.length : data?.transactions.length ?? 0;
  const bulkCopy = bulkDeleteTarget?.kind === "transaction-period"
    ? { title: month ? `Apagar todas as movimentações de ${periodLabel}?` : `Apagar todas as movimentações de ${year}?`, description: "Esta ação removerá permanentemente as movimentações deste período e recalculará os totais financeiros.", label: "Apagar todas do período" }
    : bulkDeleteTarget?.kind === "goals"
      ? { title: `Apagar ${bulkCount} ${bulkCount === 1 ? "objetivo" : "objetivos"}?`, description: "Os aportes relacionados aos objetivos selecionados também serão removidos permanentemente.", label: `Apagar ${bulkCount} ${bulkCount === 1 ? "objetivo" : "objetivos"}` }
      : bulkDeleteTarget?.kind === "commitments"
        ? { title: `Apagar ${bulkCount} ${bulkCount === 1 ? "compromisso" : "compromissos"}?`, description: "Movimentações já relacionadas serão preservadas. Esta ação não pode ser desfeita.", label: `Apagar ${bulkCount} ${bulkCount === 1 ? "compromisso" : "compromissos"}` }
        : { title: `Apagar ${bulkCount} movimentações?`, description: "Esta ação removerá permanentemente as movimentações selecionadas e recalculará os totais financeiros.", label: `Apagar ${bulkCount} movimentações` };

  const header = <header className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4 lg:grid-cols-[1fr_auto_1fr]"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Visão financeira</p><h1 className="mt-1 text-2xl font-bold tracking-[-0.035em] sm:text-[28px]">Finanças</h1></div><div className="col-span-2 flex min-w-0 items-center justify-center gap-1 lg:col-span-1"><Button size="icon" variant="ghost" aria-label="Período anterior" onClick={() => changePeriod(-1)}><ChevronLeft className="size-4" /></Button><Select value={month ? String(month) : "all"} onValueChange={(value) => { resetPeriodSelections(); setMonth(value === "all" ? undefined : Number(value)); }}><SelectTrigger className="w-[116px] sm:w-[148px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os meses</SelectItem>{months.map((label, index) => <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>)}</SelectContent></Select><Select value={String(year)} onValueChange={(value) => { resetPeriodSelections(); setYear(Number(value)); }}><SelectTrigger className="w-[78px] sm:w-[92px]"><SelectValue /></SelectTrigger><SelectContent>{years.map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent></Select><Button size="icon" variant="ghost" aria-label="Próximo período" onClick={() => changePeriod(1)}><ChevronRight className="size-4" /></Button></div><Button className="col-start-2 row-start-1 justify-self-end lg:col-start-auto lg:row-start-auto" size="sm" onClick={() => openCreate("transaction")}><Plus className="size-4" /><span className="sm:hidden">Nova</span><span className="hidden sm:inline">Nova movimentação</span></Button></header>;

  const transactionIds = data?.transactions.map((item) => item.id) ?? [];
  const commitmentIds = data?.commitments.map((item) => item.id) ?? [];
  const goalIds = data?.goals.map((item) => item.id) ?? [];

  return <DashboardViewport className="w-full max-w-none overflow-hidden" contentClassName="overflow-hidden pb-4" header={header}>
    {workspace.isLoading ? <LoadingState title="Carregando finanças" /> : workspace.isError || !data ? <ErrorState title="Não foi possível carregar Finanças" description="Tente novamente sem perder seus dados." action={<RetryButton onClick={() => workspace.refetch()} />} /> : <div className="flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden rounded-[18px] border border-border bg-panel">
      <section className="grid shrink-0 grid-cols-2 divide-x divide-y divide-border border-b border-border md:grid-cols-4 md:divide-y-0">{[[periodBalanceLabel, data.summary.net, data.summary.net >= 0 ? "text-success" : "text-destructive"], ["Saldo geral", data.summary.balance, ""], ["Entradas", data.summary.income, "text-success"], ["Saídas", -data.summary.expenses, "text-destructive"]].map(([label, value, color]) => <div className="min-w-0 px-4 py-3 md:px-5" key={String(label)}><p className="text-[11px] text-text-tertiary">{label}</p><p className={`mt-1 truncate text-lg font-bold tracking-[-0.03em] ${color}`}>{Number(value) > 0 && label !== "Saldo geral" ? "+ " : Number(value) < 0 ? "- " : ""}{money.format(Math.abs(Number(value)))}</p></div>)}</section>
      <nav className="flex shrink-0 gap-1 border-b border-border px-3 pt-2" aria-label="Áreas de Finanças">{([['transactions', 'Movimentações'], ['commitments', 'Compromissos'], ['goals', 'Objetivos']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setActiveTab(value)} className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === value ? "border-primary text-foreground" : "border-transparent text-text-secondary hover:text-foreground"}`}>{label}</button>)}</nav>
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === "transactions" && <TransactionsTab data={data.transactions} periodLabel={periodLabel} selectionMode={selectionMode.transactions} selected={selected.transactions} onCreateAccount={() => openCreate("account")} onEnterSelection={() => enterSelection("transactions")} onToggle={(id) => toggleSelected("transactions", id)} onSelectAll={() => selectAll("transactions", transactionIds)} onClear={() => clearSelection("transactions")} onCancel={() => clearSelection("transactions", true)} onDeleteSelected={() => setBulkDeleteTarget({ kind: "transactions", ids: [...selected.transactions] })} onDeletePeriod={() => { setDeleteError(null); setBulkDeleteTarget({ kind: "transaction-period" }); }} onEdit={(item) => openEdit("transaction", item)} onDelete={(item) => requestDelete({ kind: "transaction", item })} />}
        {activeTab === "commitments" && <CommitmentsTab data={data.commitments} summary={data.summary.commitments} monthlyView={Boolean(month)} periodLabel={periodLabel} selectionMode={selectionMode.commitments} selected={selected.commitments} pending={payCommitment.isPending} error={payError} onCreate={() => openCreate("commitment")} onEnterSelection={() => enterSelection("commitments")} onToggle={(id) => toggleSelected("commitments", id)} onSelectAll={() => selectAll("commitments", commitmentIds)} onClear={() => clearSelection("commitments")} onCancel={() => clearSelection("commitments", true)} onDeleteSelected={() => setBulkDeleteTarget({ kind: "commitments", ids: [...selected.commitments] })} onPay={pay} onEdit={(item) => openEdit("commitment", item)} onDelete={(item) => requestDelete({ kind: "commitment", item })} />}
        {activeTab === "goals" && <GoalsTab data={data.goals} selectionMode={selectionMode.goals} selected={selected.goals} onCreate={() => openCreate("goal")} onEnterSelection={() => enterSelection("goals")} onToggle={(id) => toggleSelected("goals", id)} onSelectAll={() => selectAll("goals", goalIds)} onClear={() => clearSelection("goals")} onCancel={() => clearSelection("goals", true)} onDeleteSelected={() => setBulkDeleteTarget({ kind: "goals", ids: [...selected.goals] })} onContribute={(id) => { setSelectedGoalId(id); setEditingItem(null); setDialog("contribution"); }} onEdit={(item) => openEdit("goal", item)} onDelete={(item) => requestDelete({ kind: "goal", item })} />}
      </div>
      <FinanceDialog key={`${dialog}-${editingItem?.id ?? selectedGoalId ?? "new"}`} data={data} editingItem={editingItem} mode={dialog} onClose={() => { setDialog(null); setEditingItem(null); setSelectedGoalId(null); }} selectedGoalId={selectedGoalId} />
      <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !deleting) { setDeleteTarget(null); setDeleteError(null); } }} title={deleteCopy.title} description={deleteCopy.description} confirmLabel={deleting ? "Apagando..." : "Apagar"} isPending={deleting} error={deleteError} onConfirm={confirmDelete} />
      <ConfirmDialog open={Boolean(bulkDeleteTarget)} onOpenChange={(open) => { if (!open && !deleting) { setBulkDeleteTarget(null); setDeleteError(null); } }} title={bulkCopy.title} description={bulkCopy.description} confirmLabel={deleting ? "Apagando..." : bulkCopy.label} isPending={deleting} error={deleteError} onConfirm={confirmBulkDelete} />
    </div>}
  </DashboardViewport>;
}

function TransactionsTab({ data, periodLabel, selectionMode, selected, onCreateAccount, onEnterSelection, onToggle, onSelectAll, onClear, onCancel, onDeleteSelected, onDeletePeriod, onEdit, onDelete }: { data: FinancialTransaction[]; periodLabel: string; selectionMode: boolean; selected: Set<string>; onCreateAccount: () => void; onEnterSelection: () => void; onToggle: (id: string) => void; onSelectAll: () => void; onClear: () => void; onCancel: () => void; onDeleteSelected: () => void; onDeletePeriod: () => void; onEdit: (item: FinancialTransaction) => void; onDelete: (item: FinancialTransaction) => void }) {
  return <section className="flex h-full min-h-0 flex-col overflow-hidden"><header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-3 md:px-5"><div className="mr-auto"><h2 className="text-sm font-semibold">Movimentações</h2><p className="text-[11px] text-text-tertiary">{periodLabel}</p></div><Button size="sm" variant="ghost" onClick={onCreateAccount}><Plus className="size-4" />Conta</Button><Button size="sm" variant="outline" onClick={onEnterSelection}>Selecionar</Button><details className="relative"><summary className="grid size-9 cursor-pointer list-none place-items-center rounded-md hover:bg-hover" aria-label="Mais ações"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-border bg-panel p-1 shadow-snow-2"><button type="button" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-hover" onClick={() => { onEnterSelection(); onSelectAll(); }}>Selecionar todos</button><button type="button" disabled={!data.length} className="w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50" onClick={onDeletePeriod}>Apagar todos deste período</button></div></details></header>{selectionMode && <SelectionToolbar labels={["movimentação", "movimentações"]} count={selected.size} allSelected={Boolean(data.length) && selected.size === data.length} onSelectAll={onSelectAll} onClear={onClear} onCancel={onCancel} onDelete={onDeleteSelected} />}<div className="hidden shrink-0 grid-cols-[44px_110px_minmax(180px,1.25fr)_minmax(180px,1fr)_150px_52px] border-b border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary md:grid md:px-5"><span /><span>Data</span><span>Descrição</span><span>Categoria / conta</span><span className="text-right">Valor</span><span /></div><div className="min-h-0 flex-1 overflow-y-auto">{!data.length ? <EmptyState className="m-4" title="Nenhuma movimentação" description={`Não há entradas ou saídas em ${periodLabel}.`} /> : data.map((item) => { const checked = selected.has(item.id); return <article className={`group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[44px_110px_minmax(180px,1.25fr)_minmax(180px,1fr)_150px_52px] md:px-5 ${checked ? "bg-primary/[0.045]" : ""}`} key={item.id}><div className={selectionMode ? "" : "invisible"}><Checkbox checked={checked} onCheckedChange={() => onToggle(item.id)} aria-label={`Selecionar ${item.title}`} /></div><span className="hidden text-sm text-text-secondary md:block">{shortDate.format(new Date(item.date))}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-[11px] text-text-tertiary md:hidden">{shortDate.format(new Date(item.date))} · {item.category?.name ?? "Sem categoria"} · {item.account?.name}</p></div><span className="hidden truncate text-sm text-text-secondary md:block">{item.category?.name ?? "Sem categoria"} · {item.account?.name}</span><span className={`row-start-2 col-start-2 whitespace-nowrap text-sm font-semibold md:row-auto md:col-auto md:text-right ${item.type === "income" ? "text-success" : "text-foreground"}`}>{item.type === "income" ? "+ " : "- "}{money.format(item.amount)}</span><ActionMenu onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></article>; })}</div></section>;
}

function CommitmentsTab({ data, summary, monthlyView, periodLabel, selectionMode, selected, pending, error, onCreate, onEnterSelection, onToggle, onSelectAll, onClear, onCancel, onDeleteSelected, onPay, onEdit, onDelete }: { data: FinancialCommitment[]; summary: FinanceWorkspace["summary"]["commitments"]; monthlyView: boolean; periodLabel: string; selectionMode: boolean; selected: Set<string>; pending: boolean; error: string | null; onCreate: () => void; onEnterSelection: () => void; onToggle: (id: string) => void; onSelectAll: () => void; onClear: () => void; onCancel: () => void; onDeleteSelected: () => void; onPay: (item: FinancialCommitment) => void; onEdit: (item: FinancialCommitment) => void; onDelete: (item: FinancialCommitment) => void }) {
  const cards = [
    [monthlyView ? "Salário mensal" : "Renda do período", money.format(summary.income), "Entradas registradas no período", ""],
    [monthlyView ? "Comprometido no mês" : "Comprometido no período", money.format(summary.committed), "Somente compromissos pendentes", "text-destructive"],
    ["Salário comprometido", summary.percentage === null ? "—" : `${percentage.format(summary.percentage)}%`, summary.percentage === null ? "Cadastre uma entrada para calcular" : "Percentual da renda do período", summary.percentage !== null && summary.percentage > 100 ? "text-destructive" : ""],
    ["Sobra após compromissos", money.format(summary.remaining), "Renda menos compromissos pendentes", summary.remaining < 0 ? "text-destructive" : "text-success"],
    ["Comprometido no futuro", money.format(summary.futureCommitted), "Vencimentos ativos após o período", ""],
  ];
  return <section className="flex h-full min-h-0 flex-col overflow-hidden"><div className="grid shrink-0 grid-cols-2 border-b border-border bg-panel-subtle md:grid-cols-3 xl:grid-cols-5">{cards.map(([label, value, description, color]) => <div className="min-w-0 border-b border-r border-border px-4 py-3 last:border-r-0 xl:border-b-0" key={label}><p className="text-[11px] text-text-tertiary">{label}</p><p className={`mt-1 truncate text-lg font-bold tracking-[-0.03em] ${color}`}>{value}</p><p className="mt-1 truncate text-[10px] text-text-tertiary">{description}</p></div>)}</div><header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 md:px-5"><div className="mr-auto"><h2 className="text-sm font-semibold">Compromissos</h2><p className="text-[11px] text-text-tertiary">Vencimentos em {periodLabel}</p></div><Button size="sm" variant="outline" onClick={onEnterSelection}>Selecionar</Button><Button size="sm" onClick={onCreate}><Plus className="size-4" />Novo</Button></header>{selectionMode && <SelectionToolbar labels={["compromisso", "compromissos"]} count={selected.size} allSelected={Boolean(data.length) && selected.size === data.length} onSelectAll={onSelectAll} onClear={onClear} onCancel={onCancel} onDelete={onDeleteSelected} />}<div className="hidden shrink-0 grid-cols-[44px_120px_minmax(180px,1fr)_minmax(140px,.7fr)_140px_120px_130px] border-b border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary md:grid md:px-5"><span /><span>Vencimento</span><span>Descrição</span><span>Conta</span><span className="text-right">Valor</span><span>Status</span><span className="text-right">Ações</span></div><div className="min-h-0 flex-1 overflow-y-auto">{data.length ? data.map((item) => { const overdue = item.status === "active" && new Date(item.dueDate) < new Date(); const checked = selected.has(item.id); return <article key={item.id} className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-4 py-3 md:grid-cols-[44px_120px_minmax(180px,1fr)_minmax(140px,.7fr)_140px_120px_130px] md:px-5 ${checked ? "bg-primary/[0.045]" : ""}`}><div className={selectionMode ? "" : "invisible"}><Checkbox checked={checked} onCheckedChange={() => onToggle(item.id)} aria-label={`Selecionar ${item.title}`} /></div><span className="hidden text-sm text-text-secondary md:block">{shortDate.format(new Date(item.dueDate))}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-[11px] text-text-tertiary md:hidden">{shortDate.format(new Date(item.dueDate))} · {item.account?.name ?? "Conta não definida"}</p></div><span className="hidden truncate text-sm text-text-secondary md:block">{item.account?.name ?? "Não definida"}</span><span className="col-start-2 text-sm font-semibold md:col-auto md:text-right">{money.format(item.amount)}</span><div className="col-start-2 md:col-auto">{overdue ? <Badge variant="destructive">Atrasado</Badge> : <Badge variant="secondary">{item.status === "active" ? "Pendente" : item.status === "completed" ? "Quitado" : "Cancelado"}</Badge>}</div><div className="row-span-3 row-start-1 col-start-3 flex items-center justify-end gap-1 md:row-auto md:col-auto">{item.status === "active" && <Button className="h-8 px-2" size="sm" variant="outline" disabled={pending} onClick={() => onPay(item)}><Check className="size-3.5" />Quitar</Button>}<ActionMenu onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div></article>; }) : <EmptyState className="m-4" title="Nenhum compromisso" description={`Não há vencimentos em ${periodLabel}.`} />}{error && <p className="p-4 text-sm text-destructive" role="alert">{error}</p>}</div></section>;
}

function GoalsTab({ data, selectionMode, selected, onCreate, onEnterSelection, onToggle, onSelectAll, onClear, onCancel, onDeleteSelected, onContribute, onEdit, onDelete }: { data: FinancialGoal[]; selectionMode: boolean; selected: Set<string>; onCreate: () => void; onEnterSelection: () => void; onToggle: (id: string) => void; onSelectAll: () => void; onClear: () => void; onCancel: () => void; onDeleteSelected: () => void; onContribute: (id: string) => void; onEdit: (item: FinancialGoal) => void; onDelete: (item: FinancialGoal) => void }) {
  return <section className="flex h-full min-h-0 flex-col overflow-hidden"><header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3 md:px-5"><div className="mr-auto"><h2 className="text-sm font-semibold">Objetivos</h2><p className="text-[11px] text-text-tertiary">Progresso dos seus aportes</p></div><Button size="sm" variant="outline" onClick={onEnterSelection}>Selecionar</Button><Button size="sm" onClick={onCreate}><Plus className="size-4" />Novo</Button></header>{selectionMode && <SelectionToolbar labels={["objetivo", "objetivos"]} count={selected.size} allSelected={Boolean(data.length) && selected.size === data.length} onSelectAll={onSelectAll} onClear={onClear} onCancel={onCancel} onDelete={onDeleteSelected} />}<div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">{data.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.map((item) => { const checked = selected.has(item.id); return <article className={`relative rounded-xl border border-border p-4 ${checked ? "bg-primary/[0.045]" : "bg-panel"}`} key={item.id}>{selectionMode && <Checkbox className="absolute left-4 top-4" checked={checked} onCheckedChange={() => onToggle(item.id)} aria-label={`Selecionar ${item.title}`} />}<div className={`flex items-center gap-2 ${selectionMode ? "pl-7" : ""}`}><span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span><span className="text-sm font-semibold">{item.progress}%</span><ActionMenu onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${item.progress}%` }} /></div><p className="mt-3 text-sm text-text-secondary">{money.format(item.currentAmount)} de {money.format(item.targetAmount)}</p><Button className="mt-3 h-8 px-2" size="sm" variant="outline" onClick={() => onContribute(item.id)}><Plus className="size-3.5" />Aportar</Button></article>; })}</div> : <EmptyState title="Nenhum objetivo financeiro" description="Crie um objetivo para acompanhar seus aportes." />}</div></section>;
}
