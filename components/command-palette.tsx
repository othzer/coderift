"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  LayoutDashboard,
  Plus,
  Moon,
  Sun,
  FileCode2,
} from "lucide-react";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";

interface PalettePlayground {
  id: string;
  title: string;
}

// App-wide command palette. Opens with Cmd/Ctrl+K.
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [playgrounds, setPlaygrounds] = useState<PalettePlayground[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    // Lets any button open the palette via window.dispatchEvent(new Event(...)).
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("rigpaz:open-command-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("rigpaz:open-command-palette", onOpen);
    };
  }, []);

  // Lazy-load the user's playgrounds the first time the palette opens.
  useEffect(() => {
    if (!open || loaded) return;
    getAllPlaygroundForUser()
      .then((data) => {
        setPlaygrounds(
          (data ?? []).map((p: { id: string; title: string }) => ({
            id: p.id,
            title: p.title,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [open, loaded]);

  const run = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
      <CommandInput placeholder="Type a command or search playgrounds…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/"))}>
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
            <Plus className="mr-2 h-4 w-4" />
            New Playground
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Toggle {resolvedTheme === "dark" ? "light" : "dark"} mode
          </CommandItem>
        </CommandGroup>

        {playgrounds.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Your Playgrounds">
              {playgrounds.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`playground ${p.title}`}
                  onSelect={() =>
                    run(() => router.push(`/playground/${p.id}`))
                  }
                >
                  <FileCode2 className="mr-2 h-4 w-4" />
                  {p.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
