import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CHAT_MODEL,
  isValidChatModel,
} from "@/lib/ai-models";
import { rateLimit } from "@/lib/rate-limit";

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

async function generateAIResponse(
  messages: ChatMessage[],
  model: string
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
      max_tokens: 1024,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`Groq API error (${response.status}):`, detail);
    throw new Error(`Upstream AI error (${response.status})`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("No response from AI model");
  }

  return {
    content: content.trim(),
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
    const { message, history = [], model, playgroundId, displayContent } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

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

    const recentHistory = validHistory.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    const aiResponse = await generateAIResponse(messages, selectedModel);

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
