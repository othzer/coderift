import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UserButton from "../auth/components/user-button";
import { CommandPaletteTrigger } from "@/components/command-palette-trigger";

export function Header() {
  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50">
        <div className="bg-white dark:bg-black/5 w-full">
          {/* Rest of the header content */}
          <div className="flex items-center justify-center w-full flex-col">
            <div
              className={`
                            flex items-center justify-between
                            bg-linear-to-b from-white/90 via-gray-50/90 to-white/90
                            dark:from-zinc-900/90 dark:via-zinc-800/90 dark:to-zinc-900/90
                            shadow-[0_2px_20px_-2px_rgba(0,0,0,0.1)]
                            backdrop-blur-md
                            border-x border-b 
                            border-[rgba(230,230,230,0.7)] dark:border-[rgba(70,70,70,0.7)]
                            w-full sm:min-w-[800px] sm:max-w-[1200px]
                            rounded-b-[28px]
                            px-4 py-2.5
                            relative
                            transition-all duration-300 ease-in-out
                        `}
            >
              <div className="relative z-10 flex items-center justify-between w-full gap-2">
                {/* Logo Section with Navigation Links */}
                <div className="flex items-center gap-6 justify-center">
                  <Link
                    href="/"
                    className="flex items-center gap-2 justify-center"
                  >
                    <Image
                      src={"/logo.svg"}
                      alt="Logo"
                      height={60}
                      width={60}
                    />

                    <span className="hidden sm:block font-extrabold text-lg">
                      Rigpaz
                    </span>
                  </Link>
                </div>

                {/* Right side items */}
                <div className="hidden sm:flex items-center gap-3">
                  <CommandPaletteTrigger />
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <ThemeToggle />
                  <Link href="/dashboard">
                    <Button variant="brand" size="sm">
                      Get Started
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <UserButton />
                </div>

                {/* Mobile Navigation */}
                <div className="flex sm:hidden items-center gap-3">
                  <ThemeToggle />
                  <Link href="/dashboard">
                    <Button variant="brand" size="sm">
                      Get Started
                    </Button>
                  </Link>
                  <UserButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
