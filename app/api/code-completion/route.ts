import {
  CompletionCopilot,
  type CompletionMetadata,
} from "monacopilot";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

// Higher than chat since inline completions fire frequently as you type.
const COMPLETION_RATE_LIMIT = 60;
const COMPLETION_RATE_WINDOW_MS = 60_000;

// Instantiate lazily instead of at module load. CompletionCopilot throws when
// the API key is missing, and doing that at import time would crash the whole
// route (and the production build's page-data collection).
let copilot: CompletionCopilot | null = null;

function getCopilot(): CompletionCopilot | null {
  if (!process.env.MISTRAL_API_KEY) return null;
  if (!copilot) {
    copilot = new CompletionCopilot(process.env.MISTRAL_API_KEY, {
      provider: "mistral",
      model: "codestral",
    });
  }
  return copilot;
}

// A focused instruction meaningfully improves inline-completion quality: it
// forces raw code out (no markdown fences / prose), keeps the model from
// rewriting existing code, and nudges it toward the file's language and stack.
function buildInstruction(metadata: CompletionMetadata): string {
  const language = metadata.language || "code";
  const technologies = metadata.technologies?.length
    ? metadata.technologies.join(", ")
    : "";
  const filename = metadata.filename ? ` in \`${metadata.filename}\`` : "";

  return [
    `You are an expert pair programmer providing an inline ${language} completion${filename}.`,
    `Continue the code exactly at the cursor.`,
    ``,
    `Rules:`,
    `- Output ONLY the raw code to insert at the cursor. No explanations, no markdown code fences, no surrounding quotes.`,
    `- Do not repeat the code that already appears before the cursor, and do not restate code that comes after it.`,
    `- Complete the smallest meaningful unit (finish the current expression, line, or block). Do not rewrite existing code.`,
    `- Match the file's existing indentation, quote style, and naming conventions.`,
    technologies
      ? `- Prefer idiomatic ${language} using ${technologies}.`
      : `- Prefer idiomatic ${language}.`,
    `- The result must be syntactically valid when inserted between the text before and after the cursor.`,
    `- If the cursor is inside a string or comment, continue it naturally instead of writing code.`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  // Require a logged-in user so this can't be used as a free relay to the
  // paid Mistral API on our key.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Throttle per user.
  const limit = rateLimit(
    `completion:${session.user.id}`,
    COMPLETION_RATE_LIMIT,
    COMPLETION_RATE_WINDOW_MS
  );
  if (!limit.success) {
    const retryAfter = Math.ceil((limit.reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const completionClient = getCopilot();
  if (!completionClient) {
    return NextResponse.json(
      { error: "Code completion is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const completion = await completionClient.complete({
      body,
      options: {
        // Override only the instruction; monacopilot still builds the code
        // context (text before/after cursor, related files) for us.
        customPrompt: (metadata) => ({
          instruction: buildInstruction(metadata),
        }),
      },
    });
    return NextResponse.json(completion);
  } catch (error) {
    console.error("Code completion error:", error);
    return NextResponse.json(
      { error: "Failed to generate completion" },
      { status: 500 }
    );
  }
}
