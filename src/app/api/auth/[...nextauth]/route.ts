import NextAuth from "next-auth"
// import GitHubProvider from "next-auth/providers/github"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { PrismaClient } from "@/generated/prisma" // Use generated client
import { authOptions } from "@/lib/authOptions"; // Import from the new location

// const prisma = new PrismaClient() // PrismaClient is instantiated in authOptions.ts

/* Remove the original authOptions definition
export const authOptions: AuthOptions = {
  ...
};
*/

const handler = NextAuth(authOptions);

// Export the handlers for GET and POST requests
export { handler as GET, handler as POST }; 
