// Single source of truth for the chat models offered in the AI panel.
// Both the API route (server-side validation) and the chat UI (dropdown) import
// from here so the two can never drift out of sync.
//
// These run on Groq's free, OpenAI-compatible API. If Groq deprecates a model
// id, update it here and both the UI and the backend follow automatically.

export interface ChatModel {
  /** Groq model id sent to the API */
  id: string;
  /** Human-friendly label shown in the dropdown */
  label: string;
  /** Short hint about when to pick this model */
  hint: string;
  /**
   * Max tokens we allow for a single request (prompt + reserved completion).
   *
   * Groq's free "on_demand" tier bills a request against a per-minute token
   * budget (TPM) that counts BOTH the input and `max_tokens`. Exceeding it is a
   * hard 413, so we keep these values conservatively under the published TPM
   * limits. Raise them if the account moves to a paid tier.
   */
  requestTokenBudget: number;
}

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    hint: "Best overall reasoning",
    requestTokenBudget: 11_000,
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    hint: "Fastest responses",
    requestTokenBudget: 5_500,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    hint: "Strong for code",
    requestTokenBudget: 7_500,
  },
];

/** Request budget for a model id, falling back to the most conservative value. */
export function getRequestTokenBudget(modelId: string): number {
  return CHAT_MODELS.find((m) => m.id === modelId)?.requestTokenBudget ?? 5_500;
}

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].id;

export function isValidChatModel(model: string): boolean {
  return CHAT_MODELS.some((m) => m.id === model);
}
