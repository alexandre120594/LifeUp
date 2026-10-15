"use client";

import { Check, Minus, Plus, Sigma } from "lucide-react";
import { type FormEvent, useState } from "react";

import { FieldError } from "@/components/ui/app-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLifeHabit, useUpdateLifeHabit } from "@/hooks/useLifeHabitMutations";
import { cn } from "@/lib/utils";
import type { LifeHabit, LifeHabitInterval, LifeHabitKind, LifeHabitQuantKind, LifeHabitScheduleUnit } from "@/types/BaseInterfaces";

type HabitDraft = {
  anyAmount: boolean; anySteps: boolean; category: string; color: string; dailyCost: string; difficulty: string;
  durationMinutes: string; focusBreakMinutes: string; focusMinutes: string; focusOnly: boolean; icon: string;
  incrementAmount: string; interval: LifeHabitInterval; kind: LifeHabitKind; notes: string; perDayTarget: string;
  quantKind: LifeHabitQuantKind; restDays: number[]; scheduleEvery: string; scheduleStart: string;
  scheduleUnit: LifeHabitScheduleUnit; scheduleWeekdays: number[]; startTime: string; substeps: string;
  targetFrequency: string; title: string; unitLabel: string;
};

const weekdays = [{ id: 1, label: "S" }, { id: 2, label: "T" }, { id: 3, label: "Q" }, { id: 4, label: "Q" }, { id: 5, label: "S" }, { id: 6, label: "S" }, { id: 7, label: "D" }];

function toTime(minutes: number) {
  if (minutes < 0) return "";
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function fromTime(value: string) {
  if (!value) return -1;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function initialDraft(habit: LifeHabit | null, kind: LifeHabitKind): HabitDraft {
  return {
    anyAmount: habit?.anyAmount ?? false, anySteps: habit?.anySteps ?? false, category: habit?.category ?? "",
    color: habit?.color ?? "#6366f1", dailyCost: String(habit?.dailyCost ?? 0), difficulty: String(habit?.difficulty ?? 0),
    durationMinutes: String(habit?.durationMinutes ?? 0), focusBreakMinutes: String(habit?.focusBreakMinutes ?? 0),
    focusMinutes: String(habit?.focusMinutes ?? 25), focusOnly: habit?.focusOnly ?? false, icon: habit?.icon ?? "🎯",
    incrementAmount: String(habit?.incrementAmount ?? 1), interval: habit?.interval ?? "daily", kind: habit?.kind ?? kind,
    notes: habit?.notes ?? "", perDayTarget: String(habit?.perDayTarget ?? 1), quantKind: habit?.quantKind ?? "generic",
    restDays: habit?.restDays ?? [], scheduleEvery: String(habit?.scheduleEvery ?? 2),
    scheduleStart: habit?.scheduleStart ? new Date(habit.scheduleStart).toISOString().slice(0, 10) : "",
    scheduleUnit: habit?.scheduleUnit ?? "days", scheduleWeekdays: habit?.scheduleWeekdays ?? [1, 3, 5],
    startTime: toTime(habit?.startMinute ?? -1), substeps: habit?.substeps.map((step) => step.title).join("\n") ?? "",
    targetFrequency: String(habit?.targetFrequency ?? 1), title: habit?.title ?? "", unitLabel: habit?.unitLabel ?? "",
  };
}

export function HabitDialog({ habit, initialKind = "positive", onOpenChange }: { habit: LifeHabit | null; initialKind?: LifeHabitKind; onOpenChange: (open: boolean) => void }) {
  const [draft, setDraft] = useState(() => initialDraft(habit, initialKind));
  const [titleError, setTitleError] = useState("");
  const createHabit = useCreateLifeHabit();
  const updateHabit = useUpdateLifeHabit();
  const pending = createHabit.isPending || updateHabit.isPending;
  const set = <K extends keyof HabitDraft>(key: K, value: HabitDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const toggleDay = (key: "restDays" | "scheduleWeekdays", day: number) => set(key, (draft[key].includes(day) ? draft[key].filter((item) => item !== day) : [...draft[key], day].sort()) as HabitDraft[typeof key]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) { setTitleError("Informe um nome para o hábito."); return; }
    if (draft.interval === "weekdays" && !draft.scheduleWeekdays.length) return;
    const oldSteps = new Map(habit?.substeps.map((step) => [step.title.toLocaleLowerCase(), step.id]));
    const substeps = draft.substeps.split("\n").map((title) => title.trim()).filter(Boolean).slice(0, 20).map((title, index) => ({ id: oldSteps.get(title.toLocaleLowerCase()) ?? `step-${Date.now()}-${index}`, title }));
    const data = {
      anyAmount: draft.anyAmount, anySteps: draft.anySteps, category: draft.category.trim() || null, color: draft.color,
      dailyCost: Number(draft.dailyCost), difficulty: Number(draft.difficulty), durationMinutes: Number(draft.durationMinutes),
      focusBreakMinutes: Number(draft.focusBreakMinutes), focusMinutes: Number(draft.focusMinutes), focusOnly: draft.kind === "positive" && draft.focusOnly,
      icon: draft.icon.trim() || "🎯", incrementAmount: Number(draft.incrementAmount), interval: draft.interval, kind: draft.kind,
      notes: draft.notes.trim() || null, perDayTarget: Number(draft.perDayTarget), quantKind: draft.quantKind,
      restDays: draft.restDays, scheduleEvery: Number(draft.scheduleEvery), scheduleStart: draft.scheduleStart || null,
      scheduleUnit: draft.scheduleUnit, scheduleWeekdays: draft.scheduleWeekdays, startMinute: fromTime(draft.startTime),
      substeps, targetFrequency: Number(draft.targetFrequency), title: draft.title.trim(), unitLabel: draft.unitLabel.trim() || null,
    };
    const close = () => onOpenChange(false);
    if (habit) updateHabit.mutate({ id: habit.id, data }, { onSuccess: close });
    else createHabit.mutate(data, { onSuccess: close });
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden p-0 sm:max-w-3xl">
        <form className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col" onSubmit={submit}>
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
            <DialogTitle>{habit ? "Editar hábito" : "Novo hábito"}</DialogTitle>
            <DialogDescription>Configure o comportamento, a agenda e a forma de registrar.</DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 gap-5 overflow-y-auto px-5 py-4">
            <fieldset className="grid gap-2"><legend className="mb-1 text-xs font-medium text-text-secondary">Tipo</legend><div className="grid gap-2 sm:grid-cols-3">
              <Kind active={draft.kind === "positive"} icon={<Plus className="size-4" />} label="Normal" text="Concluir uma ação" onClick={() => set("kind", "positive")} />
              <Kind active={draft.kind === "negative"} icon={<Minus className="size-4" />} label="Evitar" text="Registrar recaídas" onClick={() => set("kind", "negative")} />
              <Kind active={draft.kind === "quantitative"} icon={<Sigma className="size-4" />} label="Quantidade" text="Somar até uma meta" onClick={() => set("kind", "quantitative")} />
            </div></fieldset>

            <Section title="Identidade"><div className="grid gap-4 sm:grid-cols-[4rem_minmax(0,1fr)_8rem]">
              <Field label="Ícone"><Input maxLength={12} value={draft.icon} onChange={(event) => set("icon", event.target.value)} /></Field>
              <Field label="Nome" error={titleError}><Input autoFocus maxLength={100} value={draft.title} onChange={(event) => { set("title", event.target.value); setTitleError(""); }} /></Field>
              <Field label="Cor"><Input className="p-1" type="color" value={draft.color} onChange={(event) => set("color", event.target.value)} /></Field>
            </div><div className="grid gap-4 sm:grid-cols-2"><Field label="Categoria"><Input maxLength={60} placeholder="Ex.: Saúde" value={draft.category} onChange={(event) => set("category", event.target.value)} /></Field><Field label="Dificuldade"><Select value={draft.difficulty} onValueChange={(value) => set("difficulty", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Normal</SelectItem><SelectItem value="1">Fácil</SelectItem><SelectItem value="2">Média</SelectItem><SelectItem value="3">Difícil</SelectItem></SelectContent></Select></Field></div><Field label="Descrição"><Textarea className="min-h-20 resize-none" maxLength={500} value={draft.notes} onChange={(event) => set("notes", event.target.value)} /></Field></Section>

            {draft.kind === "quantitative" ? <Section title="Meta quantitativa"><div className="grid gap-4 sm:grid-cols-4"><Field label="Meta diária"><Input min="0.01" step="any" type="number" value={draft.perDayTarget} onChange={(event) => set("perDayTarget", event.target.value)} /></Field><Field label="Unidade"><Input maxLength={24} placeholder="ml, páginas, km" required value={draft.unitLabel} onChange={(event) => set("unitLabel", event.target.value)} /></Field><Field label="Incremento"><Input min="0.01" step="any" type="number" value={draft.incrementAmount} onChange={(event) => set("incrementAmount", event.target.value)} /></Field><Field label="Modo"><Select value={draft.quantKind} onValueChange={(value) => set("quantKind", value as LifeHabitQuantKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="generic">Geral</SelectItem><SelectItem value="water">Água</SelectItem><SelectItem value="reading">Leitura</SelectItem><SelectItem value="time">Tempo</SelectItem></SelectContent></Select></Field></div><CheckField checked={draft.anyAmount} label="Qualquer quantidade maior que zero conclui o dia" onChange={(checked) => set("anyAmount", checked)} /></Section> : null}

            {draft.kind === "negative" ? <Section title="Abstinência"><Field label="Custo diário evitado"><Input min="0" step="0.01" type="number" value={draft.dailyCost} onChange={(event) => set("dailyCost", event.target.value)} /></Field></Section> : null}

            {draft.kind !== "negative" ? <Section title="Checklist"><Field label="Uma etapa por linha"><Textarea className="min-h-24" placeholder={"Preparar material\nExecutar\nRegistrar resultado"} value={draft.substeps} onChange={(event) => set("substeps", event.target.value)} /></Field>{draft.substeps.trim() ? <CheckField checked={draft.anySteps} label="Concluir o dia ao marcar qualquer etapa" onChange={(checked) => set("anySteps", checked)} /> : null}</Section> : null}

            <Section title="Agenda"><div className="grid gap-4 sm:grid-cols-2"><Field label="Frequência"><Select value={draft.interval} onValueChange={(value) => set("interval", value as LifeHabitInterval)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Todos os dias</SelectItem><SelectItem value="weekly">Vezes por semana</SelectItem><SelectItem value="monthly">Vezes por mês</SelectItem><SelectItem value="weekdays">Dias escolhidos</SelectItem><SelectItem value="everyXDays">Intervalo fixo</SelectItem></SelectContent></Select></Field>{draft.interval === "weekly" || draft.interval === "monthly" ? <Field label="Quantidade no período"><Input min="1" max={draft.interval === "weekly" ? 7 : 31} type="number" value={draft.targetFrequency} onChange={(event) => set("targetFrequency", event.target.value)} /></Field> : null}</div>
              {draft.interval === "weekdays" ? <DayPicker label="Dias ativos" selected={draft.scheduleWeekdays} onToggle={(day) => toggleDay("scheduleWeekdays", day)} /> : null}
              {draft.interval === "everyXDays" ? <div className="grid gap-4 sm:grid-cols-3"><Field label="A cada"><Input min="1" type="number" value={draft.scheduleEvery} onChange={(event) => set("scheduleEvery", event.target.value)} /></Field><Field label="Unidade"><Select value={draft.scheduleUnit} onValueChange={(value) => set("scheduleUnit", value as LifeHabitScheduleUnit)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="days">Dias</SelectItem><SelectItem value="weeks">Semanas</SelectItem><SelectItem value="months">Meses</SelectItem></SelectContent></Select></Field><Field label="Começando em"><Input type="date" value={draft.scheduleStart} onChange={(event) => set("scheduleStart", event.target.value)} /></Field></div> : null}
              <DayPicker label="Dias de descanso" selected={draft.restDays} onToggle={(day) => toggleDay("restDays", day)} />
            </Section>

            <Section title="Planejamento e foco"><div className="grid gap-4 sm:grid-cols-4"><Field label="Horário"><Input type="time" value={draft.startTime} onChange={(event) => set("startTime", event.target.value)} /></Field><Field label="Duração (min)"><Input min="0" max="1440" type="number" value={draft.durationMinutes} onChange={(event) => set("durationMinutes", event.target.value)} /></Field><Field label="Foco (min)"><Input min="1" max="1440" type="number" value={draft.focusMinutes} onChange={(event) => set("focusMinutes", event.target.value)} /></Field><Field label="Pausa (min)"><Input min="0" max="1440" type="number" value={draft.focusBreakMinutes} onChange={(event) => set("focusBreakMinutes", event.target.value)} /></Field></div>{draft.kind === "positive" ? <CheckField checked={draft.focusOnly} label="Só permitir conclusão por uma sessão de foco" onChange={(checked) => set("focusOnly", checked)} /> : null}</Section>
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-5 py-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button disabled={pending} type="submit">{habit ? <Check className="size-4" /> : <Plus className="size-4" />}{pending ? "Salvando..." : habit ? "Salvar alterações" : "Criar hábito"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) { return <section className="grid gap-4 rounded-xl border border-border bg-panel-subtle/40 p-4"><h3 className="text-sm font-semibold">{title}</h3>{children}</section>; }
function Field({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) { return <label className="grid content-start gap-1.5 text-xs font-medium text-text-secondary">{label}{children}{error ? <FieldError id="habit-field-error">{error}</FieldError> : null}</label>; }
function CheckField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) { return <label className="flex items-center gap-2 text-xs text-text-secondary"><Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />{label}</label>; }
function DayPicker({ label, onToggle, selected }: { label: string; onToggle: (day: number) => void; selected: number[] }) { return <div className="grid gap-2"><span className="text-xs font-medium text-text-secondary">{label}</span><div className="flex gap-2">{weekdays.map((day) => <Button aria-pressed={selected.includes(day.id)} className="size-9 p-0" key={day.id} onClick={() => onToggle(day.id)} type="button" variant={selected.includes(day.id) ? "default" : "outline"}>{day.label}</Button>)}</div></div>; }
function Kind({ active, icon, label, onClick, text }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void; text: string }) { return <button className={cn("rounded-xl border p-3 text-left", active ? "border-primary bg-primary/5" : "border-border hover:bg-hover/50")} onClick={onClick} type="button"><span className="flex items-center gap-2 text-sm font-semibold">{icon}{label}</span><span className="mt-1 block text-xs text-text-secondary">{text}</span></button>; }
