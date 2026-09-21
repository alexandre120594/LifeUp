"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarClock, Landmark, Plus, Target } from "lucide-react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { StatCard } from "@/components/productivity";
import { EmptyState, ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateFinancialAccount,
  useCreateFinancialCommitment,
  useCreateFinancialContribution,
  useCreateFinancialGoal,
  useCreateFinancialTransaction,
  useFinanceWorkspace,
  usePayFinancialCommitment,
} from "@/hooks/useFinanceWorkspace";
import type { FinanceRecordType, FinanceWorkspace } from "@/types/Finance";

type DialogMode = "account" | "commitment" | "contribution" | "goal" | "transaction" | null;

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const today = () => new Date().toISOString().slice(0, 10);

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}

function FinanceDialog({ data, mode, onClose, selectedGoalId }: {
  data: FinanceWorkspace;
  mode: DialogMode;
  onClose: () => void;
  selectedGoalId: string | null;
}) {
  const createAccount = useCreateFinancialAccount();
  const createTransaction = useCreateFinancialTransaction();
  const createCommitment = useCreateFinancialCommitment();
  const createGoal = useCreateFinancialGoal();
  const contribute = useCreateFinancialContribution();
  const [type, setType] = useState<FinanceRecordType>("expense");
  const [details, setDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeAccounts = data.accounts.filter((account) => account.isActive);
  const compatibleCategories = data.categories.filter((category) => category.type === type);

  function close() {
    setError(null);
    setDetails(false);
    setType("expense");
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    try {
      setError(null);
      if (mode === "account") {
        await createAccount.mutateAsync({ name: value("name"), openingBalance: Number(value("openingBalance") || 0) });
      } else if (mode === "transaction") {
        await createTransaction.mutateAsync({
          accountId: value("accountId"), amount: Number(value("amount")), categoryId: value("categoryId") || null,
          date: value("date"), notes: value("notes"), title: value("title"), type,
        });
      } else if (mode === "commitment") {
        await createCommitment.mutateAsync({
          accountId: value("accountId") || null, amount: Number(value("amount")), categoryId: value("categoryId") || null,
          dueDate: value("dueDate"), notes: value("notes"), recurrence: value("recurrence") === "monthly" ? "monthly" : "none",
          title: value("title"), type,
        });
      } else if (mode === "goal") {
        await createGoal.mutateAsync({ title: value("title"), targetAmount: Number(value("targetAmount")), targetDate: value("targetDate") || null });
      } else if (mode === "contribution" && selectedGoalId) {
        await contribute.mutateAsync({ data: { amount: Number(value("amount")), date: value("date"), notes: value("notes") }, goalId: selectedGoalId });
      }
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel salvar.");
    }
  }

  const titles: Record<Exclude<DialogMode, null>, [string, string]> = {
    account: ["Nova conta", "Informe o saldo existente antes das movimentacoes."],
    commitment: ["Novo compromisso", "Registre o que precisa pagar ou receber."],
    contribution: ["Adicionar aporte", "O progresso sera recalculado pelo historico de aportes."],
    goal: ["Novo objetivo", "Defina o valor-alvo; o prazo e opcional."],
    transaction: ["Nova movimentacao", "Registre uma entrada ou saida realizada."],
  };
  if (!mode) return null;
  const pending = createAccount.isPending || createTransaction.isPending || createCommitment.isPending || createGoal.isPending || contribute.isPending;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <form className="grid gap-4" onSubmit={submit}>
          <DialogHeader><DialogTitle>{titles[mode][0]}</DialogTitle><DialogDescription>{titles[mode][1]}</DialogDescription></DialogHeader>
          {(mode === "transaction" || mode === "commitment") && (
            <Field label="Tipo"><Select value={type} onValueChange={(value) => setType(value as FinanceRecordType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Saida</SelectItem><SelectItem value="income">Entrada</SelectItem></SelectContent></Select></Field>
          )}
          {mode === "account" && <><Field label="Nome"><Input name="name" required /></Field><Field label="Saldo inicial"><Input min="-999999999" name="openingBalance" step="0.01" type="number" defaultValue="0" /></Field></>}
          {(mode === "transaction" || mode === "commitment") && <><Field label="Descricao"><Input name="title" required /></Field><Field label="Valor"><Input min="0.01" name="amount" step="0.01" type="number" required /></Field></>}
          {mode === "transaction" && <><Field label="Conta"><Select name="accountId" defaultValue={activeAccounts[0]?.id} required><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{activeAccounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></Field><Field label="Data"><Input defaultValue={today()} name="date" type="date" required /></Field></>}
          {mode === "commitment" && <><Field label="Vencimento"><Input defaultValue={today()} name="dueDate" type="date" required /></Field><Field label="Recorrencia"><Select name="recurrence" defaultValue="none"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Unico</SelectItem><SelectItem value="monthly">Mensal</SelectItem></SelectContent></Select></Field></>}
          {mode === "goal" && <><Field label="Titulo"><Input name="title" required /></Field><Field label="Valor-alvo"><Input min="0.01" name="targetAmount" step="0.01" type="number" required /></Field><Field label="Prazo opcional"><Input name="targetDate" type="date" /></Field></>}
          {mode === "contribution" && <><Field label="Valor"><Input min="0.01" name="amount" step="0.01" type="number" required /></Field><Field label="Data"><Input defaultValue={today()} name="date" type="date" required /></Field><Field label="Observacao opcional"><Textarea name="notes" /></Field></>}
          {(mode === "transaction" || mode === "commitment") && <>
            <Button className="justify-self-start" type="button" variant="ghost" size="sm" onClick={() => setDetails((value) => !value)}>{details ? "Ocultar detalhes" : "Mais detalhes"}</Button>
            {details && <div className="grid gap-4 rounded-lg border border-border p-3"><Field label="Categoria opcional"><Select name="categoryId"><SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger><SelectContent>{compatibleCategories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></Field>{mode === "commitment" && <Field label="Conta prevista"><Select name="accountId"><SelectTrigger><SelectValue placeholder="Definir ao quitar" /></SelectTrigger><SelectContent>{activeAccounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></Field>}<Field label="Observacao"><Textarea name="notes" /></Field></div>}
          </>}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={close}>Cancelar</Button><Button disabled={pending} type="submit">{pending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FinancePage() {
  const workspace = useFinanceWorkspace();
  const payCommitment = usePayFinancialCommitment();
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const data = workspace.data;
  const activeCommitments = useMemo(() => data?.commitments.filter((item) => item.status === "active").slice(0, 5) ?? [], [data]);

  return (
    <DashboardViewport contentClassName="overflow-hidden pb-5" header={<MenuPageHeader eyebrow="Visao financeira" title="Financas" action={<Button size="sm" onClick={() => setDialog("transaction")}><Plus className="size-4" />Nova movimentacao</Button>} />}>
      {workspace.isLoading ? <LoadingState title="Carregando financas" /> : workspace.isError || !data ? <ErrorState title="Nao foi possivel carregar Financas" description="Tente novamente sem perder seus dados." action={<RetryButton onClick={() => workspace.refetch()} />} /> : <div className="flex h-full min-h-0 flex-col gap-3">
        <section className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Landmark} label="Saldo atual" value={money.format(data.summary.balance)} />
          <StatCard icon={ArrowUpRight} label="Entradas no mes" value={money.format(data.summary.income)} />
          <StatCard icon={ArrowDownRight} label="Saidas no mes" value={money.format(data.summary.expenses)} />
          <StatCard icon={CalendarClock} label="Resultado no mes" value={money.format(data.summary.net)} />
        </section>
        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="flex min-h-0 flex-col overflow-hidden"><CardHeader className="flex-row items-center justify-between p-4"><CardTitle className="text-base">Movimentacoes recentes</CardTitle><Button size="sm" variant="ghost" onClick={() => setDialog("account")}>Nova conta</Button></CardHeader><CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
            {data.transactions.length === 0 ? <EmptyState className="m-4" title="Nenhuma movimentacao" description="Use Nova movimentacao para registrar a primeira entrada ou saida." /> : <div className="divide-y divide-border">{data.transactions.map((item) => <div className="flex items-center gap-3 px-4 py-3" key={item.id}><span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{item.type === "income" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="truncate text-xs text-text-secondary">{item.account?.name} · {shortDate.format(new Date(item.date))}{item.category ? ` · ${item.category.name}` : ""}</p></div><span className="whitespace-nowrap text-sm font-semibold">{item.type === "expense" ? "-" : "+"}{money.format(item.amount)}</span></div>)}</div>}
          </CardContent></Card>
          <div className="min-h-0 space-y-3 overflow-y-auto">
            <Card><CardHeader className="flex-row items-center justify-between p-4 pb-2"><CardTitle className="text-base">Compromissos</CardTitle><Button size="sm" variant="ghost" onClick={() => setDialog("commitment")}>Novo</Button></CardHeader><CardContent className="grid gap-2 p-4 pt-2">{activeCommitments.length === 0 ? <p className="text-sm text-text-secondary">Nenhum compromisso pendente.</p> : activeCommitments.map((item) => { const overdue = new Date(item.dueDate) < new Date(); return <div className="rounded-lg border border-border p-3" key={item.id}><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-text-secondary">{shortDate.format(new Date(item.dueDate))} · {money.format(item.amount)}</p></div>{overdue && <Badge variant="destructive">Atrasado</Badge>}</div><Button className="mt-2 w-full" size="sm" variant="outline" disabled={payCommitment.isPending} onClick={() => payCommitment.mutate({ id: item.id, accountId: item.accountId ?? data.accounts.find((account) => account.isActive)?.id ?? "" })}>Quitar</Button></div>; })}</CardContent></Card>
            <Card><CardHeader className="flex-row items-center justify-between p-4 pb-2"><CardTitle className="text-base">Objetivos</CardTitle><Button size="sm" variant="ghost" onClick={() => setDialog("goal")}>Novo</Button></CardHeader><CardContent className="grid gap-3 p-4 pt-2">{data.goals.length === 0 ? <p className="text-sm text-text-secondary">Nenhum objetivo financeiro.</p> : data.goals.slice(0, 4).map((goal) => <div key={goal.id}><div className="flex justify-between gap-2 text-sm"><span className="font-medium">{goal.title}</span><span>{goal.progress}%</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${goal.progress}%` }} /></div><div className="mt-1 flex items-center justify-between text-xs text-text-secondary"><span>{money.format(goal.currentAmount)} de {money.format(goal.targetAmount)}</span><Button className="h-auto px-1 py-0" variant="ghost" onClick={() => { setSelectedGoalId(goal.id); setDialog("contribution"); }}>Aportar</Button></div></div>)}</CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><Target className="size-5 text-text-secondary" /><div className="text-sm"><p className="font-medium">{data.accounts.length} conta{data.accounts.length === 1 ? "" : "s"}</p><p className="text-text-secondary">Saldo derivado somente das movimentacoes.</p></div></CardContent></Card>
          </div>
        </div>
        <FinanceDialog data={data} mode={dialog} onClose={() => { setDialog(null); setSelectedGoalId(null); }} selectedGoalId={selectedGoalId} />
      </div>}
    </DashboardViewport>
  );
}
