import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 px-6 py-16 text-center backdrop-blur">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[600px] max-w-full rounded-full bg-primary/20 blur-[100px]"
        />

        <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
          Your next project is one click away
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
          Open a tab, pick a stack, start typing. That&apos;s the whole setup.
        </p>

        <div className="relative mt-8 flex justify-center">
          <Link href="/dashboard">
            <Button variant="brand" size="lg" className="h-11 px-6 text-base">
              Start building free
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
