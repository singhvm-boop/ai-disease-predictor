# Meridian

Meridian is a healthcare support app that predicts **possible** conditions from symptoms a person reports. It is built for education and triage orientation. It does not diagnose, prescribe, or replace a clinician.

Enter symptoms, optionally add age band, sex, and duration, and the app ranks the closest patterns in its catalog. Each result shows the fit score, which signs matched, which hallmark signs are missing, and when to seek care. A separate set of rules raises an emergency banner for combinations such as stroke symptoms or chest pain with sweating and arm pain.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## How scoring works

The model lives in `src/lib/predict.ts` and the catalog in `src/lib/knowledge.ts`.

- Conditions have weighted symptoms. Hallmark signs count more.
- Common symptoms such as fatigue are down-weighted with inverse document frequency.
- Coverage, hallmark recall, contradictory symptoms, and a mild prevalence prior produce a raw score.
- A logistic curve maps that score to a **fit from 0 to 92**. The cap is intentional: the tool never claims certainty.
- Red-flag combinations are checked independently of the ranking.

The in-app Method page describes the same steps in plain language.

## API

`GET /api/predict` returns catalog counts.

`POST /api/predict`

```json
{
  "symptoms": ["fever", "body-aches", "fatigue", "dry-cough"],
  "sex": "unspecified",
  "ageBand": "adult",
  "duration": "2-to-7-days"
}
```

`sex` is `female`, `male`, or `unspecified`. `ageBand` is `child`, `teen`, `adult`, or `older`. `duration` is `under-2-days`, `2-to-7-days`, `1-to-4-weeks`, or `more-than-a-month`. Symptom ids are the `id` fields in `src/lib/knowledge.ts`.

The `confidence` field is the fit score, not a probability of disease.

## Limits

The catalog covers a few dozen common patterns. A condition that is absent cannot be predicted. Overlapping illnesses (cold, flu, COVID-19) will often rank close together, which is the honest result. History is stored only in the browser.

If someone may be having a stroke, a heart attack, anaphylaxis, or any other emergency, they should contact emergency services. In the US, call 911. For a mental health crisis, call or text 988.
