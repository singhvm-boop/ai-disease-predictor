import type { PredictionResult } from "./types";

const STORAGE_KEY = "meridian.checks.v1";
const HISTORY_EVENT = "meridian-history";
const LIMIT = 20;

function emitHistory() {
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export function subscribeHistory(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(HISTORY_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HISTORY_EVENT, callback);
  };
}

export function historySnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

export function historyServerSnapshot() {
  return "[]";
}

export type SavedCheck = {
  id: string;
  at: string;
  symptomIds: string[];
  symptomNames: string[];
  topId: string | null;
  topName: string | null;
  topConfidence: number | null;
  redFlagTitles: string[];
  lowConfidence: boolean;
  sex: string;
  ageBand: string | null;
  duration: string | null;
};

export function readHistory(): SavedCheck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCheck[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCheck(result: PredictionResult): SavedCheck[] {
  const top = result.predictions[0];
  const entry: SavedCheck = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    symptomIds: result.recognized.map((symptom) => symptom.id),
    symptomNames: result.recognized.map((symptom) => symptom.name),
    topId: top?.id ?? null,
    topName: top?.name ?? null,
    topConfidence: top?.confidence ?? null,
    redFlagTitles: result.redFlags.map((flag) => flag.title),
    lowConfidence: result.lowConfidence,
    sex: result.context.sex,
    ageBand: result.context.ageBand,
    duration: result.context.duration,
  };
  const next = [entry, ...readHistory()].slice(0, LIMIT);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitHistory();
  return next;
}

export function clearHistory() {
  window.localStorage.removeItem(STORAGE_KEY);
  emitHistory();
}
