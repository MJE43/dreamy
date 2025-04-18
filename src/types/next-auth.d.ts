import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      /** The user's id from the database. */
      id: string;
    } & DefaultSession["user"]; // Keep the default properties like name, email, image
  }

  // Extend the built-in User type if you need id during JWT/Session callbacks with the `user` object
  interface User extends DefaultUser {
    id: string;
  }
}

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** This is the user id */
    sub: string;
  }
} 
