import { Button } from "@/components/ui/button";
import { diseases, getDisease, getSymptom } from "@/lib/knowledge";
import { urgencyDetail, urgencyLabel } from "@/lib/labels";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return diseases.map((disease) => ({ id: disease.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const disease = getDisease(id);
  if (!disease) return { title: "Condition not found" };
  return {
    title: disease.name,
    description: disease.summary,
  };
}

export default async function ConditionPage({ params }: Props) {
  const { id } = await params;
  const disease = getDisease(id);
  if (!disease) notFound();

  const hallmarkIds = disease.symptoms.filter((link) => link.hallmark).map((link) => link.id);
  const checkHref = `/?symptoms=${hallmarkIds.join(",")}`;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">{disease.system}</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">{disease.name}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{disease.summary}</p>
        <p className="mt-3 text-sm">
          <span className="font-medium">{urgencyLabel(disease.urgency)}.</span> {urgencyDetail(disease.urgency)}
        </p>
      </div>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="font-heading text-2xl">What usually happens</h2>
        <p className="mt-2 text-sm leading-relaxed">{disease.course}</p>
        <p className="mt-3 text-sm leading-relaxed">{disease.care}</p>
        <p className="mt-3 text-sm leading-relaxed">{disease.seekCare}</p>
      </section>

      <section>
        <h2 className="font-heading text-2xl">Symptoms in this pattern</h2>
        <ul className="mt-3 divide-y divide-border rounded-2xl bg-card ring-1 ring-foreground/10">
          {disease.symptoms
            .slice()
            .sort((a, b) => Number(b.hallmark) - Number(a.hallmark) || b.weight - a.weight)
            .map((link) => {
              const symptom = getSymptom(link.id);
              return (
                <li key={link.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{symptom?.name ?? link.id}</p>
                    <p className="text-xs text-muted-foreground">{symptom?.hint}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {link.hallmark ? "Hallmark" : "Associated"} · weight {link.weight}
                  </p>
                </li>
              );
            })}
        </ul>
      </section>

      {disease.against && disease.against.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl">Signs that argue against it</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {disease.against.map((link) => (
              <li key={link.id} className="rounded-full bg-muted px-3 py-1 text-xs">
                {getSymptom(link.id)?.name ?? link.id}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href={checkHref} />}>Check these hallmark symptoms</Button>
        <Button variant="outline" render={<Link href="/conditions" />}>
          Back to library
        </Button>
      </div>
    </article>
  );
}
