import { Metadata } from "next";
import { Header } from "@/modules/home/header";
import { Footer } from "@/modules/home/footer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  //for better SEO and page titles (basically better UX)
  title: {
    template: "%s | Rigpaz",
    default: "Rigpaz | AI Vibe Code Editor",
  },
  description:
    "Rigpaz is a powerful online AI powered vibe code editor that allows you to write, edit, and run code right in your browser. With its intuitive interface and advanced features, Rigpaz is the perfect tool for developers of all skill levels.",
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
