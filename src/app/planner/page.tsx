"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, ShoppingBag, X } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { BuyPurchaseDialog, PlannerPurchaseDialog, PlannerTaskDialog, PlanPurchaseDialog } from "@/components/planner/PlannerDialogs";
import { TaskRow } from "@/components/productivity/task-row";
import { EmptyState, ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useGoals } from "@/hooks/useGoals";
import {
  useBuyPurchase,
  useCancelPurchase,
  useCreatePlannedPurchase,
  useCreatePlannerTask,
  usePlanner,
  usePlanPurchase,
  useRestorePurchase,
  useUpdatePlannedPurchase,
  useUpdatePlannerTask,
} from "@/hooks/usePlanner";
import type { PlannedPurchase, PlannedPurchaseInput, PlannerTask, PlannerTaskInput } from "@/types/Planner";

const money = new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const priorityLabels = { high: "Alta", low: "Baixa", medium: "Média" } as const;
const TASK_PAGE_SIZE = 5;
const PURCHASE_PAGE_SIZE = 6;
const COMMITMENT_PAGE_SIZE = 8;
const HISTORY_PAGE_SIZE = 6;
type PlannerTab = "commitments" | "purchases" | "tasks";

const plannerTabs = [
  { label: "Tarefas", value: "tasks" },
  { label: "Compras", value: "purchases" },
  { label: "Compromissos", value: "commitments" },
] as const;

function isToday(value?: string | null) {
  if (!value) return false;
  const date = calendarDate(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function calendarDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`);
}

function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  return {
    currentPage,
    items: items.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    totalPages,
  };
}

export default function PlannerPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [activeTab, setActiveTab] = useState<PlannerTab>("tasks");
  const period = useMemo(() => ({ month, year }), [month, year]);
  const workspace = usePlanner(period);
  const goals = useGoals();
  const createTask = useCreatePlannerTask();
  const updateTask = useUpdatePlannerTask();
  const createPurchase = useCreatePlannedPurchase();
  const updatePurchase = useUpdatePlannedPurchase();
  const planPurchase = usePlanPurchase();
  const buyPurchase = useBuyPurchase();
  const cancelPurchase = useCancelPurchase();
  const restorePurchase = useRestorePurchase();
  const [chooserOpen, setChooserOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<PlannedPurchase | null>(null);
  const [planningPurchase, setPlanningPurchase] = useState<PlannedPurchase | null>(null);
  const [buyingPurchase, setBuyingPurchase] = useState<PlannedPurchase | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PlannedPurchase | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<PlannedPurchase | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [todayPage, setTodayPage] = useState(0);
  const [nextPage, setNextPage] = useState(0);
  const [taskHistoryPage, setTaskHistoryPage] = useState(0);
  const [purchasePage, setPurchasePage] = useState(0);
  const [purchaseHistoryPage, setPurchaseHistoryPage] = useState(0);
  const [commitmentPage, setCommitmentPage] = useState(0);

  function resetPagination() {
    setTodayPage(0);
    setNextPage(0);
    setTaskHistoryPage(0);
    setPurchasePage(0);
    setPurchaseHistoryPage(0);
    setCommitmentPage(0);
  }
  function changePeriod(direction: -1 | 1) {
    const next = new Date(year, month - 1 + direction, 1);
    resetPagination();
    setMonth(next.getMonth() + 1);
    setYear(next.getFullYear());
  }
  function openNewTask() { setChooserOpen(false); setEditingTask(null); setTaskDialogOpen(true); }
  function openNewPurchase() { setChooserOpen(false); setEditingPurchase(null); setPurchaseDialogOpen(true); }
  async function saveTask(data: PlannerTaskInput) {
    if (editingTask) await updateTask.mutateAsync({ data, id: editingTask.id });
    else await createTask.mutateAsync(data);
  }
  async function savePurchase(data: PlannedPurchaseInput) {
    if (editingPurchase) await updatePurchase.mutateAsync({ data, id: editingPurchase.id });
    else await createPurchase.mutateAsync(data);
  }
  async function toggleTask(task: PlannerTask) {
    try { setActionError(null); await updateTask.mutateAsync({ id: task.id, data: { status: task.status === "done" ? "pending" : "done" } }); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível atualizar a tarefa."); }
  }
  async function cancelTask(task: PlannerTask) {
    try { setActionError(null); await updateTask.mutateAsync({ id: task.id, data: { status: "cancelled" } }); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível cancelar a tarefa."); }
  }
  async function confirmCancelPurchase() {
    if (!cancelTarget) return;
    try { setActionError(null); await cancelPurchase.mutateAsync(cancelTarget.id); setCancelTarget(null); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível cancelar a compra."); }
  }
  async function confirmRestorePurchase() {
    if (!restoreTarget) return;
    try { setActionError(null); await restorePurchase.mutateAsync(restoreTarget.id); setRestoreTarget(null); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Não foi possível restaurar a compra."); }
  }

  const data = workspace.data;
  const activeTasks = data?.tasks.filter((task) => task.status === "pending" || task.status === "in_progress") ?? [];
  const todayTasks = activeTasks.filter((task) => isToday(task.dueDate));
  const nextTasks = activeTasks.filter((task) => !isToday(task.dueDate));
  const activePurchases = data?.purchases.filter((purchase) => purchase.status === "idea" || purchase.status === "planned") ?? [];
  const finishedTasks = data?.tasks.filter((task) => task.status === "done" || task.status === "cancelled") ?? [];
  const finishedPurchases = data?.purchases.filter((purchase) => purchase.status === "bought" || purchase.status === "cancelled") ?? [];
  const visiblePurchases = paginateItems(activePurchases, purchasePage, PURCHASE_PAGE_SIZE);
  const visibleCommitments = paginateItems(data?.upcomingCommitments ?? [], commitmentPage, COMMITMENT_PAGE_SIZE);
  const header = <MenuPageHeader eyebrow="Planejamento pessoal" title="Planner" action={<Button onClick={() => setChooserOpen(true)}><Plus className="size-4" />Adicionar</Button>} />;

  return <DashboardViewport className="h-full w-full max-w-none overflow-hidden" contentClassName="flex flex-col overflow-hidden pb-4" header={header}>
    <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SegmentedControl aria-label="Áreas do Planner" className="w-full sm:w-auto" options={plannerTabs} value={activeTab} onValueChange={setActiveTab} />
      <div className="flex items-center justify-center gap-0.5 text-text-secondary sm:justify-end">
        <Button className="size-8" size="icon" variant="ghost" aria-label="Mês anterior" onClick={() => changePeriod(-1)}><ChevronLeft className="size-4" /></Button>
        <Select value={String(month)} onValueChange={(value) => { resetPagination(); setMonth(Number(value)); }}><SelectTrigger className="h-8 w-[116px] border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-hover focus:bg-panel"><SelectValue /></SelectTrigger><SelectContent>{months.map((label, index) => <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>)}</SelectContent></Select>
        <Select value={String(year)} onValueChange={(value) => { resetPagination(); setYear(Number(value)); }}><SelectTrigger className="h-8 w-[76px] border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-hover focus:bg-panel"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 7 }, (_, index) => year - 3 + index).map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent></Select>
        <Button className="size-8" size="icon" variant="ghost" aria-label="Próximo mês" onClick={() => changePeriod(1)}><ChevronRight className="size-4" /></Button>
      </div>
    </div>
    {workspace.isLoading ? <LoadingState className="min-h-0 flex-1" title="Carregando Planner" /> : workspace.isError || !data ? <ErrorState className="min-h-0 flex-1" title="Não foi possível carregar o Planner" description="Tente novamente sem perder seus dados." action={<RetryButton onClick={() => workspace.refetch()} />} /> : <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {actionError && <ErrorState title="A ação não foi concluída" description={actionError} />}
      <dl className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-3 border-y border-border/70 px-1 py-3 lg:grid-cols-4">
        <PlannerMetric detail={`${todayTasks.length} para hoje`} label="Tarefas pendentes" value={String(data.summary.pendingTasks)} />
        <PlannerMetric detail={`${data.summary.purchaseIdeas} ${data.summary.purchaseIdeas === 1 ? "ideia" : "ideias"}`} label="Estimativa das ideias" value={money.format(data.summary.purchaseIdeasAmount)} />
        <PlannerMetric detail={`${data.summary.financialCommitments} ${data.summary.financialCommitments === 1 ? "compromisso" : "compromissos"}`} label="Compromissos ativos" value={money.format(data.summary.financialCommitmentsAmount)} />
        <PlannerMetric detail={data.upcomingCommitments[0] ? money.format(data.upcomingCommitments[0].amount) : "Nenhum no período"} label="Próximo vencimento" value={data.upcomingCommitments[0] ? shortDate.format(calendarDate(data.upcomingCommitments[0].dueDate)) : "—"} />
      </dl>

      <div className="min-h-0 flex-1 overflow-hidden" role="tabpanel">
        {activeTab === "tasks" ? <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden pr-0.5">
          <PanelHeading description="Organize primeiro o que pede sua atenção agora." title="Tarefas" />
          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,.65fr)] lg:overflow-hidden">
            <div className="grid min-h-0 gap-4 xl:grid-cols-2">
              <TaskSection page={todayPage} onPageChange={setTodayPage} title="Hoje" description="O que merece atenção agora" tasks={todayTasks} onEdit={(task) => { setEditingTask(task); setTaskDialogOpen(true); }} onToggle={toggleTask} onCancel={cancelTask} />
              <TaskSection page={nextPage} onPageChange={setNextPage} title="Próximas" description={`Tarefas de ${months[month - 1].toLowerCase()} e sem data`} tasks={nextTasks} onEdit={(task) => { setEditingTask(task); setTaskDialogOpen(true); }} onToggle={toggleTask} onCancel={cancelTask} />
            </div>
            <HistorySection
              page={taskHistoryPage}
              onPageChange={setTaskHistoryPage}
              className="min-h-72 lg:min-h-0"
            description="Concluídas e canceladas"
            emptyDescription="Tarefas finalizadas neste período aparecerão aqui."
            items={finishedTasks.map((task) => ({ id: task.id, label: task.title, status: task.status === "done" ? "Concluída" : "Cancelada" }))}
            title="Histórico de tarefas"
            />
          </div>
        </div> : null}

        {activeTab === "purchases" ? <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden pr-0.5">
          <PanelHeading description="Ideias continuam sem impacto financeiro até serem planejadas." title="Compras" />
          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,.65fr)] lg:overflow-hidden">
            <Card className="min-h-80 gap-0 overflow-hidden py-0 lg:min-h-0"><CardHeader className="shrink-0 border-b border-border py-4"><CardTitle className="text-sm">Compras ativas</CardTitle><p className="text-xs text-text-tertiary">Ideias e compras já planejadas</p></CardHeader><CardContent className="min-h-0 flex-1 overflow-y-auto p-3">{activePurchases.length ? <div className="grid gap-3 xl:grid-cols-2">{visiblePurchases.items.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} onEdit={() => { setEditingPurchase(purchase); setPurchaseDialogOpen(true); }} onPlan={() => setPlanningPurchase(purchase)} onBuy={() => setBuyingPurchase(purchase)} onCancel={() => setCancelTarget(purchase)} />)}</div> : <EmptyState title="Nenhuma compra neste período" description="Cadastre uma ideia sem assumir um compromisso financeiro." />}</CardContent><PaginationFooter currentPage={visiblePurchases.currentPage} onPageChange={setPurchasePage} pageSize={PURCHASE_PAGE_SIZE} totalItems={activePurchases.length} totalPages={visiblePurchases.totalPages} /></Card>
            <HistorySection
              page={purchaseHistoryPage}
              onPageChange={setPurchaseHistoryPage}
              className="min-h-72 lg:min-h-0"
              description="Compradas e canceladas"
              emptyDescription="Compras finalizadas neste período aparecerão aqui."
              items={finishedPurchases.map((purchase) => ({ id: purchase.id, label: purchase.title, status: purchase.status === "bought" ? "Comprada" : "Cancelada", onRestore: () => setRestoreTarget(purchase) }))}
              title="Histórico de compras"
            />
          </div>
        </div> : null}

        {activeTab === "commitments" ? <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
          <PanelHeading description="Valores ativos no Finance, incluindo compras planejadas." title="Compromissos" />
          <Card className="min-h-0 flex-1 gap-0 overflow-hidden py-0"><CardHeader className="shrink-0 border-b border-border py-4"><CardTitle className="text-sm">Vencimentos do período</CardTitle><p className="text-xs text-text-tertiary">Em ordem de vencimento</p></CardHeader><CardContent className="min-h-0 flex-1 divide-y divide-border overflow-y-auto p-0">{data.upcomingCommitments.length ? visibleCommitments.items.map((commitment) => <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3" key={commitment.id}><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{commitment.title}</p>{commitment.installmentCount && <Badge variant="secondary">{commitment.installmentNumber}/{commitment.installmentCount}</Badge>}</div><p className="truncate text-xs text-text-tertiary">{shortDate.format(calendarDate(commitment.dueDate))} · {commitment.account?.name ?? "Conta a definir"}{commitment.category ? ` · ${commitment.category.name}` : ""}</p></div><p className="text-sm font-semibold">{money.format(commitment.amount)}</p></div>) : <EmptyState className="m-3" title="Nenhum compromisso neste período" description="Compras em ideia não aparecem aqui até serem planejadas." />}</CardContent><PaginationFooter currentPage={visibleCommitments.currentPage} onPageChange={setCommitmentPage} pageSize={COMMITMENT_PAGE_SIZE} totalItems={data.upcomingCommitments.length} totalPages={visibleCommitments.totalPages} /></Card>
        </div> : null}
      </div>
    </div>}

    <Dialog open={chooserOpen} onOpenChange={setChooserOpen}><DialogContent><DialogHeader><DialogTitle>O que deseja adicionar?</DialogTitle><DialogDescription>Escolha um registro rápido para o Planner.</DialogDescription></DialogHeader><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={openNewTask} className="rounded-xl border border-border p-4 text-left transition-colors hover:bg-hover"><CalendarCheck2 className="mb-3 size-5 text-primary" /><p className="font-semibold">Tarefa</p><p className="mt-1 text-sm text-text-secondary">Algo que precisa ser feito.</p></button><button type="button" onClick={openNewPurchase} className="rounded-xl border border-border p-4 text-left transition-colors hover:bg-hover"><ShoppingBag className="mb-3 size-5 text-primary" /><p className="font-semibold">Compra</p><p className="mt-1 text-sm text-text-secondary">Uma ideia ou compra futura.</p></button></div></DialogContent></Dialog>
    {taskDialogOpen && <PlannerTaskDialog goals={goals.data ?? []} item={editingTask} open onOpenChange={setTaskDialogOpen} pending={createTask.isPending || updateTask.isPending} onSubmit={saveTask} />}
    {purchaseDialogOpen && <PlannerPurchaseDialog goals={goals.data ?? []} item={editingPurchase} open onOpenChange={setPurchaseDialogOpen} pending={createPurchase.isPending || updatePurchase.isPending} onSubmit={savePurchase} />}
    {planningPurchase && <PlanPurchaseDialog accounts={data?.accounts ?? []} categories={data?.categories ?? []} item={planningPurchase} open onOpenChange={(open) => !open && setPlanningPurchase(null)} pending={planPurchase.isPending} onSubmit={async (input) => { await planPurchase.mutateAsync({ id: planningPurchase.id, data: input }); }} />}
    {buyingPurchase && <BuyPurchaseDialog accounts={data?.accounts ?? []} item={buyingPurchase} open onOpenChange={(open) => !open && setBuyingPurchase(null)} pending={buyPurchase.isPending} onSubmit={async (input) => { await buyPurchase.mutateAsync({ id: buyingPurchase.id, data: input }); }} />}
    <ConfirmDialog open={Boolean(cancelTarget)} onOpenChange={(open) => !open && setCancelTarget(null)} title="Cancelar compra?" description={cancelTarget?.status === "planned" ? "O compromisso financeiro associado também será cancelado." : "A ideia sairá da lista ativa e permanecerá no histórico."} confirmLabel="Cancelar compra" isPending={cancelPurchase.isPending} error={actionError} onConfirm={confirmCancelPurchase} />
    <ConfirmDialog open={Boolean(restoreTarget)} onOpenChange={(open) => !open && !restorePurchase.isPending && setRestoreTarget(null)} title={restoreTarget?.status === "bought" ? "Desfazer compra?" : "Restaurar compra?"} description={restoreTarget?.status === "bought" ? "As movimentações geradas serão removidas, o saldo será recalculado e a compra voltará a planejada." : restoreTarget?.financialCommitments.length ? "A compra e seus compromissos financeiros voltarão a ficar ativos." : "A compra voltará para a lista de ideias."} confirmLabel={restorePurchase.isPending ? "Restaurando..." : restoreTarget?.status === "bought" ? "Desfazer compra" : "Restaurar compra"} isPending={restorePurchase.isPending} error={actionError} onConfirm={confirmRestorePurchase} />
  </DashboardViewport>;
}

function PlannerMetric({ detail, label, value }: { detail: string; label: string; value: string }) {
  return <div className="min-w-0"><dt className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">{label}</dt><dd className="mt-0.5 flex min-w-0 items-baseline gap-2"><span className="truncate text-sm font-semibold text-foreground">{value}</span><span className="truncate text-[11px] text-text-tertiary">{detail}</span></dd></div>;
}

function PanelHeading({ description, title }: { description: string; title: string }) {
  return <div className="shrink-0 px-1"><h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2><p className="mt-0.5 text-xs text-text-tertiary">{description}</p></div>;
}

function PaginationFooter({ currentPage, onPageChange, pageSize, totalItems, totalPages }: { currentPage: number; onPageChange: (page: number) => void; pageSize: number; totalItems: number; totalPages: number }) {
  if (totalItems <= pageSize) return null;
  const firstItem = currentPage * pageSize + 1;
  const lastItem = Math.min((currentPage + 1) * pageSize, totalItems);
  return <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/70 px-3 py-2"><span className="text-[11px] text-text-tertiary">{firstItem}–{lastItem} de {totalItems}</span><div className="flex items-center gap-1"><Button aria-label="Página anterior" className="size-7" disabled={currentPage === 0} onClick={() => onPageChange(Math.max(0, currentPage - 1))} size="icon" type="button" variant="ghost"><ChevronLeft className="size-3.5" /></Button><span className="min-w-10 text-center text-[11px] font-medium">{currentPage + 1}/{totalPages}</span><Button aria-label="Próxima página" className="size-7" disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))} size="icon" type="button" variant="ghost"><ChevronRight className="size-3.5" /></Button></div></div>;
}

function HistorySection({ className, description, emptyDescription, items, onPageChange, page, title }: { className?: string; description: string; emptyDescription: string; items: Array<{ id: string; label: string; onRestore?: () => void; status: string }>; onPageChange: (page: number) => void; page: number; title: string }) {
  const visibleItems = paginateItems(items, page, HISTORY_PAGE_SIZE);
  return <Card className={`gap-0 overflow-hidden py-0 ${className ?? ""}`}><CardHeader className="shrink-0 border-b border-border py-4"><CardTitle className="text-sm">{title}</CardTitle><p className="text-xs text-text-tertiary">{description}</p></CardHeader><CardContent className="min-h-0 flex-1 overflow-y-auto p-3">{items.length ? <div className="grid gap-2">{visibleItems.items.map((item) => <div className="flex min-w-0 items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2" key={item.id}><span className="min-w-0 flex-1 truncate text-sm">{item.label}</span><Badge variant="secondary">{item.status}</Badge>{item.onRestore && <Button size="icon" variant="ghost" aria-label={`Restaurar ${item.label}`} onClick={item.onRestore}><RotateCcw className="size-3.5" /></Button>}</div>)}</div> : <p className="text-sm text-text-tertiary">{emptyDescription}</p>}</CardContent><PaginationFooter currentPage={visibleItems.currentPage} onPageChange={onPageChange} pageSize={HISTORY_PAGE_SIZE} totalItems={items.length} totalPages={visibleItems.totalPages} /></Card>;
}

function TaskSection({ description, onCancel, onEdit, onPageChange, onToggle, page, tasks, title }: { description: string; onCancel: (task: PlannerTask) => void; onEdit: (task: PlannerTask) => void; onPageChange: (page: number) => void; onToggle: (task: PlannerTask) => void; page: number; tasks: PlannerTask[]; title: string }) {
  const visibleTasks = paginateItems(tasks, page, TASK_PAGE_SIZE);
  return <Card className="min-h-72 gap-0 overflow-hidden py-0 lg:min-h-0"><CardHeader className="shrink-0 border-b border-border py-4"><CardTitle className="text-sm">{title}</CardTitle><p className="text-xs text-text-tertiary">{description}</p></CardHeader><CardContent className="min-h-0 flex-1 overflow-y-auto p-2">{tasks.length ? visibleTasks.items.map((task) => <TaskRow key={task.id} title={task.title} completed={task.status === "done"} onToggle={() => onToggle(task)} meta={<span>{task.dueDate ? shortDate.format(calendarDate(task.dueDate)) : "Sem data"} · {priorityLabels[task.priority]}{task.goal ? ` · ${task.goal.title}` : ""}</span>} actions={<><Button size="icon" variant="ghost" aria-label={`Editar ${task.title}`} onClick={() => onEdit(task)}><Pencil className="size-3.5" /></Button><Button size="icon" variant="ghost" aria-label={`Cancelar ${task.title}`} onClick={() => onCancel(task)}><X className="size-3.5" /></Button></>} />) : <EmptyState className="m-1" title={`Nada para ${title.toLowerCase()}`} description="Use Adicionar para registrar uma tarefa." />}</CardContent><PaginationFooter currentPage={visibleTasks.currentPage} onPageChange={onPageChange} pageSize={TASK_PAGE_SIZE} totalItems={tasks.length} totalPages={visibleTasks.totalPages} /></Card>;
}

function PurchaseRow({ onBuy, onCancel, onEdit, onPlan, purchase }: { onBuy: () => void; onCancel: () => void; onEdit: () => void; onPlan: () => void; purchase: PlannedPurchase }) {
  return <article className="rounded-xl border border-border p-3"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold">{purchase.title}</p><Badge variant={purchase.status === "planned" ? "default" : "secondary"}>{purchase.status === "planned" ? "Planejada" : "Ideia"}</Badge>{purchase.financialCommitments.length > 1 && <Badge variant="secondary">{purchase.financialCommitments.length} parcelas</Badge>}</div><p className="mt-1 text-xs text-text-tertiary">{purchase.estimatedAmount ? money.format(purchase.estimatedAmount) : "Valor a definir"}{purchase.plannedDate ? ` · ${shortDate.format(calendarDate(purchase.plannedDate))}` : ""} · {purchase.necessity === "need" ? "Preciso" : "Quero"}</p>{purchase.goal && <p className="mt-1 truncate text-xs text-text-secondary">Meta: {purchase.goal.title}</p>}</div><Button size="icon" variant="ghost" aria-label={`Editar ${purchase.title}`} onClick={onEdit}><Pencil className="size-3.5" /></Button></div><div className="mt-3 flex flex-wrap justify-end gap-2">{purchase.status === "idea" ? <Button size="sm" variant="outline" onClick={onPlan}>Planejar</Button> : <Button size="sm" onClick={onBuy}>Comprar</Button>}<Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button></div></article>;
}
