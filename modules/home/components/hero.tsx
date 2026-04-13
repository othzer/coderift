import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "6", label: "Starter templates" },
  { value: "0", label: "Setup steps" },
  { value: "∞", label: "Projects per account" },
];

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-16 pb-20 text-center sm:pt-24">
      {/* Soft brand glow behind the hero. Purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <Link
        href="/docs"
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Sparkles className="size-3.5 text-primary" />
        <span>AI chat, inline completions and a live preview — in the browser</span>
        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      <Image
        src="/hero.svg"
        alt=""
        aria-hidden
        height={260}
        width={260}
        priority
        className="mb-8 drop-shadow-xl"
      />

      <h1 className="max-w-4xl bg-gradient-to-r from-primary via-indigo-500 to-blue-500 bg-clip-text text-5xl leading-[1.15] font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl dark:from-primary dark:via-indigo-400 dark:to-blue-400">
        Code editor with intelligence
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
        Spin up a real dev environment in a browser tab. Write, run and preview
        full-stack apps with an AI pair programmer that can actually read your
        files.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/dashboard">
          <Button variant="brand" size="lg" className="h-11 px-6 text-base">
            Start building free
            <ArrowUpRight className="size-4" />
          </Button>
        </Link>
        <Link href="/docs">
          <Button variant="outline" size="lg" className="h-11 px-6 text-base">
            <BookOpen className="size-4" />
            Read the docs
          </Button>
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Sign in with GitHub or Google — no card, no install.
      </p>

      <dl className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-border pt-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <dt className="text-3xl font-bold tracking-tight">{stat.value}</dt>
            <dd className="text-xs tracking-wide text-muted-foreground uppercase">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
