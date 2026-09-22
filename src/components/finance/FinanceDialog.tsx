"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateFinancialAccount, useCreateFinancialCommitment, useCreateFinancialContribution,
  useCreateFinancialGoal, useCreateFinancialTransaction, useUpdateFinancialCommitment,
  useUpdateFinancialGoal, useUpdateFinancialTransaction,
} from "@/hooks/useFinanceWorkspace";
import type { FinanceRecordType, FinanceWorkspace, FinancialCommitment, FinancialGoal, FinancialTransaction } from "@/types/Finance";

export type FinanceDialogMode = "account" | "commitment" | "contribution" | "goal" | "transaction" | null;
export type FinanceEditingItem = FinancialCommitment | FinancialGoal | FinancialTransaction | null;

const today = () => new Date().toISOString().slice(0, 10);
const dateInput = (value: string) => new Date(value).toISOString().slice(0, 10);

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}

export function FinanceDialog({ data, editingItem, mode, onClose, selectedGoalId }: {
  data: FinanceWorkspace; editingItem: FinanceEditingItem; mode: FinanceDialogMode; onClose: () => void; selectedGoalId: string | null;
}) {
  const createAccount = useCreateFinancialAccount();
  const createTransaction = useCreateFinancialTransaction();
  const createCommitment = useCreateFinancialCommitment();
  const createGoal = useCreateFinancialGoal();
  const contribute = useCreateFinancialContribution();
  const updateTransaction = useUpdateFinancialTransaction();
  const updateCommitment = useUpdateFinancialCommitment();
  const updateGoal = useUpdateFinancialGoal();
  const transaction = mode === "transaction" && editingItem ? editingItem as FinancialTransaction : null;
  const commitment = mode === "commitment" && editingItem ? editingItem as FinancialCommitment : null;
  const goal = mode === "goal" && editingItem ? editingItem as FinancialGoal : null;
  const [type, setType] = useState<FinanceRecordType>(transaction?.type ?? commitment?.type ?? "expense");
  const [details, setDetails] = useState(Boolean(editingItem));
  const [error, setError] = useState<string | null>(null);
  const activeAccounts = data.accounts.filter((account) => account.isActive);
  const compatibleCategories = data.categories.filter((category) => category.type === type);
  const mutations = [createAccount, createTransaction, createCommitment, createGoal, contribute, updateTransaction, updateCommitment, updateGoal];
  const pending = mutations.some((item) => item.isPending);

  function close() { if (!pending) onClose(); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const optionalId = (name: string) => { const result = value(name); return !result || result === "none" ? null : result; };
    try {
      setError(null);
      if (mode === "account") {
        await createAccount.mutateAsync({ name: value("name"), openingBalance: Number(value("openingBalance") || 0) });
      } else if (mode === "transaction") {
        const payload = { accountId: value("accountId"), amount: Number(value("amount")), categoryId: optionalId("categoryId"), date: value("date"), notes: value("notes"), title: value("title"), type };
        if (transaction) await updateTransaction.mutateAsync({ data: payload, id: transaction.id }); else await createTransaction.mutateAsync(payload);
      } else if (mode === "commitment") {
        const payload = { accountId: optionalId("accountId"), amount: Number(value("amount")), categoryId: optionalId("categoryId"), dueDate: value("dueDate"), notes: value("notes"), recurrence: value("recurrence") === "monthly" ? "monthly" as const : "none" as const, title: value("title"), type };
        if (commitment) await updateCommitment.mutateAsync({ data: payload, id: commitment.id }); else await createCommitment.mutateAsync(payload);
      } else if (mode === "goal") {
        const payload = { status: (value("status") || goal?.status || "active") as FinancialGoal["status"], targetAmount: Number(value("targetAmount")), targetDate: value("targetDate") || null, title: value("title") };
        if (goal) await updateGoal.mutateAsync({ data: payload, id: goal.id }); else await createGoal.mutateAsync(payload);
      } else if (mode === "contribution" && selectedGoalId) {
        await contribute.mutateAsync({ data: { amount: Number(value("amount")), date: value("date"), notes: value("notes") }, goalId: selectedGoalId });
      }
      onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
  }

  if (!mode) return null;
  const editing = Boolean(editingItem);
  const titles = {
    account: ["Nova conta", "Informe o saldo existente antes das movimentações."],
    commitment: [editing ? "Editar compromisso" : "Novo compromisso", "Registre o que precisa pagar ou receber."],
    contribution: ["Adicionar aporte", "O progresso será recalculado pelo histórico de aportes."],
    goal: [editing ? "Editar objetivo" : "Novo objetivo", "Defina o valor-alvo; o prazo é opcional."],
    transaction: [editing ? "Editar movimentação" : "Nova movimentação", "Registre uma entrada ou saída realizada."],
  } satisfies Record<Exclude<FinanceDialogMode, null>, [string, string]>;

  return <Dialog open onOpenChange={(open) => !open && close()}><DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"><form className="grid gap-4" onSubmit={submit}>
    <DialogHeader><DialogTitle>{titles[mode][0]}</DialogTitle><DialogDescription>{titles[mode][1]}</DialogDescription></DialogHeader>
    {(mode === "transaction" || mode === "commitment") && <div className="grid grid-cols-2 rounded-lg bg-secondary p-1" aria-label="Tipo da movimentação"><button className={`rounded-md px-3 py-2 text-sm font-medium ${type === "expense" ? "bg-panel shadow-sm" : "text-text-secondary"}`} onClick={() => setType("expense")} type="button">Saída</button><button className={`rounded-md px-3 py-2 text-sm font-medium ${type === "income" ? "bg-panel shadow-sm" : "text-text-secondary"}`} onClick={() => setType("income")} type="button">Entrada</button></div>}
    {mode === "account" && <><Field label="Nome"><Input name="name" required autoFocus /></Field><Field label="Saldo inicial"><Input min="-999999999" name="openingBalance" step="0.01" type="number" defaultValue="0" /></Field></>}
    {(mode === "transaction" || mode === "commitment") && <><Field label="Descrição"><Input name="title" required autoFocus defaultValue={transaction?.title ?? commitment?.title} /></Field><Field label="Valor"><Input min="0.01" name="amount" step="0.01" type="number" required defaultValue={transaction?.amount ?? commitment?.amount} /></Field></>}
    {mode === "transaction" && <><Field label="Conta"><Select name="accountId" defaultValue={transaction?.accountId ?? activeAccounts[0]?.id} required><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{activeAccounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></Field><Field label="Data"><Input defaultValue={transaction ? dateInput(transaction.date) : today()} name="date" type="date" required /></Field></>}
    {mode === "commitment" && <><Field label="Vencimento"><Input defaultValue={commitment ? dateInput(commitment.dueDate) : today()} name="dueDate" type="date" required /></Field><Field label="Recorrência"><Select name="recurrence" defaultValue={commitment?.recurrence ?? "none"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Único</SelectItem><SelectItem value="monthly">Mensal</SelectItem></SelectContent></Select></Field></>}
    {mode === "goal" && <><Field label="Título"><Input name="title" required autoFocus defaultValue={goal?.title} /></Field><Field label="Valor-alvo"><Input min="0.01" name="targetAmount" step="0.01" type="number" required defaultValue={goal?.targetAmount} /></Field><Field label="Prazo opcional"><Input name="targetDate" type="date" defaultValue={goal?.targetDate ? dateInput(goal.targetDate) : ""} /></Field>{goal && <Field label="Status"><Select name="status" defaultValue={goal.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Ativo</SelectItem><SelectItem value="completed">Concluído</SelectItem><SelectItem value="archived">Arquivado</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select></Field>}</>}
    {mode === "contribution" && <><Field label="Valor"><Input min="0.01" name="amount" step="0.01" type="number" required autoFocus /></Field><Field label="Data"><Input defaultValue={today()} name="date" type="date" required /></Field><Field label="Observação opcional"><Textarea name="notes" /></Field></>}
    {(mode === "transaction" || mode === "commitment") && <><Button className="justify-self-start" type="button" variant="ghost" size="sm" onClick={() => setDetails((value) => !value)}>{details ? "Ocultar detalhes" : "Mais detalhes"}</Button>{details && <div className="grid gap-4 border-t border-border pt-4"><Field label="Categoria opcional"><Select name="categoryId" defaultValue={transaction?.categoryId ?? commitment?.categoryId ?? "none"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sem categoria</SelectItem>{compatibleCategories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></Field>{mode === "commitment" && <Field label="Conta prevista"><Select name="accountId" defaultValue={commitment?.accountId ?? "none"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Definir ao quitar</SelectItem>{activeAccounts.map((account) => <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>)}</SelectContent></Select></Field>}<Field label="Observação"><Textarea name="notes" defaultValue={transaction?.notes ?? commitment?.notes ?? ""} /></Field></div>}</>}
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <DialogFooter><Button disabled={pending} type="button" variant="outline" onClick={close}>Cancelar</Button><Button disabled={pending} type="submit">{pending ? "Salvando..." : editing ? "Salvar alterações" : "Salvar"}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}
