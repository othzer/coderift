import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock, LayoutDashboard, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";

const TEMPLATE_ICONS: Record<string, string> = {
  REACT: "/react-icon.svg",
  NEXTJS: "/nextjs-icon.svg",
  VUE: "/vuejs-icon.svg",
  ANGULAR: "/angular-icon.svg",
  EXPRESS: "/expressjs-icon.svg",
  HONO: "/hono-icon.svg",
};

const QUICK_ACTIONS = [
  {
    href: "/dashboard",
    icon: Plus,
    title: "New project",
    description: "Start from a template or import a GitHub repo.",
  },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "All projects",
    description: "Browse, rename, duplicate and share your playgrounds.",
  },
  {
    href: "/docs",
    icon: BookOpen,
    title: "Docs",
    description: "Shortcuts, AI features and how the runtime works.",
  },
];

function formatUpdated(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export async function SignedInHome({ name }: { name?: string | null }) {
  const playgrounds = await getAllPlaygroundForUser();

  // Most recently touched first — this view is about resuming, not browsing.
  const recent = [...playgrounds]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[360px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <header>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome back{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {recent.length > 0
            ? "Pick up where you left off, or start something new."
            : "You don't have any projects yet — let's fix that."}
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="flex items-center gap-1 font-semibold">
              {title}
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="mt-14">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent projects
            </h2>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((project) => {
              const icon = TEMPLATE_ICONS[project.template];
              const starred = project.starmark?.[0]?.isMarked;

              return (
                <Link
                  key={project.id}
                  href={`/playground/${project.id}`}
                  className="group flex flex-col rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-200">
                      {icon ? (
                        <Image src={icon} alt="" aria-hidden height={22} width={22} />
                      ) : (
                        <span className="text-xs font-bold text-zinc-600">
                          {project.template.slice(0, 2)}
                        </span>
                      )}
                    </span>
                    {starred && (
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  <h3 className="mt-4 truncate font-semibold">{project.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {project.description || "No description"}
                  </p>

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Updated {formatUpdated(project.updatedAt)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="mt-14 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center backdrop-blur">
          <Image
            src="/empty-state.svg"
            alt=""
            aria-hidden
            height={160}
            width={160}
            className="mx-auto opacity-80"
          />
          <h2 className="mt-6 text-lg font-semibold">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first playground from a starter template, or import an
            existing repository from GitHub.
          </p>
          <Button asChild variant="brand" size="lg" className="mt-6">
            <Link href="/dashboard">
              Create a project
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
