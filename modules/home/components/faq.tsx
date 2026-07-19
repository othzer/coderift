import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Do I need to install anything?",
    a: "No. Rigpaz runs a Node environment inside the browser tab using WebContainers, so installs and dev servers happen locally in your browser rather than on a server you have to wait for.",
  },
  {
    q: "Is my code private?",
    a: "Projects are private by default and scoped to your account. A project only becomes readable by others if you explicitly flip it to public, which generates a read-only share link.",
  },
  {
    q: "Which browsers are supported?",
    a: "Any modern Chromium-based browser or Firefox. The in-browser runtime depends on SharedArrayBuffer, so Safari support is limited.",
  },
  {
    q: "Can I bring an existing project?",
    a: "Yes — paste a public GitHub repository URL from the dashboard. Rigpaz fetches the tree, detects the framework and normalizes it into a playground.",
  },
  {
    q: "How does sign-in work?",
    a: "OAuth with GitHub or Google. There is no password to store, and both providers resolve to the same account when they share an email address.",
  },
  {
    q: "What powers the AI features?",
    a: "Chat runs on Groq and inline code completion runs on a Mistral model wired into the Monaco editor. Chat history is stored per playground so context follows the project.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Questions, answered
        </h2>
        <p className="mt-4 text-muted-foreground">
          Still curious? The{" "}
          <Link
            href="/docs"
            className="inline-flex items-center gap-0.5 text-primary underline-offset-4 hover:underline"
          >
            docs
            <ArrowUpRight className="size-3.5" />
          </Link>{" "}
          go deeper.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="mt-10 rounded-xl border border-border bg-card/60 px-5 backdrop-blur"
      >
        {FAQS.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q}>
            <AccordionTrigger className="text-left font-medium">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
