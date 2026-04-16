const STEPS = [
  {
    step: "01",
    title: "Sign in",
    description:
      "GitHub or Google. Sign in with either and you land in the same account — they're matched by email.",
  },
  {
    step: "02",
    title: "Pick a stack or import a repo",
    description:
      "Choose one of six starters, or paste a GitHub URL and let Rigpaz detect the framework for you.",
  },
  {
    step: "03",
    title: "Build with the AI beside you",
    description:
      "Edit in Monaco, run commands in a real terminal, attach files to the chat and watch the preview update live.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          From zero to running in under a minute
        </h2>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((item) => (
          <li
            key={item.step}
            className="relative rounded-xl border border-border bg-card/60 p-6 backdrop-blur"
          >
            <span className="font-mono text-4xl font-bold text-primary/25">
              {item.step}
            </span>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
