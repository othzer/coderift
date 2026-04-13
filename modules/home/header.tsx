import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UserButton from "../auth/components/user-button";
import { CommandPaletteTrigger } from "@/components/command-palette-trigger";
import { MobileNav } from "./components/mobile-nav";
import { currentUser } from "@/modules/auth/actions";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#templates" },
  { label: "Docs", href: "/docs" },
];

export async function Header() {
  const user = await currentUser();
  const isLoggedIn = !!user;

  return (
    <div className="sticky top-0 right-0 left-0 z-50">
      <div className="flex w-full flex-col items-center justify-center">
        <div
          className="relative flex w-full items-center justify-between rounded-b-[28px] border-x border-b border-[rgba(230,230,230,0.7)] bg-gradient-to-b from-white/80 via-gray-50/80 to-white/80 px-4 py-2.5 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 ease-in-out sm:max-w-[1200px] sm:min-w-[800px] dark:border-[rgba(70,70,70,0.7)] dark:from-zinc-900/80 dark:via-zinc-800/80 dark:to-zinc-900/80"
        >
          <div className="relative z-10 flex w-full items-center justify-between gap-2">
            {/* Logo + primary nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="" aria-hidden height={40} width={40} />
                <span className="hidden text-lg font-extrabold sm:block">
                  Rigpaz
                </span>
              </Link>

              <nav className="hidden items-center gap-6 md:flex">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-3 sm:flex">
              <CommandPaletteTrigger />
              <ThemeToggle />
              <Link href="/dashboard">
                <Button variant="brand" size="sm">
                  {isLoggedIn ? "Dashboard" : "Get started"}
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </Link>
              {isLoggedIn && <UserButton />}
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-1 sm:hidden">
              <ThemeToggle />
              {isLoggedIn && <UserButton />}
              <MobileNav links={NAV_LINKS} isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
