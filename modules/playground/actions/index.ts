"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { TemplateFolder } from "../lib/path-to-json";


export const getPlaygroundById = async(id:string)=>{
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    try {
        const playground = await db.playground.findUnique({
            where: {id, userId: user.id },
            select: {
                templateFiles:{
                    select: {
                        content: true
                    }
                }
            }
        })
        return playground;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const SaveUpdatedCode = async(playgroundId:string , data:TemplateFolder)=>{
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const owned = await db.playground.findFirst({
      where: { id: playgroundId, userId: user.id },
      select: { id: true },
    });
    if (!owned) throw new Error("Forbidden");
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
    throw error;
  }
}