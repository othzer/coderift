"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { TemplateFolder } from "../lib/path-to-json";


// Public, unauthenticated read used by the shareable /share/[id] view.
// Only ever returns a playground that has been explicitly made public.
export const getPublicPlaygroundById = async (id: string) => {
    try {
        const playground = await db.playground.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                template: true,
                isPublic: true,
                templateFiles: { select: { content: true } },
                user: { select: { name: true, image: true } },
            },
        });

        if (!playground || !playground.isPublic) return null;

        return playground;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getPlaygroundById = async(id:string)=>{
    const user = await currentUser();
    if (!user?.id) return null;

    try {
        const playground = await db.playground.findUnique({
            where: {id},
            select: {
                id: true,
                title: true,
                template: true,
                userId: true,
                templateFiles:{
                    select: {
                        content: true
                    }
                }
            }
        })

        // Ownership check — a user may only open their own playground.
        if (!playground || playground.userId !== user.id) return null;

        return playground;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const SaveUpdatedCode = async(playgroundId:string , data:TemplateFolder)=>{
    const user = await currentUser();
  if (!user?.id) return null;

  try {
    // Ownership check — only the owner may overwrite a playground's files.
    const playground = await db.playground.findUnique({
        where: { id: playgroundId },
        select: { userId: true },
    });
    if (!playground || playground.userId !== user.id) return null;

    const updatedPlayground = await db.templateFile.upsert({
        where:{
            playgroundId
        },
        update:{
            content:JSON.stringify(data)
        },
        create:{
            playgroundId,
            content:JSON.stringify(data)
        }
    })
    
    return updatedPlayground;
  } catch (error) {
     console.log("SaveUpdatedCode error:", error);
    return null;
  }
}