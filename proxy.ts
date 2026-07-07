import NextAuth from "next-auth";
import {
publicRoutes, authRoutes, apiAuthPrefix, DEFAULT_LOGIN_REDIRECT
} from "@/routes"
import authConfig from "@/auth.config"

const {auth} = NextAuth(authConfig)

export default auth((req)=>{
    const {nextUrl} = req;
    const isLoggedIn = !!req.auth

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    // /share/<id> is a public, read-only view of a playground the owner opted to share.
    const isPublicRoute =
        publicRoutes.includes(nextUrl.pathname) ||
        nextUrl.pathname.startsWith("/share/");
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if(isApiAuthRoute){ 
        return null
    }

    if(isAuthRoute){
        if(isLoggedIn){
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }

    if(!isLoggedIn && !isPublicRoute){
        return Response.redirect(new URL("/auth/sign-in", nextUrl));
    }

    return null;
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
