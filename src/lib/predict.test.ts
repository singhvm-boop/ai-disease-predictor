import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diseases, redFlagRules, symptoms } from "./knowledge";
import { parsePredictBody, predict } from "./predict";

const symptomIds = new Set(symptoms.map((symptom) => symptom.id));

describe("knowledge integrity", () => {
  it("uses unique symptom and disease ids", () => {
    assert.equal(symptomIds.size, symptoms.length);
    const diseaseIds = diseases.map((disease) => disease.id);
    assert.equal(new Set(diseaseIds).size, diseaseIds.length);
  });

  it("only references symptoms that exist", () => {
    for (const disease of diseases) {
      for (const link of [...disease.symptoms, ...(disease.against ?? [])]) {
        assert.ok(symptomIds.has(link.id), `${disease.id} references missing symptom ${link.id}`);
      }
      assert.ok(disease.symptoms.some((link) => link.hallmark), `${disease.id} needs a hallmark`);
    }
    for (const rule of redFlagRules) {
      for (const group of rule.groups) {
        for (const id of group.ids) {
          assert.ok(symptomIds.has(id), `${rule.id} references missing symptom ${id}`);
        }
      }
    }
  });
});

describe("predict", () => {
  it("ranks influenza first for a classic flu cluster", () => {
    const result = predict({
      symptoms: ["fever", "chills", "body-aches", "fatigue", "dry-cough", "headache"],
    });
    assert.equal(result.predictions[0]?.id, "influenza");
    assert.equal(result.lowConfidence, false);
    assert.equal(result.redFlags.length, 0);
  });

  it("ranks allergic rhinitis first for itch and sneezing", () => {
    const result = predict({
      symptoms: ["sneezing", "runny-nose", "itchy-eyes", "watery-eyes", "nasal-congestion"],
    });
    assert.equal(result.predictions[0]?.id, "allergic-rhinitis");
    assert.ok(result.predictions.every((item) => item.id !== "influenza" || item.confidence < result.predictions[0]!.confidence));
  });

  it("ranks a bladder infection first for urinary burning", () => {
    const result = predict({
      symptoms: ["painful-urination", "urinary-urgency", "frequent-urination", "lower-abdominal-pain"],
    });
    assert.equal(result.predictions[0]?.id, "uti");
  });

  it("ranks asthma first for wheeze without fever", () => {
    const result = predict({
      symptoms: ["wheezing", "chest-tightness", "shortness-of-breath", "dry-cough"],
    });
    assert.equal(result.predictions[0]?.id, "asthma");
    assert.equal(result.redFlags.some((flag) => flag.id === "anaphylaxis"), false);
  });

  it("keeps appendicitis near the top when lower right pain is present", () => {
    const result = predict({
      symptoms: ["lower-right-abdominal-pain", "loss-of-appetite", "nausea", "fever", "vomiting"],
    });
    assert.ok(result.predictions.slice(0, 2).some((item) => item.id === "appendicitis"));
    assert.ok(result.redFlags.some((flag) => flag.id === "appendicitis-flag"));
  });

  it("ranks reflux first for heartburn and regurgitation", () => {
    const result = predict({
      symptoms: ["heartburn", "acid-regurgitation", "upper-abdominal-pain"],
    });
    assert.equal(result.predictions[0]?.id, "gerd");
  });

  it("ranks migraine first when aura and light sensitivity are present", () => {
    const result = predict({
      symptoms: ["headache", "light-sensitivity", "sound-sensitivity", "nausea", "migraine-aura"],
    });
    assert.equal(result.predictions[0]?.id, "migraine");
  });

  it("hides menstrual cramps when sex is male", () => {
    const result = predict({
      sex: "male",
      symptoms: ["menstrual-cramps", "lower-abdominal-pain", "fatigue", "nausea"],
    });
    assert.ok(result.predictions.every((item) => item.id !== "dysmenorrhea"));
  });

  it("shows menstrual cramps for the same pattern when sex is female", () => {
    const result = predict({
      sex: "female",
      symptoms: ["menstrual-cramps", "lower-abdominal-pain", "fatigue"],
    });
    assert.equal(result.predictions[0]?.id, "dysmenorrhea");
  });

  it("raises a stroke flag without calling it a routine headache", () => {
    const result = predict({
      symptoms: ["speech-difficulty", "facial-droop", "one-sided-weakness", "headache"],
    });
    assert.ok(result.redFlags.some((flag) => flag.id === "stroke"));
  });

  it("does not raise a heart attack flag for cough alone", () => {
    const result = predict({ symptoms: ["cough", "fatigue", "runny-nose"] });
    assert.equal(result.redFlags.some((flag) => flag.id === "heart-attack"), false);
  });

  it("raises a heart attack flag for chest pain with sweating and arm pain", () => {
    const result = predict({
      symptoms: ["chest-pain", "sweating", "arm-pain", "shortness-of-breath"],
    });
    assert.ok(result.redFlags.some((flag) => flag.id === "heart-attack"));
  });

  it("marks a single vague symptom as low confidence", () => {
    const result = predict({ symptoms: ["fatigue"] });
    assert.equal(result.lowConfidence, true);
  });

  it("sorts confidences and keeps them inside 0 to 92", () => {
    const result = predict({
      symptoms: ["fever", "productive-cough", "shortness-of-breath", "chills", "chest-pain"],
    });
    const confidences = result.predictions.map((item) => item.confidence);
    assert.deepEqual(confidences, [...confidences].sort((a, b) => b - a));
    for (const confidence of confidences) {
      assert.ok(confidence >= 0 && confidence <= 92);
    }
    assert.equal(result.predictions[0]?.id, "pneumonia");
  });

  it("ignores unknown symptom ids", () => {
    const result = predict({ symptoms: ["fever", "not-a-real-symptom", "body-aches", "chills", "fatigue"] });
    assert.deepEqual(result.ignored, ["not-a-real-symptom"]);
    assert.ok(result.recognized.some((symptom) => symptom.id === "fever"));
  });

  it("returns no predictions when nothing is recognized", () => {
    const result = predict({ symptoms: ["nope"] });
    assert.equal(result.predictions.length, 0);
    assert.equal(result.lowConfidence, true);
  });

  it("rejects a missing symptoms array", () => {
    const parsed = parsePredictBody({ sex: "female" });
    assert.equal(parsed.ok, false);
  });

  it("accepts a bounded symptom list", () => {
    const parsed = parsePredictBody({ symptoms: ["fever", "cough"], sex: "female", ageBand: "adult" });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.deepEqual(parsed.value.symptoms, ["fever", "cough"]);
  });
});
