"use server";

import {auth } from "@/auth";
import {db} from "@/lib/db";

export const getUserById = async (id: string) => {
    try{
        // Note: do NOT include `accounts` here — that relation stores OAuth
        // access/refresh/id tokens and must never be returned to a caller.
        const user = await db.user.findUnique({
            where: {id},
        });
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export const getAccountByUserId  = async (userId: string) => {
    try{
        const account = await db.account.findFirst({
            where: {userId}
        });
        return account;
    } catch (error) {
        console.error("Error fetching account:", error);
        return null;
    }
}

export const currentUser = async () => {
    const user = await auth();
    return user?.user;
}