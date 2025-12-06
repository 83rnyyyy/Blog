import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/utils/connect"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  // ADD THIS:
  basePath: "/api/auth",
  trustHost: true, // Important for Next.js 15+
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.email = user.email;
        session.user.id = user.id;
      }
      return session;
    },
  },
})

export const { GET, POST } = handlers