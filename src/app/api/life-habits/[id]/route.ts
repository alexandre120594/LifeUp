import { Prisma } from "@/generated/client";
import { requireCurrentUserId } from "@/lib/auth";
import { normalizeHabitPayload, type HabitPayload } from "@/lib/life-habit-input";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const dayKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

type Completion = { count: number; steps: string[] };
type ActionPayload = HabitPayload & { action?: unknown; amount?: unknown; dayKey?: unknown; stepId?: unknown };

function dayKey(value: unknown) {
  const key = typeof value === "string" && dayKeyPattern.test(value) ? value : new Date().toISOString().slice(0, 10);
  return key;
}

function completionMap(value: Prisma.JsonValue, checkins: string[], badEvents: string[], kind: string, lastBadAt: Date | null) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = value as Record<string, Completion>;
    if (Object.keys(entries).length) return { ...entries };
  }
  const legacyDays = kind === "bad" ? [...badEvents, ...(lastBadAt ? [lastBadAt.toISOString().slice(0, 10)] : [])] : checkins;
  return Object.fromEntries([...new Set(legacyDays)].map((key) => [key, { count: 1, steps: [] }]));
}

function completionDone(habit: { anyAmount: boolean; anySteps: boolean; kind: string; perDayTarget: number; substeps: Prisma.JsonValue }, entry: Completion) {
  if (habit.kind === "bad") return false;
  const steps = Array.isArray(habit.substeps) ? habit.substeps as Array<{ id?: unknown }> : [];
  if (steps.length) {
    const marked = new Set(entry.steps);
    return habit.anySteps ? steps.some((step) => typeof step.id === "string" && marked.has(step.id)) : steps.every((step) => typeof step.id === "string" && marked.has(step.id));
  }
  return habit.kind === "quantitative" && habit.anyAmount ? entry.count > 0 : entry.count >= habit.perDayTarget;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;

  try {
    const { id } = await params;
    const body = (await req.json()) as ActionPayload;
    const habit = await prisma.lifeHabit.findFirst({ where: { id, userId } });
    if (!habit) return NextResponse.json({ message: "Hábito não encontrado." }, { status: 404 });

    if (typeof body.action === "string") {
      const key = dayKey(body.dayKey);
      const today = new Date().toISOString().slice(0, 10);
      if (key > today) return NextResponse.json({ message: "Não é possível registrar no futuro." }, { status: 400 });
      const completions = completionMap(habit.completions, habit.checkins, habit.badEvents, habit.kind, habit.lastBadAt);
      const current = completions[key] ?? { count: 0, steps: [] };

      if (body.action === "toggle-checkin") {
        if (completions[key]) delete completions[key];
        else completions[key] = { count: Math.max(1, habit.perDayTarget), steps: [] };
      } else if (body.action === "reset-bad") {
        if (habit.kind !== "bad") return NextResponse.json({ message: "Esta ação só vale para hábitos de abstinência." }, { status: 400 });
        completions[key] = { count: 1, steps: [] };
      } else if (body.action === "set-amount" || body.action === "increment") {
        if (habit.kind !== "quantitative") return NextResponse.json({ message: "Esta ação exige um hábito quantitativo." }, { status: 400 });
        const raw = typeof body.amount === "number" ? body.amount : Number(body.amount);
        if (!Number.isFinite(raw)) return NextResponse.json({ message: "Informe uma quantidade válida." }, { status: 400 });
        const next = body.action === "increment" ? current.count + raw : raw;
        if (next <= 0) delete completions[key];
        else completions[key] = { ...current, count: Math.min(next, 1_000_000_000) };
      } else if (body.action === "toggle-step") {
        const stepId = typeof body.stepId === "string" ? body.stepId : "";
        const steps = Array.isArray(habit.substeps) ? habit.substeps as Array<{ id?: unknown }> : [];
        if (!stepId || !steps.some((step) => step.id === stepId)) return NextResponse.json({ message: "Etapa inválida." }, { status: 400 });
        const marked = new Set(current.steps);
        if (marked.has(stepId)) marked.delete(stepId); else marked.add(stepId);
        if (!marked.size) delete completions[key];
        else completions[key] = { count: marked.size, steps: [...marked] };
      } else {
        return NextResponse.json({ message: "Ação inválida." }, { status: 400 });
      }

      const keys = Object.keys(completions).sort();
      const badEvents = habit.kind === "bad" ? keys : habit.badEvents;
      const checkins = habit.kind === "bad" ? habit.checkins.filter((item) => item !== key) : keys.filter((item) => completionDone(habit, completions[item]));
      const updated = await prisma.lifeHabit.update({
        where: { id },
        data: { badEvents, checkins, completions: completions as unknown as Prisma.InputJsonValue, lastBadAt: habit.kind === "bad" && badEvents.length ? new Date(`${badEvents.at(-1)}T12:00:00`) : habit.lastBadAt },
      });
      return NextResponse.json(updated);
    }

    const payload = normalizeHabitPayload(body, true);
    if ("title" in payload && !payload.title) return NextResponse.json({ message: "Informe o nome do hábito." }, { status: 400 });
    const data = payload as unknown as Prisma.LifeHabitUncheckedUpdateInput;
    if ("archivedAt" in body) {
      data.archivedAt = body.archivedAt === null ? null : new Date();
    }
    const updated = await prisma.lifeHabit.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Não foi possível atualizar o hábito." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, userId } = await requireCurrentUserId();
  if (response) return response;
  try {
    const { id } = await params;
    const result = await prisma.lifeHabit.deleteMany({ where: { id, userId } });
    if (!result.count) return NextResponse.json({ message: "Hábito não encontrado." }, { status: 404 });
    return NextResponse.json({ message: "Hábito excluído." });
  } catch {
    return NextResponse.json({ message: "Não foi possível excluir o hábito." }, { status: 500 });
  }
}
