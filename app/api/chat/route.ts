import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CHAT_MODEL,
  getRequestTokenBudget,
  isValidChatModel,
} from "@/lib/ai-models";
import { rateLimit } from "@/lib/rate-limit";
import {
  applyAttachmentBudget,
  buildMessageWithAttachments,
  estimateTokens,
  type ChatAttachment,
} from "@/modules/ai-chat/lib/attachments";

// Completion sizing. Groq counts prompt + `max_tokens` against one per-minute
// budget, so the reply allowance has to flex with how big the prompt is.
const MIN_COMPLETION_TOKENS = 1_024;
const MAX_COMPLETION_TOKENS = 4_096;
const TOKEN_SAFETY_MARGIN = 250;

// Per-user limit so one account can't hammer the AI backend / burn the key.
const CHAT_RATE_LIMIT = 20;
const CHAT_RATE_WINDOW_MS = 60_000;

// Groq's OpenAI-compatible chat completions endpoint. Free, fast, and hosted —
// unlike the previous local-Ollama setup it works on a deployed instance.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  model?: string;
  playgroundId?: string;
  // The raw text the user typed (message may be wrapped with a mode prompt).
  // Persisted so reloaded history matches what the UI shows.
  displayContent?: string;
  // Project files the user attached for context.
  attachments?: ChatAttachment[];
}

const SYSTEM_PROMPT = `You are Rigpaz AI, an expert coding assistant embedded in an in-browser code editor.

You help developers with:
- Explaining and debugging code
- Writing clean, idiomatic, production-ready code
- Reviewing code for correctness, performance, and security
- Architecture and best-practice guidance

Guidelines:
- Be concise and practical. Lead with the answer, then explain only what's useful.
- Always use fenced code blocks with a language tag for code, and keep snippets minimal and runnable.
- When fixing code, show the corrected version and briefly say what was wrong.
- If a request is ambiguous, state the assumption you made instead of asking a long list of questions.
- Never invent APIs or libraries; if unsure, say so.`;

interface GroqResult {
  content: string;
  model: string;
  tokens?: number;
}

// Error thrown when the AI provider itself rejects the request, carrying the
// provider's status + message so the route can surface it to the user.
interface UpstreamError extends Error {
  isUpstream?: boolean;
  status?: number;
  providerMessage?: string;
}

async function generateAIResponse(
  messages: ChatMessage[],
  model: string,
  maxTokens: number
): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("NOT_CONFIGURED");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.6,
      // Sized by the caller from the model's remaining token budget.
      max_tokens: maxTokens,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`Groq API error (${response.status}):`, detail);
    // Extract the provider's own message (e.g. "Organization has been
    // restricted") so we can show the user something actionable instead of a
    // generic failure.
    let providerMessage = "";
    try {
      providerMessage = JSON.parse(detail)?.error?.message ?? "";
    } catch {
      /* non-JSON body */
    }
    const err: UpstreamError = new Error(
      providerMessage || `Upstream AI error (${response.status})`
    );
    err.isUpstream = true;
    err.status = response.status;
    err.providerMessage = providerMessage;
    throw err;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("No response from AI model");
  }

  // finish_reason "length" means the model hit the token ceiling and the reply
  // (often mid code block) is incomplete. Say so instead of silently returning
  // a half-written file.
  const truncated = data?.choices?.[0]?.finish_reason === "length";
  const body = truncated
    ? `${content.trim()}\n\n---\n\n_⚠️ Response was cut off at the length limit. Ask me to continue and I'll pick up where I left off._`
    : content.trim();

  return {
    content: body,
    model: data.model ?? model,
    tokens: data.usage?.total_tokens,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication so the AI backend can't be driven by anonymous callers.
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Throttle per user.
    const limit = rateLimit(
      `chat:${session.user.id}`,
      CHAT_RATE_LIMIT,
      CHAT_RATE_WINDOW_MS
    );
    if (!limit.success) {
      const retryAfter = Math.ceil((limit.reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: "You're sending messages too quickly. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body: ChatRequest = await req.json();
    const { message, history = [], model, playgroundId, displayContent, attachments } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Re-enforce the attachment caps server-side (client also enforces them for
    // UX), then fold the accepted files into the message sent to the model.
    const rawAttachments: ChatAttachment[] = Array.isArray(attachments)
      ? attachments.filter(
          (a) =>
            a &&
            typeof a === "object" &&
            typeof a.path === "string" &&
            typeof a.content === "string"
        )
      : [];
    const { accepted: acceptedAttachments } = applyAttachmentBudget(rawAttachments);
    const messageForModel = buildMessageWithAttachments(message, acceptedAttachments);
    const attachmentPaths = acceptedAttachments.map((a) => a.path);

    // Only allow known model ids; fall back to the default otherwise.
    const selectedModel =
      typeof model === "string" && isValidChatModel(model)
        ? model
        : DEFAULT_CHAT_MODEL;

    // Validate history format
    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            ["user", "assistant"].includes(msg.role)
        )
      : [];

    // --- Token budgeting ---------------------------------------------------
    // The whole request (prompt + reserved completion) has to fit the model's
    // per-request budget. Drop the oldest history turns to make room, and size
    // the reply allowance to whatever is left.
    const budget = getRequestTokenBudget(selectedModel);
    const fixedTokens =
      estimateTokens(SYSTEM_PROMPT) + estimateTokens(messageForModel);
    const historyTokens = (msgs: ChatMessage[]) =>
      msgs.reduce((n, m) => n + estimateTokens(m.content), 0);

    let recentHistory = validHistory.slice(-10);
    const inputTokens = () => fixedTokens + historyTokens(recentHistory);
    const floor = MIN_COMPLETION_TOKENS + TOKEN_SAFETY_MARGIN;

    while (recentHistory.length > 0 && inputTokens() + floor > budget) {
      recentHistory = recentHistory.slice(1); // drop the oldest turn
    }

    // Even with no history it doesn't fit — the message/attachments are simply
    // too big for this model. Say so precisely instead of letting Groq 413.
    if (inputTokens() + floor > budget) {
      return NextResponse.json(
        {
          error:
            `This message is too large for ${selectedModel} — roughly ${inputTokens()} tokens, ` +
            `and the per-request budget is ${budget}. Remove an attachment (or attach a smaller file), ` +
            `or switch to a model with a larger budget.`,
          timestamp: new Date().toISOString(),
        },
        { status: 413 }
      );
    }

    const maxTokens = Math.max(
      MIN_COMPLETION_TOKENS,
      Math.min(MAX_COMPLETION_TOKENS, budget - inputTokens() - TOKEN_SAFETY_MARGIN)
    );

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: messageForModel },
    ];

    const aiResponse = await generateAIResponse(
      messages,
      selectedModel,
      maxTokens
    );

    // Persist the exchange so the conversation survives a reload. Best-effort:
    // a DB hiccup must not fail the chat response the user already received.
    if (playgroundId && typeof playgroundId === "string" && session.user.id) {
      try {
        await db.chatMessage.createMany({
          data: [
            {
              userId: session.user.id,
              playgroundId,
              role: "user",
              content:
                typeof displayContent === "string" && displayContent.trim()
                  ? displayContent
                  : message,
              attachments: attachmentPaths,
            },
            {
              userId: session.user.id,
              playgroundId,
              role: "assistant",
              content: aiResponse.content,
            },
          ],
        });
      } catch (persistError) {
        console.error("Failed to persist chat messages:", persistError);
      }
    }

    return NextResponse.json({
      response: aiResponse.content,
      model: aiResponse.model,
      tokens: aiResponse.tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    // Missing key → a clear, actionable 503 rather than a generic 500.
    if (error instanceof Error && error.message === "NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "AI chat is not configured. Set GROQ_API_KEY to enable it (free at console.groq.com).",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // The AI provider rejected the request (bad key, restricted account, model
    // gone, etc.). Pass its message through so the user knows it's a provider/
    // account issue, not a bug in the app.
    const upstream = error as UpstreamError;
    if (upstream?.isUpstream) {
      return NextResponse.json(
        {
          error: upstream.providerMessage
            ? `AI provider error: ${upstream.providerMessage}`
            : "The AI provider rejected the request. Please try again later.",
          timestamp: new Date().toISOString(),
        },
        { status: upstream.status === 429 ? 429 : 502 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
