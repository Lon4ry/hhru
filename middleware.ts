import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;
        const role = token.role as string | undefined;
        const path = req.nextUrl.pathname;
        if (path.startsWith("/applicant")) {
          return role === "APPLICANT";
        }
        if (path.startsWith("/employer")) {
          return role === "EMPLOYER";
        }
        if (path.startsWith("/admin")) {
          return role === "ADMIN";
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/applicant/:path*", "/employer/:path*", "/admin/:path*"],
};
