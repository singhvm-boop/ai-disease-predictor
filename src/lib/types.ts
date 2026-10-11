export const symptomCategories = [
  "General",
  "Breathing",
  "Head and senses",
  "Stomach and gut",
  "Urinary",
  "Skin",
  "Muscles and joints",
  "Mood and sleep",
  "Metabolic",
] as const;

export type SymptomCategory = (typeof symptomCategories)[number];

export type Symptom = {
  id: string;
  name: string;
  category: SymptomCategory;
  hint: string;
  aliases: string[];
};

export type SymptomLink = {
  id: string;
  weight: 1 | 2 | 3;
  hallmark?: boolean;
};

export type Urgency = "self-care" | "clinic" | "urgent" | "emergency";

export type Sex = "female" | "male" | "unspecified";

export type AgeBand = "child" | "teen" | "adult" | "older";

export type Duration =
  | "under-2-days"
  | "2-to-7-days"
  | "1-to-4-weeks"
  | "more-than-a-month";

export type Disease = {
  id: string;
  name: string;
  system: string;
  summary: string;
  urgency: Urgency;
  /** Relative how often this pattern shows up. 1 is common, lower is less common. */
  prevalence: number;
  sex?: Exclude<Sex, "unspecified">;
  ageBoost?: Partial<Record<AgeBand, number>>;
  symptoms: SymptomLink[];
  against?: SymptomLink[];
  care: string;
  seekCare: string;
  course: string;
};

export type RedFlagRule = {
  id: string;
  title: string;
  message: string;
  action: string;
  /** Every group must meet its minimum. Groups are combined with AND. */
  groups: { ids: string[]; min: number }[];
};

export type SymptomMatch = {
  id: string;
  name: string;
  weight: number;
  hallmark: boolean;
};

export type DiseasePrediction = {
  id: string;
  name: string;
  system: string;
  summary: string;
  urgency: Urgency;
  confidence: number;
  coverage: number;
  matched: SymptomMatch[];
  missingHallmarks: SymptomMatch[];
  care: string;
  seekCare: string;
  course: string;
};

export type RedFlagHit = {
  id: string;
  title: string;
  message: string;
  action: string;
};

export type PredictionResult = {
  predictions: DiseasePrediction[];
  redFlags: RedFlagHit[];
  lowConfidence: boolean;
  recognized: { id: string; name: string }[];
  ignored: string[];
  context: {
    sex: Sex;
    ageBand: AgeBand | null;
    duration: Duration | null;
  };
};
