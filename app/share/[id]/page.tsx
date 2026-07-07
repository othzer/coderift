import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicPlaygroundById } from "@/modules/playground/actions";
import ShareViewer from "@/modules/playground/components/share-viewer";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const playground = await getPublicPlaygroundById(id);
  if (!playground) return { title: "Shared playground" };
  return {
    title: `${playground.title} (shared)`,
    description: `A read-only Rigpaz playground shared by ${playground.user?.name ?? "a Rigpaz user"}.`,
  };
}

function parseTemplateData(raw: unknown): TemplateFolder | null {
  try {
    if (typeof raw === "string") return JSON.parse(raw) as TemplateFolder;
    if (raw && typeof raw === "object") return raw as TemplateFolder;
    return null;
  } catch {
    return null;
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const playground = await getPublicPlaygroundById(id);

  if (!playground) notFound();

  const templateData = parseTemplateData(playground.templateFiles?.[0]?.content);

  return (
    <ShareViewer
      title={playground.title}
      templateData={templateData}
      owner={playground.user}
    />
  );
}
