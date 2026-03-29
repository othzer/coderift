"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import {
  detectTemplateAndNormalize,
  fetchGithubRepoAsTemplateFolder,
  parseGithubRepoUrl,
} from "@/lib/github-import";
import { SaveUpdatedCode } from "@/modules/playground/actions";

export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
        throw new Error("User Id is Required");
    }

    try {
        if (isChecked) {
            await db.starmark.upsert({
                where: {
                    userId_playgroundId: {
                        userId,
                        playgroundId,
                    }
                },
                create: {
                    userId,
                    playgroundId,
                    isMarked: true,
                },
                update: {
                    isMarked: true,
                }
            });
        } else {
            await db.starmark.deleteMany({
                where: {
                    userId,
                    playgroundId,
                }
            });
        }

        revalidatePath('/dashboard');

        return { success: true, isMarked: isChecked };
    } catch (error) {
        console.error("Error updating star mark:", error);
        return { success: false, error: "Failed to update problem" };
    }
}


export const getAllPlaygroundForUser = async () => {
    const user = await currentUser();

    if (!user?.id) {
        return [];
    }

    try {
        const playground = await db.playground.findMany({
            where: {
                userId: user.id
            },
            include: {
                user: true,
                starmark: {
                    where: {
                        userId: user?.id
                    },
                    select:{
                        isMarked: true
                    }
                }
            }
        });

        return playground;
    } catch (error) {
        console.error("Failed to fetch playgrounds:", error);
        return [];
    }
};

export const createProject = async(data: {
    title: string; 
    template: "REACT" | "NEXTJS" | "VUE" | "HONO"| "EXPRESS" | "ANGULAR";
    description?: string;
})=>{
    const user = await currentUser();
    const {template, title, description} = data;

    if (!user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const playground = await db.playground.create({
            data: {
                title: title,
                description: description,
                template: template,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })
        return playground;
    } catch (error) {
        console.log(error);
    }
}

export const importGithubRepo = async (data: { repoUrl: string; title?: string }) => {
    const user = await currentUser();
    if (!user?.id) {
        throw new Error("Unauthorized");
    }

    const { owner, repo, branch } = parseGithubRepoUrl(data.repoUrl);

    // Use the user's GitHub OAuth token if available to raise the API rate limit
    const account = await db.account.findFirst({
        where: { userId: user.id, provider: "github" },
    });

    const rawFolder = await fetchGithubRepoAsTemplateFolder(
        owner,
        repo,
        branch,
        account?.accessToken ?? undefined
    );
    const { template, folder } = detectTemplateAndNormalize(rawFolder);

    const playground = await db.playground.create({
        data: {
            title: data.title || repo,
            description: `Imported from github.com/${owner}/${repo}`,
            template,
            user: {
                connect: { id: user.id }
            }
        }
    });

    await SaveUpdatedCode(playground.id, folder);

    return playground;
}

export const deleteProjectById = async(id: string)=>{
    try {
        await db.playground.delete({
            where: {id: id}
        })

        revalidatePath("/dashboard")  //updates the cached data
    } catch (error) {
        console.log(error)
    }
}

export const editProjectById = async(id: string, data:{title:string, description: string}) =>{
    try {
        await db.playground.update({
            where: {id: id},
            data: data
        });

        revalidatePath("/dashboard");
    } catch (error) {
        console.log(error);
    }
}

export const duplicateProjectById = async(id: string)=>{
    try {
        const originalPlayground = await db.playground.findUnique({
            where: {id: id},
            //to-do add template files
        });
        if(!originalPlayground){
            throw new Error("Original playground not found");
        }

        const duplicatedPlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId

                //to-do: template file
            }
        })

        revalidatePath('/dasboard')
        return duplicatedPlayground;
    } catch (error) {
        console.log(error);
    }
}
