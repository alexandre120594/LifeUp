"use client";

import { Check, Minus, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";

import { FieldError } from "@/components/ui/app-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLifeHabit, useUpdateLifeHabit } from "@/hooks/useLifeHabitMutations";
import { normalizeTargetDays, rewardLooksRisky } from "@/lib/life-habits";
import { cn } from "@/lib/utils";
import type { LifeHabit, LifeHabitKind } from "@/types/BaseInterfaces";

type HabitDraft = {
  color: string;
  kind: LifeHabitKind;
  notes: string;
  reward: string;
  targetDays: string;
  title: string;
};

function getInitialDraft(habit: LifeHabit | null, initialKind: LifeHabitKind): HabitDraft {
  return {
    color: habit?.color ?? (initialKind === "good" ? "#6366f1" : "#0f766e"),
    kind: habit?.kind ?? initialKind,
    notes: habit?.notes ?? "",
    reward: habit?.reward ?? "",
    targetDays: String(normalizeTargetDays(habit?.targetDays)),
    title: habit?.title ?? "",
  };
}

export function HabitDialog({
  habit,
  initialKind = "good",
  onOpenChange,
}: {
  habit: LifeHabit | null;
  initialKind?: LifeHabitKind;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState(() => getInitialDraft(habit, initialKind));
  const [titleError, setTitleError] = useState("");
  const createHabit = useCreateLifeHabit();
  const updateHabit = useUpdateLifeHabit();
  const isPending = createHabit.isPending || updateHabit.isPending;
  const riskyReward = draft.kind === "bad" && rewardLooksRisky(draft.title, draft.reward);
  const examples = draft.kind === "good"
    ? "Ler, treinar, beber água, estudar, caminhar ou meditar"
    : "Fumar, comprar por impulso, refrigerante, delivery ou redes sociais à noite";

  function updateDraft<K extends keyof HabitDraft>(field: K, value: HabitDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "title") setTitleError("");
  }

  function chooseKind(kind: LifeHabitKind) {
    setDraft((current) => ({
      ...current,
      color:
        current.color === "#6366f1" || current.color === "#0f766e"
          ? kind === "good" ? "#6366f1" : "#0f766e"
          : current.color,
      kind,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setTitleError("Informe um nome para o hábito.");
      return;
    }
    if (riskyReward) return;

    const data = {
      color: draft.color,
      kind: draft.kind,
      notes: draft.notes.trim() || null,
      reward: draft.reward.trim() || null,
      targetDays: normalizeTargetDays(Number.parseInt(draft.targetDays, 10)),
      title: draft.title.trim(),
    };
    const close = () => onOpenChange(false);

    if (habit) {
      updateHabit.mutate({ data, id: habit.id }, { onSuccess: close });
    } else {
      createHabit.mutate(data, { onSuccess: close });
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden p-0 sm:max-w-2xl">
        <form className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col" onSubmit={handleSubmit}>
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
            <DialogTitle>{habit ? "Editar hábito" : "O que você quer fazer?"}</DialogTitle>
            <DialogDescription>Escolha como quer acompanhar e defina uma meta que faça sentido para você.</DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 gap-4 overflow-y-auto px-5 py-4">
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-xs font-medium text-text-secondary">Tipo de hábito</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <KindButton
                  active={draft.kind === "good"}
                  description="Algo que você quer repetir com consistência."
                  icon={<Plus className="size-4" />}
                  label="Construir um hábito"
                  onClick={() => chooseKind("good")}
                />
                <KindButton
                  active={draft.kind === "bad"}
                  description="Algo que você quer deixar de fazer."
                  icon={<Minus className="size-4" />}
                  label="Evitar um hábito"
                  onClick={() => chooseKind("bad")}
                />
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor="habit-title">Nome</label>
                <Input
                  aria-describedby={titleError ? "habit-title-error habit-title-help" : "habit-title-help"}
                  aria-invalid={Boolean(titleError)}
                  autoFocus
                  id="habit-title"
                  maxLength={100}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder={draft.kind === "good" ? "Ex.: Ler 20 minutos" : "Ex.: Não fumar"}
                  value={draft.title}
                />
                <p className="text-[11px] text-text-tertiary" id="habit-title-help">Exemplos: {examples}.</p>
                <FieldError id="habit-title-error">{titleError}</FieldError>
              </div>
              <div className="grid content-start gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor="habit-target">Meta em dias</label>
                <Input id="habit-target" max={365} min={10} onChange={(event) => updateDraft("targetDays", event.target.value)} type="number" value={draft.targetDays} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor="habit-reward">Recompensa (opcional)</label>
                <Input id="habit-reward" maxLength={120} onChange={(event) => updateDraft("reward", event.target.value)} placeholder="Ex.: Cinema" value={draft.reward} />
                <p className="text-[11px] text-text-tertiary">Uma recompensa escolhida por você para cada marco de 10 dias.</p>
              </div>
              <div className="grid content-start gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor="habit-color">Cor</label>
                <Input className="w-full p-1" id="habit-color" onChange={(event) => updateDraft("color", event.target.value)} type="color" value={draft.color} />
              </div>
            </div>

            {riskyReward ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
                Escolha uma recompensa que não envolva nem incentive o hábito que você quer evitar.
              </div>
            ) : null}

            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor="habit-notes">Observação</label>
              <Textarea className="min-h-24 resize-none" id="habit-notes" maxLength={500} onChange={(event) => updateDraft("notes", event.target.value)} placeholder="Motivo, contexto ou uma regra pessoal" value={draft.notes} />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
            <Button disabled={isPending} onClick={() => onOpenChange(false)} type="button" variant="outline">Cancelar</Button>
            <Button disabled={isPending || riskyReward} type="submit">
              {habit ? <Check className="size-4" /> : <Plus className="size-4" />}
              {isPending ? "Salvando..." : habit ? "Salvar alterações" : "Criar hábito"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function KindButton({
  active,
  description,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow]",
        active ? "border-primary bg-primary/5 shadow-snow-1" : "border-border hover:border-border-strong hover:bg-hover/50",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-2 text-sm font-semibold"><span className={cn("grid size-7 place-items-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-secondary text-text-secondary")}>{icon}</span>{label}</span>
      <span className="mt-2 block text-xs leading-5 text-text-secondary">{description}</span>
    </button>
  );
}
