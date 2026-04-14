<div align="center">
  <img src="public/logo.svg" alt="Rigpaz" width="72" height="72" />
  <h1>Rigpaz</h1>
  <p><strong>An AI-powered code editor that runs a real dev environment in your browser.</strong></p>
</div>

Rigpaz gives you a full playground per project: a Monaco editor, a real Node
runtime via WebContainers, a terminal, a live preview, and an AI assistant that
can read the files you attach to it. No local toolchain, no containers to warm
up.

## Features

- **AI chat with file attachments** — attach project files to a message so the
  model answers about your actual code. History is stored per playground.
- **Inline completions** — ghost-text suggestions wired into Monaco.
- **Real runtime** — a WebContainer boots Node in the tab; `npm install` and dev
  servers genuinely run.
- **Six starter templates** — React, Next.js, Vue, Angular, Express, Hono.
- **GitHub import** — paste a public repo URL and it's normalized into a playground.
- **Share links** — flip a project public for a read-only view, no account needed.
- **Autosave** and a **⌘K command palette**.

## Stack

| Layer    | Choice                                              |
| -------- | --------------------------------------------------- |
| Framework| Next.js 16 (App Router, Turbopack)                  |
| UI       | React 19, Tailwind CSS v4, shadcn/ui                |
| Editor   | Monaco + monacopilot                                |
| Runtime  | `@webcontainer/api`, xterm.js                       |
| Auth     | Auth.js v5 (GitHub + Google OAuth)                  |
| Data     | Prisma + MongoDB                                    |
| AI       | Groq (chat), Mistral Codestral (completion)         |

## Getting started

```bash
git clone https://github.com/othzer/rigpaz.git
cd rigpaz
npm install
cp .env.example .env   # then fill in the values
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Every variable is documented in [`.env.example`](.env.example). You'll need a
MongoDB connection string, an `AUTH_SECRET` (`npx auth secret`), OAuth
credentials for GitHub and/or Google, and free API keys from
[Groq](https://console.groq.com) and [Mistral](https://console.mistral.ai).

## Scripts

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `npm run dev`   | Dev server with Turbopack          |
| `npm run build` | Production build                   |
| `npm start`     | Serve the production build         |
| `npm run lint`  | ESLint                             |

## Browser support

The runtime depends on `SharedArrayBuffer`, so use a Chromium-based browser or
Firefox. Safari support is limited.

## Docs

User-facing documentation — templates, the runtime, AI features, shortcuts and
known limits — is served from the app at `/docs`.

## License

MIT

---

Made with ❤️ by otzr.labs
