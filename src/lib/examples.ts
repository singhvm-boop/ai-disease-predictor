export type ExampleCase = {
  id: string;
  label: string;
  detail: string;
  symptoms: string[];
};

export const exampleCases: ExampleCase[] = [
  {
    id: "flu",
    label: "Sudden fever and aches",
    detail: "A flu-like cluster",
    symptoms: ["fever", "chills", "body-aches", "fatigue", "dry-cough", "headache"],
  },
  {
    id: "allergy",
    label: "Itchy eyes and sneezing",
    detail: "A seasonal allergy cluster",
    symptoms: ["sneezing", "runny-nose", "itchy-eyes", "watery-eyes", "nasal-congestion"],
  },
  {
    id: "uti",
    label: "Burning when urinating",
    detail: "A bladder infection cluster",
    symptoms: ["painful-urination", "urinary-urgency", "frequent-urination", "lower-abdominal-pain"],
  },
  {
    id: "migraine",
    label: "Headache with aura",
    detail: "A migraine cluster",
    symptoms: ["headache", "light-sensitivity", "sound-sensitivity", "nausea", "migraine-aura"],
  },
  {
    id: "asthma",
    label: "Wheeze and tight chest",
    detail: "An airway flare cluster",
    symptoms: ["wheezing", "chest-tightness", "shortness-of-breath", "dry-cough"],
  },
];
