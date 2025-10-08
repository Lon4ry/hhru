import NextAuth from "next-auth";

import { authOptions } from "@/shared/auth/options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
