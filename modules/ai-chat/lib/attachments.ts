import type { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";

// Limits for file attachments in the AI chat. Enforced on BOTH the client
// (for UX) and the server (defense-in-depth so a crafted request can't blow
// the token budget / bill).
//
// Sized against Groq's free-tier per-minute token budget (~8K tokens for a
// whole request, including the reserved completion). Roughly 4 chars ≈ 1 token,
// so 12K chars ≈ 3K tokens of attachments — leaving room for the system prompt,
// recent history, and a useful-length reply.
export const MAX_ATTACHMENTS = 5;
export const MAX_CHARS_PER_FILE = 6_000;
export const MAX_TOTAL_CHARS = 12_000;

/** Rough token estimate — Groq/OpenAI tokenizers average ~4 chars per token. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Extensions we never attach — they're binary and would be UTF-8 garbage.
const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "avif",
  "woff", "woff2", "ttf", "eot", "otf",
  "pdf", "zip", "gz", "tar", "mp4", "webm", "mp3", "wav", "mov",
]);

export interface AttachableFile {
  /** Full path within the project, e.g. "src/App.tsx" */
  path: string;
  filename: string;
  extension: string;
  content: string;
}

/** An attachment as sent to the API (server rebuilds the prompt from these). */
export interface ChatAttachment {
  path: string;
  content: string;
}

export function isBinaryExtension(extension: string): boolean {
  return BINARY_EXTENSIONS.has(extension.toLowerCase());
}

/**
 * Flatten a template tree into a searchable, attachable file list.
 * Binary files are excluded.
 */
export function flattenProjectFiles(
  folder: TemplateFolder | null | undefined,
  basePath = ""
): AttachableFile[] {
  if (!folder?.items) return [];

  const files: AttachableFile[] = [];
  for (const item of folder.items) {
    if ("folderName" in item) {
      const nextBase = basePath
        ? `${basePath}/${item.folderName}`
        : item.folderName;
      files.push(...flattenProjectFiles(item, nextBase));
    } else {
      if (isBinaryExtension(item.fileExtension)) continue;
      const name = item.fileExtension
        ? `${item.filename}.${item.fileExtension}`
        : item.filename;
      files.push({
        path: basePath ? `${basePath}/${name}` : name,
        filename: item.filename,
        extension: item.fileExtension,
        content: item.content ?? "",
      });
    }
  }
  return files;
}

export interface BudgetResult {
  /** Attachments that fit, each already truncated to the per-file cap. */
  accepted: ChatAttachment[];
  /** Paths rejected because the total budget was already full. */
  rejectedPaths: string[];
  totalChars: number;
}

/**
 * Enforce the per-file and total-character caps over an ordered list of
 * attachments. Used by both client and server so the rules stay identical.
 */
export function applyAttachmentBudget(
  attachments: ChatAttachment[]
): BudgetResult {
  const accepted: ChatAttachment[] = [];
  const rejectedPaths: string[] = [];
  let totalChars = 0;

  for (const att of attachments.slice(0, MAX_ATTACHMENTS)) {
    let content = att.content ?? "";
    if (content.length > MAX_CHARS_PER_FILE) {
      content =
        content.slice(0, MAX_CHARS_PER_FILE) + "\n\n…[truncated]";
    }
    if (totalChars + content.length > MAX_TOTAL_CHARS) {
      rejectedPaths.push(att.path);
      continue;
    }
    totalChars += content.length;
    accepted.push({ path: att.path, content });
  }

  // Anything past MAX_ATTACHMENTS is also rejected.
  for (const att of attachments.slice(MAX_ATTACHMENTS)) {
    rejectedPaths.push(att.path);
  }

  return { accepted, rejectedPaths, totalChars };
}

// Map a file extension to a markdown code-fence language for better model
// comprehension / highlighting.
const FENCE_LANG: Record<string, string> = {
  ts: "ts", tsx: "tsx", js: "js", jsx: "jsx", mjs: "js", cjs: "js",
  json: "json", html: "html", css: "css", scss: "scss", sass: "scss",
  less: "less", md: "markdown", vue: "vue", svelte: "svelte",
  py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
  c: "c", cpp: "cpp", cs: "csharp", php: "php", sh: "bash",
  yml: "yaml", yaml: "yaml", toml: "toml", sql: "sql", svg: "xml",
};

function fenceLang(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return FENCE_LANG[ext] ?? "";
}

/**
 * Build the final message sent to the LLM: a labeled block of fenced code for
 * each attached file, followed by the user's actual message.
 */
export function buildMessageWithAttachments(
  userMessage: string,
  attachments: ChatAttachment[]
): string {
  if (attachments.length === 0) return userMessage;

  const blocks = attachments
    .map((att) => {
      const lang = fenceLang(att.path);
      return `--- ${att.path} ---\n\`\`\`${lang}\n${att.content}\n\`\`\``;
    })
    .join("\n\n");

  return `The user attached these project files for context:\n\n${blocks}\n\n---\n\n${userMessage}`;
}
