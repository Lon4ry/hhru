import type { NextAuthOptions } from "next-auth";
import type { Role } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";

import prisma from "@/shared/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            company: true,
            resume: {
              include: {
                education: true,
                experience: true,
              },
            },
          },
        });
        if (!user) {
          return null;
        }

        const isValid = credentials.password === user.password;
        if (!isValid) {
          return null;
        }

        return {
          id: `${user.id}`,
          email: user.email,
          name: `${user.lastName} ${user.firstName}`.trim(),
          role: user.role,
        } as unknown as Record<string, unknown>;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role | undefined }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
      }
      return session;
    },
  },
};
