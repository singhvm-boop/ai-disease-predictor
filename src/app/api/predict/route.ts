import { diseases, symptoms } from "@/lib/knowledge";
import { parsePredictBody, predict } from "@/lib/predict";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    name: "Meridian disease prediction",
    symptoms: symptoms.length,
    conditions: diseases.length,
    note: "Pattern-fit scores are educational support, not a diagnosis or a probability.",
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }

  const parsed = parsePredictBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  return NextResponse.json(predict(parsed.value));
}
