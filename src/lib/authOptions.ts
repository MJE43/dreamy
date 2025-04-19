import { AuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@/generated/prisma" // Use generated client

// Instantiate Prisma Client once
const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  // Configure the Prisma adapter
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,       // Ensure env vars are asserted as string
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // ...add more providers here if needed (e.g., Google, Email)
  ],
  session: {
    strategy: "jwt", // Use JWT strategy to easily customize session token
  },
  callbacks: {
    // Include user.id on session
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub; // token.sub is the user's ID (subject)
      }
      return session;
    },
    // JWT callback is called first, assign user id to token here
    async jwt({ token, user }) {
      if (user) { // user object is available on initial sign in
        token.sub = user.id;
      }
      return token;
    },
  },
  // Optional: Add pages configuration for custom login/error pages
  // pages: {
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error', // Error code passed in query string as ?error=
  //   verifyRequest: '/auth/verify-request', // (used for email/passwordless sign in)
  //   newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  // }
  // Ensure secrets are set
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
}; 
