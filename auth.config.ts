import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type {NextAuthConfig} from "next-auth"  //just for ts

export default {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [  //avail login methods/providers
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET
    }), 
    Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ]
} satisfies NextAuthConfig