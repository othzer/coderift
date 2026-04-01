"use client";

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "sonner";
import TemplateSelectionModal from "./template-selecting-modal";
import { createProject, importGithubRepo } from "../actions";

const AddRepo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    template: "REACT" | "NEXTJS" | "VUE" | "EXPRESS" | "HONO" | "ANGULAR";
    description?: string;
  }) => {
    try {
      const res = await createProject(data);
      if (!res?.id) throw new Error("No playground returned");
      toast.success("Playground created successfully");
      setIsModalOpen(false);
      router.push(`/playground/${res.id}`);
    } catch (error) {
      console.error("Failed to create playground:", error);
      toast.error("Failed to create playground");
    }
  }

  const handleImportGithub = async (data: { repoUrl: string; title?: string }) => {
    const res = await importGithubRepo(data);
    toast.success("Repository imported successfully");
    setIsModalOpen(false);
    router.push(`/playground/${res.id}`);
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-card cursor-pointer
        transition-all duration-300 ease-in-out
        hover:bg-card hover:border-primary hover:scale-[1.02]
        shadow-sm hover:shadow-lg hover:shadow-primary/10"
      >
        <div className="flex flex-row justify-center items-start gap-4">
          <Button
            variant={"outline"}
            className="flex justify-center items-center group-hover:border-primary group-hover:text-primary transition-colors duration-300"
            size={"icon"}
          >
            <ArrowDown size={30} className="transition-transform duration-300 group-hover:translate-y-1" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary">Open Github Repository</h1>
            <p className="text-sm text-muted-foreground max-w-[220px]">Work with your repositories in our editor</p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <Image
            src={"/github.svg"}
            alt="Open GitHub repository"
            width={150}
            height={150}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      <TemplateSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onImportGithub={handleImportGithub}
        initialMode="github"
      />
    </>
  )
}

export default AddRepo
