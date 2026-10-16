"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { splitAmountIntoInstallments } from "@/lib/finance-core";
import type { FinancialAccount, FinancialCategory } from "@/types/Finance";
import type { Goal } from "@/types/Goal";
import type { PlannedPurchase, PlannedPurchaseInput, PlannerTask, PlannerTaskInput } from "@/types/Planner";

const fieldClass = "grid gap-1.5 text-sm font-medium";

function dateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function PlannerTaskDialog({ goals, item, onOpenChange, onSubmit, open, pending }: {
  goals: Goal[];
  item: PlannerTask | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlannerTaskInput) => Promise<void>;
  open: boolean;
  pending: boolean;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [dueDate, setDueDate] = useState(dateInputValue(item?.dueDate));
  const [priority, setPriority] = useState<PlannerTaskInput["priority"]>(item?.priority ?? "medium");
  const [goalId, setGoalId] = useState(item?.goalId ?? "none");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return setError("Informe o título da tarefa.");
    try {
      setError(null);
      await onSubmit({ title: title.trim(), description: description.trim() || null, dueDate: dueDate || null, priority, goalId: goalId === "none" ? null : goalId });
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar a tarefa.");
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form className="grid gap-4" onSubmit={submit}><DialogHeader><DialogTitle>{item ? "Editar tarefa" : "Nova tarefa"}</DialogTitle><DialogDescription>Registre o próximo passo sem criar uma estrutura de projeto.</DialogDescription></DialogHeader><label className={fieldClass}>Título<Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} /></label><label className={fieldClass}>Descrição<Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label><div className="grid gap-3 sm:grid-cols-2"><label className={fieldClass}>Data<Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label className={fieldClass}>Prioridade<Select value={priority} onValueChange={(value) => setPriority(value as PlannerTaskInput["priority"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></label></div><label className={fieldClass}>Meta opcional<Select value={goalId} onValueChange={setGoalId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem meta</SelectItem>{goals.filter((goal) => goal.status !== "COMPLETED").map((goal) => <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>)}</SelectContent></Select></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar tarefa"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function PlannerPurchaseDialog({ goals, item, onOpenChange, onSubmit, open, pending }: {
  goals: Goal[];
  item: PlannedPurchase | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlannedPurchaseInput) => Promise<void>;
  open: boolean;
  pending: boolean;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [amount, setAmount] = useState(item?.estimatedAmount ? String(item.estimatedAmount) : "");
  const [plannedDate, setPlannedDate] = useState(dateInputValue(item?.plannedDate));
  const [priority, setPriority] = useState<PlannedPurchaseInput["priority"]>(item?.priority ?? "medium");
  const [necessity, setNecessity] = useState<PlannedPurchaseInput["necessity"]>(item?.necessity ?? "want");
  const [goalId, setGoalId] = useState(item?.goalId ?? "none");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const estimatedAmount = amount ? Number(amount.replace(",", ".")) : null;
    if (!title.trim()) return setError("Informe o título da compra.");
    if (estimatedAmount !== null && (!Number.isFinite(estimatedAmount) || estimatedAmount <= 0)) return setError("O valor estimado deve ser maior que zero.");
    try {
      setError(null);
      await onSubmit({ title: title.trim(), description: description.trim() || null, estimatedAmount, plannedDate: plannedDate || null, priority, necessity, goalId: goalId === "none" ? null : goalId });
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar a compra.");
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form className="grid gap-4" onSubmit={submit}><DialogHeader><DialogTitle>{item ? "Editar compra" : "Nova compra"}</DialogTitle><DialogDescription>Uma ideia não afeta Finanças até você escolher planejar.</DialogDescription></DialogHeader><label className={fieldClass}>Título<Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} /></label><div className="grid gap-3 sm:grid-cols-2"><label className={fieldClass}>Valor estimado<Input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" /></label><label className={fieldClass}>Data desejada<Input type="date" value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)} /></label></div><div className="grid gap-3 sm:grid-cols-2"><label className={fieldClass}>Prioridade<Select value={priority} onValueChange={(value) => setPriority(value as PlannedPurchaseInput["priority"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></label><label className={fieldClass}>Necessidade<Select value={necessity} onValueChange={(value) => setNecessity(value as PlannedPurchaseInput["necessity"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="need">Preciso</SelectItem><SelectItem value="want">Quero</SelectItem></SelectContent></Select></label></div><label className={fieldClass}>Meta opcional<Select value={goalId} onValueChange={setGoalId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem meta</SelectItem>{goals.filter((goal) => goal.status !== "COMPLETED").map((goal) => <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>)}</SelectContent></Select></label><label className={fieldClass}>Descrição<Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar compra"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function PlanPurchaseDialog({ accounts, categories, item, onOpenChange, onSubmit, open, pending }: {
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  item: PlannedPurchase | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { accountId?: string; categoryId?: string; estimatedAmount: number; installmentCount?: number; plannedDate: string }) => Promise<void>;
  open: boolean;
  pending: boolean;
}) {
  const [amount, setAmount] = useState(item?.estimatedAmount ? String(item.estimatedAmount) : "");
  const [plannedDate, setPlannedDate] = useState(dateInputValue(item?.plannedDate));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "none");
  const [categoryId, setCategoryId] = useState("none");
  const [installmentPurchase, setInstallmentPurchase] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const installmentAmounts = splitAmountIntoInstallments(Number(amount.replace(",", ".")) || 0, installmentCount);
  async function submit(event: FormEvent) { event.preventDefault(); const value = Number(amount.replace(",", ".")); if (!Number.isFinite(value) || value <= 0 || !plannedDate) return setError("Informe valor e data para assumir o compromisso."); try { setError(null); await onSubmit({ accountId: accountId === "none" ? undefined : accountId, categoryId: categoryId === "none" ? undefined : categoryId, estimatedAmount: value, installmentCount: installmentPurchase ? installmentCount : 1, plannedDate }); onOpenChange(false); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível planejar a compra."); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form className="grid gap-4" onSubmit={submit}><DialogHeader><DialogTitle>Planejar compra</DialogTitle><DialogDescription>Isso criará compromisso(s) em Finanças. O valor não será duplicado no Planner.</DialogDescription></DialogHeader><div className="grid gap-3 sm:grid-cols-2"><label className={fieldClass}>Valor total<Input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className={fieldClass}>Primeiro vencimento<Input type="date" value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)} /></label></div><div className="grid gap-3 rounded-lg border border-border bg-panel-subtle p-3 sm:grid-cols-2"><label className={fieldClass}>Forma do compromisso<Select value={installmentPurchase ? "installments" : "upfront"} onValueChange={(value) => setInstallmentPurchase(value === "installments")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upfront">À vista</SelectItem><SelectItem value="installments">Parcelado</SelectItem></SelectContent></Select></label>{installmentPurchase && <label className={fieldClass}>Quantidade de parcelas<Input min="2" max="60" step="1" type="number" value={installmentCount} onChange={(event) => setInstallmentCount(Math.min(60, Math.max(2, Number(event.target.value) || 2)))} /></label>}{installmentPurchase && installmentAmounts.length > 0 && <p className="text-xs text-text-secondary sm:col-span-2">Serão criados {installmentCount} compromissos mensais de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(installmentAmounts[installmentAmounts.length - 1])}{installmentAmounts[0] !== installmentAmounts[installmentAmounts.length - 1] ? ` a ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(installmentAmounts[0])}` : ""}.</p>}</div><label className={fieldClass}>Conta<Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Definir ao comprar</SelectItem>{accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></label><label className={fieldClass}>Categoria<Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem categoria</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Voltar</Button><Button type="submit" disabled={pending}>{pending ? "Planejando..." : "Criar compromisso"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function BuyPurchaseDialog({ accounts, item, onOpenChange, onSubmit, open, pending }: {
  accounts: FinancialAccount[];
  item: PlannedPurchase | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { accountId: string; date: string }) => Promise<void>;
  open: boolean;
  pending: boolean;
}) {
  const [accountId, setAccountId] = useState(item?.financialCommitments[0]?.accountId ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) { event.preventDefault(); if (!accountId || !date) return setError("Selecione a conta e a data da compra."); try { setError(null); await onSubmit({ accountId, date }); onOpenChange(false); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível concluir a compra."); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form className="grid gap-4" onSubmit={submit}><DialogHeader><DialogTitle>Registrar compra</DialogTitle><DialogDescription>O compromisso será quitado e gerará uma movimentação em Finanças.</DialogDescription></DialogHeader><label className={fieldClass}>Conta<Select value={accountId} onValueChange={setAccountId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{accounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></label><label className={fieldClass}>Data<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Voltar</Button><Button type="submit" disabled={pending}>{pending ? "Registrando..." : "Confirmar compra"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
