import {
  Bot,
  Command,
  FileCode2,
  GitBranch,
  Share2,
  TerminalSquare,
  Wand2,
  Save,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "AI chat that reads your code",
    description:
      "Attach any file from the project and ask about it. Conversations are saved per playground, so context survives a refresh.",
  },
  {
    icon: Wand2,
    title: "Inline completions",
    description:
      "Ghost-text suggestions appear as you type, powered by a completion model wired straight into Monaco.",
  },
  {
    icon: TerminalSquare,
    title: "Real terminal, real install",
    description:
      "A WebContainer boots Node in the tab. npm install and dev servers run for real — nothing is faked.",
  },
  {
    icon: FileCode2,
    title: "Full Monaco editor",
    description:
      "The same editor core that powers VS Code, with a file tree, multi-tab editing and syntax support out of the box.",
  },
  {
    icon: GitBranch,
    title: "Import from GitHub",
    description:
      "Paste a repository URL and Rigpaz pulls it in, detects the framework and normalizes it into a playground.",
  },
  {
    icon: Share2,
    title: "Shareable links",
    description:
      "Flip a project to public and anyone can open a read-only view — no account needed on their end.",
  },
  {
    icon: Save,
    title: "Autosave",
    description:
      "Edits persist as you go. Close the tab mid-thought and pick the project back up exactly where you left it.",
  },
  {
    icon: Command,
    title: "Command palette",
    description:
      "Hit ⌘K / Ctrl+K to jump between projects, create something new or flip the theme without leaving the keyboard.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need in one tab
        </h2>
        <p className="mt-4 text-muted-foreground">
          No local toolchain, no Docker, no waiting on a container to warm up.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group relative rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Icon className="size-5" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
