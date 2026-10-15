import type {
  LifeHabitCreateInput,
  LifeHabitInterval,
  LifeHabitKind,
  LifeHabitQuantKind,
  LifeHabitScheduleUnit,
  LifeHabitSubstep,
} from "@/types/BaseInterfaces";

const intervals = new Set<LifeHabitInterval>(["daily", "weekly", "monthly", "weekdays", "everyXDays"]);
const kinds = new Set<LifeHabitKind>(["positive", "negative", "quantitative"]);
const quantKinds = new Set<LifeHabitQuantKind>(["generic", "water", "reading", "time"]);
const scheduleUnits = new Set<LifeHabitScheduleUnit>(["days", "weeks", "months"]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function number(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function boolean(value: unknown) { return value === true; }

function weekdays(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 7))].sort();
}

function substeps(value: unknown): LifeHabitSubstep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = text(record.title, 80);
    if (!title) return [];
    const id = text(record.id, 80) || `step-${index + 1}`;
    return [{ id, title }];
  }).slice(0, 20);
}

function nullableDate(value: unknown) {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export type HabitPayload = Record<string, unknown>;

export function normalizeHabitPayload(body: HabitPayload, partial = false) {
  const data: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => { if (!partial || key in body) data[key] = value; };
  const requestedKind = text(body.kind, 20);
  const kind: LifeHabitKind = requestedKind === "good" ? "positive" : requestedKind === "bad" ? "negative" : kinds.has(requestedKind as LifeHabitKind) ? requestedKind as LifeHabitKind : "positive";
  const requestedInterval = text(body.interval, 20) as LifeHabitInterval;
  const requestedUnit = text(body.scheduleUnit, 20) as LifeHabitScheduleUnit;
  const requestedQuant = text(body.quantKind, 20) as LifeHabitQuantKind;

  set("title", text(body.title, 100));
  set("kind", kind === "positive" ? "good" : kind === "negative" ? "bad" : kind);
  set("color", text(body.color, 20) || null);
  set("icon", text(body.icon, 12) || "🎯");
  set("category", text(body.category, 60) || null);
  set("notes", text(body.notes, 500) || null);
  set("perDayTarget", number(body.perDayTarget, 1, 0.01, 1_000_000));
  set("interval", intervals.has(requestedInterval) ? requestedInterval : "daily");
  set("targetFrequency", Math.round(number(body.targetFrequency, 1, 1, 31)));
  set("scheduleWeekdays", weekdays(body.scheduleWeekdays));
  set("scheduleEvery", Math.round(number(body.scheduleEvery, 2, 1, 365)));
  set("scheduleUnit", scheduleUnits.has(requestedUnit) ? requestedUnit : "days");
  set("scheduleStart", nullableDate(body.scheduleStart));
  set("unitLabel", text(body.unitLabel, 24) || null);
  set("incrementAmount", number(body.incrementAmount, 1, 0.01, 1_000_000));
  set("quantKind", quantKinds.has(requestedQuant) ? requestedQuant : "generic");
  set("dailyCost", number(body.dailyCost, 0, 0, 1_000_000));
  set("difficulty", Math.round(number(body.difficulty, 0, 0, 3)));
  set("startMinute", Math.round(number(body.startMinute, -1, -1, 1_439)));
  set("durationMinutes", Math.round(number(body.durationMinutes, 0, 0, 1_440)));
  set("restDays", weekdays(body.restDays));
  set("focusMinutes", Math.round(number(body.focusMinutes, 25, 1, 1_440)));
  set("focusBreakMinutes", Math.round(number(body.focusBreakMinutes, 0, 0, 1_440)));
  set("focusOnly", kind === "positive" && boolean(body.focusOnly));
  set("anyAmount", boolean(body.anyAmount));
  set("anySteps", boolean(body.anySteps));
  set("substeps", substeps(body.substeps));
  return data as unknown as LifeHabitCreateInput;
}
