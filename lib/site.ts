// Single source of truth for branding, canonical URLs and contact destinations.
// Anything user-facing that names the product or links off-site reads from here
// so it can't drift between the header, footer, docs and metadata.

export const siteConfig = {
  name: "Rigpaz",
  title: "Rigpaz | AI-powered Code Editor",
  description:
    "Rigpaz is an AI-powered code editor — write, run, and preview code right in your browser.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const GITHUB_REPO_URL = process.env.MY_GITHUB_REPO ?? "";
export const GITHUB_URL = process.env.MY_GITHUB ?? "";

// TODO(othzer): placeholders — replace with the real otzr.labs handles.
export const LINKEDIN_URL = process.env.MY_LINKEDIN ?? "";
export const X_URL = process.env.MY_X ?? "";
export const CONTACT_EMAIL = process.env.MY_EMAIL ?? "";
