import {
  readTemplateStructureFromJson,
  saveTemplateStructureToJson,
} from "@/modules/playground/lib/path-to-json";
import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import { auth } from "@/auth";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import { NextRequest } from "next/server";

function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data)); // Ensures it's serializable
    return true;
  } catch (error) {
    console.error("Invalid JSON structure:", error);
    return false;
  }
}

export async function GET(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
const {id} = await params;

  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if(!id){
    return Response.json({ error: "Missing playground ID" }, { status: 400 });
  }

  const playground = await db.playground.findUnique({
    where:{id}
  })

  if (!playground) {
    return Response.json({ error: "Playground not found" }, { status: 404 });
  }

  // Ownership check — a user may only generate the template for their own playground.
  if (playground.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const templateKey = playground.template as keyof typeof templatePaths;
  const templatePath = templatePaths[templateKey]

  if (!templatePath) {
    return Response.json({ error: "Invalid template" }, { status: 404 });
  }

  try {
    const inputPath = path.join(process.cwd() , templatePath);
    // Use a unique file in the OS temp dir so concurrent requests don't clobber
    // each other's output (the old fixed `output/<template>.json` path raced),
    // and so it works on read-only serverless filesystems.
    const outputFile = path.join(os.tmpdir(), `template-${templateKey}-${randomUUID()}.json`);

    try {
      await saveTemplateStructureToJson(inputPath , outputFile);
      const result = await readTemplateStructureFromJson(outputFile);

      // Validate the JSON structure before saving
      if (!validateJsonStructure(result.items)) {
        return Response.json({ error: "Invalid JSON structure" }, { status: 500 });
      }

      return Response.json({ success: true, templateJson: result }, { status: 200 });
    } finally {
      // Always clean up the temp file, even if reading/validation threw.
      await fs.unlink(outputFile).catch(() => {});
    }
  } catch (error) {
      console.error("Error generating template JSON:", error);
    return Response.json({ error: "Failed to generate template" }, { status: 500 });
  }
}
