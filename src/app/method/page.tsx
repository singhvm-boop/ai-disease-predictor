import { diseases, symptoms } from "@/lib/knowledge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Meridian scores symptoms",
  description: "The transparent pattern-matching model behind Meridian's disease predictions.",
};

export default function MethodPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Method</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">A transparent pattern match, not a black box</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Meridian scores {diseases.length} condition patterns against {symptoms.length} symptoms. The fit score is a bounded similarity measure. It is not the probability that you have a disease, and it is not a diagnosis.
        </p>
      </div>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-heading text-2xl">What the model does</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Each condition carries associated symptoms with weights from 1 to 3. Hallmark signs count extra.</li>
          <li>Symptoms that appear in many conditions count less, using inverse document frequency, so fatigue moves the ranking less than a distinctive sign such as visual aura or loss of smell.</li>
          <li>Coverage is the share of that condition&apos;s weighted pattern you actually reported.</li>
          <li>Hallmark recall asks whether the signs most tied to the condition are present.</li>
          <li>Contradictory symptoms, such as fever during a typical allergy pattern, reduce the score.</li>
          <li>A mild prior favors conditions that are more common when two patterns otherwise look similar. Age can nudge a few conditions, such as ear infection in children or shingles in older adults.</li>
          <li>The raw score passes through a logistic curve and is capped at 92 so the interface never presents certainty.</li>
        </ol>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-heading text-2xl">Red flags are separate</h2>
        <p>
          Combinations such as facial droop, chest pain with sweating and arm pain, or fever with neck stiffness and a sudden severe headache raise an emergency banner before you read the ranking. Those rules do not depend on which condition scored highest.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="font-heading text-2xl">What it will not do</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>It does not examine you, order tests, or read images.</li>
          <li>It does not prescribe or dose medicine.</li>
          <li>It does not cover every disease. A missing condition is not evidence against that condition.</li>
          <li>A high fit can still be the wrong explanation. Several illnesses share cough, fever, and fatigue.</li>
          <li>Sex only hides menstrual cramps when male is selected. Leaving sex unspecified keeps that pattern available.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-card p-5 text-sm leading-relaxed ring-1 ring-foreground/10">
        <h2 className="font-heading text-2xl">Using the API</h2>
        <p className="mt-2">
          <code className="rounded bg-muted px-1.5 py-0.5">POST /api/predict</code> accepts JSON:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-foreground p-4 text-xs leading-relaxed text-background">{`{
  "symptoms": ["fever", "dry-cough", "fatigue"],
  "sex": "unspecified",
  "ageBand": "adult",
  "duration": "2-to-7-days"
}`}</pre>
        <p className="mt-3">
          <code className="rounded bg-muted px-1.5 py-0.5">GET /api/predict</code> returns catalog counts. Symptom ids are listed in the library and in <code className="rounded bg-muted px-1.5 py-0.5">src/lib/knowledge.ts</code>.
        </p>
      </section>
    </article>
  );
}
