import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { LinkedinIcon } from "./components/linkedin-icon";

// TODO(othzer): swap these placeholders for the real otzr.labs handles.
const LINKEDIN_URL = "https://www.linkedin.com/in/your-handle";
const GITHUB_URL = "https://github.com/othzer";
const X_URL = "https://x.com/your-handle";
const CONTACT_EMAIL = "hello@otzrlabs.com";

const SOCIALS = [
  { href: GITHUB_URL, label: "GitHub", icon: SiGithub },
  { href: LINKEDIN_URL, label: "LinkedIn", icon: LinkedinIcon },
  { href: X_URL, label: "X", icon: SiX },
];

const LINK_GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Features", href: "/#features" },
      { label: "Templates", href: "/#templates" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "FAQ", href: "/#faq" },
      { label: "Shortcuts", href: "/docs#shortcuts" },
      { label: "Known limits", href: "/docs#limits" },
    ],
  },
  {
    heading: "otzr.labs",
    links: [
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "LinkedIn", href: LINKEDIN_URL, external: true },
      { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-20 mt-auto border-t border-border bg-background/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" aria-hidden height={36} width={36} />
              <span className="text-lg font-extrabold">Rigpaz</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An AI-powered code editor that runs a real dev environment in your
              browser. Write, run and preview — no setup.
            </p>

            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email otzr.labs"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
              >
                <Mail className="size-4" />
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold">{group.heading}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Rigpaz. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with{" "}
            <span aria-label="love" role="img">
              ❤️
            </span>{" "}
            by{" "}
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              otzr.labs
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
