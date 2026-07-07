"use client";

import { Search } from "lucide-react";

// A discoverable button that opens the app-wide command palette.
export function CommandPaletteTrigger() {
  const open = () =>
    window.dispatchEvent(new Event("rigpaz:open-command-palette"));

  return (
    <button
      onClick={open}
      aria-label="Open command palette"
      className="hidden md:inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search</span>
      <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px] leading-none">
        ⌘K
      </kbd>
    </button>
  );
}
