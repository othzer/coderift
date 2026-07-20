"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({
  links,
  isLoggedIn,
}: {
  links: { label: string; href: string }[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col gap-1 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <Button asChild variant="brand" size="lg" className="mt-4 w-full">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              {isLoggedIn ? "Go to dashboard" : "Get started"}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
