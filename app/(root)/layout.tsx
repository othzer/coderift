import { Metadata } from "next";
import { Header } from "@/modules/home/header";
import { Footer } from "@/modules/home/footer";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  // Only the title template lives here — child pages (e.g. Docs) need it to
  // render as "Docs | Rigpaz". Everything else is inherited from the root
  // layout so the branding has one source of truth.
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.title,
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Decorative grid backdrop. Fixed rather than absolute so it stays put
          behind long pages instead of scrolling away after one viewport. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-0 -z-10",
          "[background-size:25px_25px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"
      />

      <Header />

      <main className="relative z-10 w-full flex-1">{children}</main>

      <Footer />
    </div>
  );
}
