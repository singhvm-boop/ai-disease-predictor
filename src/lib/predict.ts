import { diseases, redFlagRules, symptomsById } from "./knowledge";
import type {
  AgeBand,
  Disease,
  DiseasePrediction,
  Duration,
  PredictionResult,
  Sex,
  SymptomLink,
  SymptomMatch,
} from "./types";

const MAX_CONFIDENCE = 92;
const TOP_N = 6;

const documentFrequency = new Map<string, number>();
for (const disease of diseases) {
  const ids = new Set<string>([
    ...disease.symptoms.map((link) => link.id),
    ...(disease.against ?? []).map((link) => link.id),
  ]);
  for (const id of ids) {
    documentFrequency.set(id, (documentFrequency.get(id) ?? 0) + 1);
  }
}

function idf(symptomId: string) {
  const df = documentFrequency.get(symptomId) ?? 0;
  return Math.log((diseases.length + 1) / (df + 1)) + 1;
}

function termWeight(link: SymptomLink) {
  return link.weight * (link.hallmark ? 1.45 : 1) * idf(link.id);
}

export function toConfidence(raw: number) {
  const logistic = 1 / (1 + Math.exp(-8.2 * (raw - 0.5)));
  return Math.max(0, Math.min(MAX_CONFIDENCE, Math.round(logistic * 100)));
}

function eligible(disease: Disease, sex: Sex) {
  if (!disease.sex) return true;
  if (sex === "unspecified") return true;
  return disease.sex === sex;
}

function toMatch(link: SymptomLink): SymptomMatch {
  const symptom = symptomsById.get(link.id);
  return {
    id: link.id,
    name: symptom?.name ?? link.id,
    weight: link.weight,
    hallmark: Boolean(link.hallmark),
  };
}

export function scoreDisease(
  disease: Disease,
  selected: Set<string>,
  ageBand: AgeBand | null,
) {
  const matchedLinks = disease.symptoms.filter((link) => selected.has(link.id));
  if (matchedLinks.length === 0) {
    return { raw: 0, coverage: 0, matched: [] as SymptomMatch[], missingHallmarks: [] as SymptomMatch[] };
  }

  const support = matchedLinks.reduce((sum, link) => sum + termWeight(link), 0);
  const expected = disease.symptoms.reduce((sum, link) => sum + termWeight(link), 0);
  const coverage = expected === 0 ? 0 : support / expected;

  const hallmarks = disease.symptoms.filter((link) => link.hallmark);
  const hallmarkRecall =
    hallmarks.length === 0
      ? 1
      : hallmarks.filter((link) => selected.has(link.id)).length / hallmarks.length;

  const against = (disease.against ?? []).filter((link) => selected.has(link.id));
  const penaltyMass = against.reduce((sum, link) => sum + termWeight(link), 0);
  const penalty = penaltyMass / (penaltyMass + expected);

  const breadth = Math.min(1, matchedLinks.length / 3);
  const ageFactor = ageBand ? (disease.ageBoost?.[ageBand] ?? 1) : 1;

  let raw =
    Math.pow(disease.prevalence, 0.22) *
    ageFactor *
    (0.58 * coverage + 0.3 * hallmarkRecall + 0.12 * breadth) *
    (1 - 0.62 * penalty);

  if (coverage < 0.2 && hallmarkRecall < 0.34) raw *= 0.45;
  if (matchedLinks.length === 1 && !matchedLinks[0]?.hallmark) raw *= 0.55;

  return {
    raw,
    coverage,
    matched: matchedLinks.map(toMatch),
    missingHallmarks: hallmarks.filter((link) => !selected.has(link.id)).map(toMatch),
  };
}

function uniqueIds(symptoms: string[]) {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const symptom of symptoms) {
    if (typeof symptom !== "string") continue;
    const id = symptom.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ordered.push(id);
  }
  return ordered;
}

export function predict(input: {
  symptoms: string[];
  sex?: Sex;
  ageBand?: AgeBand | null;
  duration?: Duration | null;
}): PredictionResult {
  const sex = input.sex ?? "unspecified";
  const ageBand = input.ageBand ?? null;
  const duration = input.duration ?? null;
  const ids = uniqueIds(input.symptoms);
  const recognized = ids
    .filter((id) => symptomsById.has(id))
    .map((id) => ({ id, name: symptomsById.get(id)!.name }));
  const ignored = ids.filter((id) => !symptomsById.has(id));
  const selected = new Set(recognized.map((symptom) => symptom.id));

  const redFlags = redFlagRules
    .filter((rule) =>
      rule.groups.every((group) => {
        const hits = group.ids.filter((id) => selected.has(id)).length;
        return hits >= group.min;
      }),
    )
    .map(({ id, title, message, action }) => ({ id, title, message, action }));

  const ranked = diseases
    .filter((disease) => eligible(disease, sex))
    .map((disease) => {
      const score = scoreDisease(disease, selected, ageBand);
      return { disease, ...score };
    })
    .filter((entry) => entry.raw > 0.12)
    .sort((a, b) => b.raw - a.raw || b.coverage - a.coverage || a.disease.name.localeCompare(b.disease.name));

  const predictions: DiseasePrediction[] = ranked.slice(0, TOP_N).map((entry) => ({
    id: entry.disease.id,
    name: entry.disease.name,
    system: entry.disease.system,
    summary: entry.disease.summary,
    urgency: entry.disease.urgency,
    confidence: toConfidence(entry.raw),
    coverage: Math.round(entry.coverage * 100) / 100,
    matched: entry.matched,
    missingHallmarks: entry.missingHallmarks,
    care: entry.disease.care,
    seekCare: entry.disease.seekCare,
    course: entry.disease.course,
  }));

  const leader = ranked[0];
  const lowConfidence =
    recognized.length < 2 ||
    !leader ||
    leader.coverage < 0.34 ||
    leader.raw < 0.42 ||
    toConfidence(leader.raw) < 48;

  return {
    predictions,
    redFlags,
    lowConfidence,
    recognized,
    ignored,
    context: { sex, ageBand, duration },
  };
}

export const ageBandOptions: { value: AgeBand; label: string }[] = [
  { value: "child", label: "Child, under 12" },
  { value: "teen", label: "Teen, 12–17" },
  { value: "adult", label: "Adult, 18–64" },
  { value: "older", label: "65 or older" },
];

export const durationOptions: { value: Duration; label: string }[] = [
  { value: "under-2-days", label: "Less than 2 days" },
  { value: "2-to-7-days", label: "2 to 7 days" },
  { value: "1-to-4-weeks", label: "1 to 4 weeks" },
  { value: "more-than-a-month", label: "More than a month" },
];

export const sexOptions: { value: Sex; label: string }[] = [
  { value: "unspecified", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export function isSex(value: unknown): value is Sex {
  return value === "female" || value === "male" || value === "unspecified";
}

export function isAgeBand(value: unknown): value is AgeBand {
  return value === "child" || value === "teen" || value === "adult" || value === "older";
}

export function isDuration(value: unknown): value is Duration {
  return (
    value === "under-2-days" ||
    value === "2-to-7-days" ||
    value === "1-to-4-weeks" ||
    value === "more-than-a-month"
  );
}

export type PredictRequest = {
  symptoms: string[];
  sex?: Sex;
  ageBand?: AgeBand | null;
  duration?: Duration | null;
};

export function parsePredictBody(
  body: unknown,
): { ok: true; value: PredictRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a JSON object with a symptoms array." };
  }
  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.symptoms)) {
    return { ok: false, error: "symptoms must be an array of symptom ids." };
  }
  if (record.symptoms.length === 0) {
    return { ok: false, error: "Add at least one symptom." };
  }
  if (record.symptoms.length > 30) {
    return { ok: false, error: "Send at most 30 symptoms." };
  }
  if (!record.symptoms.every((item) => typeof item === "string")) {
    return { ok: false, error: "Each symptom must be a string id." };
  }
  if (record.sex !== undefined && record.sex !== null && !isSex(record.sex)) {
    return { ok: false, error: "sex must be female, male, or unspecified." };
  }
  if (record.ageBand !== undefined && record.ageBand !== null && !isAgeBand(record.ageBand)) {
    return { ok: false, error: "ageBand must be child, teen, adult, or older." };
  }
  if (record.duration !== undefined && record.duration !== null && !isDuration(record.duration)) {
    return { ok: false, error: "duration is not a recognized value." };
  }
  return {
    ok: true,
    value: {
      symptoms: record.symptoms,
      sex: isSex(record.sex) ? record.sex : undefined,
      ageBand: isAgeBand(record.ageBand) ? record.ageBand : null,
      duration: isDuration(record.duration) ? record.duration : null,
    },
  };
}
