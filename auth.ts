import NextAuth from "next-auth"
import {PrismaAdapter} from "@auth/prisma-adapter"
import { db } from "./lib/db"

import authConfig from "./auth.config"
import { getUserById } from "./modules/auth/actions"

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },
    
    callbacks: {
        async signIn({user, account}){
            if(!user || !account) return false;

            //chechking if use exist
            const existingUser = await db.user.findUnique({
                where: {
                    email: user.email!
                }
            })

            if(!existingUser){
                const newUser = await db.user.create({
                    data: {
                        email:user.email!,
                        name: user.name,
                        image: user.image,
                        accounts: {
                            //@ts-ignore
                            create: {
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                accessToken: account.access_token,
                                refreshToken: account.refresh_token,
                                expiresAt: account.expires_at,
                                tokenType: account.token_type,
                                scope: account.scope,
                                idToken: account.id_token,
                                sessionState: account.session_state,
                            },
                        }
                    },
                });

                if(!newUser) return false;
            }
            else{  //user exist
                const existingAccount = await db.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId
                        }
                    }
                });

                if(!existingAccount){
                    await db.account.create({
                        data: {
                            userId: existingUser.id,
                            type: account.type,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                            expiresAt: account.expires_at,
                            tokenType: account.token_type,
                            scope: account.scope,
                            idToken: account.id_token,
                            //@ts-ignore
                            sessionState: account.session_state,
                        }
                    });
                }
            }
             
            return true;
        },

        async jwt({token}){
            if(!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if(!existingUser) return token;

            //adding user data to token
            token.name = existingUser.name;
            token.email = existingUser.email;
            token.role = existingUser.role;

            return token;
        },

        async session({session, token}){
            //goal is attach the user id to the session object from the token
            if((token.sub && session.user)){
                session.user.id = token.sub;   //sub is bascially the user id in nextauth
            }

            if(token.sub && session.user){
                session.user.role = token.role
            }

            return session;
        }

    },
    ...authConfig

    // adapter: PrismaAdapter(db),
    // session: { strategy: "jwt" },
    // ...authConfig,
});