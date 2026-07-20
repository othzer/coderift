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

export const GITHUB_REPO_URL = "https://github.com/othzer/rigpaz";
export const GITHUB_URL = "https://github.com/othzer";

// TODO(othzer): placeholders — replace with the real otzr.labs handles.
export const LINKEDIN_URL = "https://www.linkedin.com/in/your-handle";
export const X_URL = "https://x.com/your-handle";
export const CONTACT_EMAIL = "hello@otzrlabs.com";
