import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    name: string;
    email: string;
  }
  interface Session {
    user: User & DefaultSession["user"];
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     user: AuthUser;
//   }
// }
