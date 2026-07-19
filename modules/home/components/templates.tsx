import Image from "next/image";

const TEMPLATES = [
  { name: "React", icon: "/react-icon.svg" },
  { name: "Next.js", icon: "/nextjs-icon.svg" },
  { name: "Vue", icon: "/vuejs-icon.svg" },
  { name: "Angular", icon: "/angular-icon.svg" },
  { name: "Express", icon: "/expressjs-icon.svg" },
  { name: "Hono", icon: "/hono-icon.svg" },
];

export function Templates() {
  return (
    <section id="templates" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start from a template
        </h2>
        <p className="mt-4 text-muted-foreground">
          Pick a stack and you get a working project with dependencies already
          declared. Or import any repo from GitHub.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {TEMPLATES.map((template) => (
          <div
            key={template.name}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Several of these marks are solid black, so they get a light chip
                of their own rather than disappearing in dark mode. */}
            <span className="flex size-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-200">
              <Image
                src={template.icon}
                alt=""
                aria-hidden
                height={28}
                width={28}
              />
            </span>
            <span className="text-sm font-medium">{template.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
