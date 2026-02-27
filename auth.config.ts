import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Node.js APIs, no database imports.
// Used only in proxy.ts (Edge runtime) for session checking.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      if (!isLoggedIn && pathname !== "/login") {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      const role = auth?.user?.role;
      if (pathname.startsWith("/pipeline") && role !== "ceo" && role !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (pathname.startsWith("/admin") && role !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
