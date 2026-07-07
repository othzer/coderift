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
}

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    hint: "Best overall reasoning",
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    hint: "Fastest responses",
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    hint: "Strong for code",
  },
];

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].id;

export function isValidChatModel(model: string): boolean {
  return CHAT_MODELS.some((m) => m.id === model);
}
