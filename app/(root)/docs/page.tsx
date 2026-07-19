import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How Rigpaz works — templates, the in-browser runtime, AI chat and completions, sharing, and keyboard shortcuts.",
};

const SECTIONS = [
  { id: "getting-started", title: "Getting started" },
  { id: "projects", title: "Projects & templates" },
  { id: "editor", title: "The editor" },
  { id: "runtime", title: "Runtime & preview" },
  { id: "ai", title: "AI features" },
  { id: "sharing", title: "Sharing" },
  { id: "shortcuts", title: "Shortcuts" },
  { id: "limits", title: "Known limits" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border pt-10">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-24">
      <header className="mb-12">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Documentation
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          How Rigpaz works
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A short tour of the editor, the in-browser runtime and the AI
          features — enough to get productive in a few minutes.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
        {/* On-page nav. Sticky on desktop, inline above the content on mobile. */}
        <nav className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            On this page
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-10">
          <Section id="getting-started" title="Getting started">
            <p>
              Sign in with GitHub or Google — there is no password to create.
              Both providers resolve to the same account when they share an
              email address, so you can use whichever is convenient.
            </p>
            <p>
              After signing in you land on the dashboard, where you create your
              first project. Nothing needs to be installed on your machine.
            </p>
            <Link href="/dashboard" className="inline-block">
              <Button variant="brand">
                Open the dashboard
                <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          </Section>

          <Section id="projects" title="Projects & templates">
            <p>
              A <strong className="text-foreground">playground</strong> is one
              project: its files, its chat history and its settings. Create one
              from a starter template — React, Next.js, Vue, Angular, Express or
              Hono — and it arrives with dependencies already declared.
            </p>
            <p>
              You can also import an existing public repository. Paste its
              GitHub URL from the dashboard and Rigpaz fetches the tree, detects
              the framework and normalizes it into a playground.
            </p>
            <p>
              Projects can be renamed, duplicated, starred and deleted from the
              dashboard table. Everything is scoped to your account.
            </p>
          </Section>

          <Section id="editor" title="The editor">
            <p>
              Rigpaz uses Monaco, the same editor core that powers VS Code, so
              syntax highlighting, multi-cursor editing and the familiar
              keybindings all work as you&apos;d expect.
            </p>
            <p>
              The file tree on the left supports creating, renaming and deleting
              files and folders. Open files become tabs. Edits autosave as you
              work, so closing the tab mid-thought doesn&apos;t lose anything.
            </p>
          </Section>

          <Section id="runtime" title="Runtime & preview">
            <p>
              Your project runs in a{" "}
              <strong className="text-foreground">WebContainer</strong> — a Node
              environment running inside the browser tab itself, not on a remote
              server. Dependency installs and dev servers execute locally, which
              is why there is no cold start to wait through.
            </p>
            <p>
              The terminal panel is a real shell against that environment. The
              preview pane points at whatever dev server your project starts,
              and refreshes as you edit.
            </p>
            <p>
              Because the runtime lives in the browser, everything resets when
              you close the tab. Your <em>files</em> persist to the database;
              the running process does not.
            </p>
          </Section>

          <Section id="ai" title="AI features">
            <p>
              <strong className="text-foreground">Chat</strong> lives in a side
              panel and runs on Groq. You can attach files from the current
              project to a message, which is how you give the model real context
              instead of describing your code to it. Conversations are stored
              per playground, so each project keeps its own thread.
            </p>
            <p>
              <strong className="text-foreground">Inline completion</strong> runs
              on a Mistral model wired directly into Monaco. Suggestions appear
              as ghost text while you type — press <Kbd>Tab</Kbd> to accept.
            </p>
          </Section>

          <Section id="sharing" title="Sharing">
            <p>
              Projects are private by default. Toggling one to public generates a
              read-only share link that anyone can open without an account —
              useful for showing work in a portfolio or a code review.
            </p>
            <p>
              Public means readable, not writable. Visitors can browse the files;
              only you can edit them.
            </p>
          </Section>

          <Section id="shortcuts" title="Shortcuts">
            <ul className="space-y-3">
              <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/60 px-4 py-3 backdrop-blur">
                <span>Open the command palette</span>
                <span className="flex shrink-0 gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </li>
              <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/60 px-4 py-3 backdrop-blur">
                <span>Accept an inline suggestion</span>
                <Kbd>Tab</Kbd>
              </li>
              <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/60 px-4 py-3 backdrop-blur">
                <span>Save the current file</span>
                <span className="flex shrink-0 gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>S</Kbd>
                </span>
              </li>
            </ul>
            <p className="text-sm">
              On Windows and Linux, use <Kbd>Ctrl</Kbd> wherever <Kbd>⌘</Kbd> is
              shown.
            </p>
          </Section>

          <Section id="limits" title="Known limits">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                The in-browser runtime needs SharedArrayBuffer, so Safari
                support is limited. Use a Chromium browser or Firefox.
              </li>
              <li>
                Imports work with public GitHub repositories. Private repos are
                not supported yet.
              </li>
              <li>
                Native or platform-specific npm packages may not install, since
                the runtime is WebAssembly rather than a real OS.
              </li>
            </ul>
          </Section>

          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur">
            <h2 className="font-semibold">Something missing?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open an issue on GitHub and it&apos;ll get looked at.
            </p>
            <Link
              href="https://github.com/othzer/coderift"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              <Button variant="outline">
                Report an issue
                <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
