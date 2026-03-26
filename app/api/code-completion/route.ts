import { CompletionCopilot } from "monacopilot";
import { type NextRequest, NextResponse } from "next/server";

const copilot = new CompletionCopilot(process.env.MISTRAL_API_KEY, {
  provider: "mistral",
  model: "codestral",
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const completion = await copilot.complete({ body });
  return NextResponse.json(completion);
}
