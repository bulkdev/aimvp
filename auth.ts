import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isMainAdminEmail } from "@/lib/admin-env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const [{ getUserByEmail }, { verifyPassword }] = await Promise.all([
          import("@/lib/auth-users"),
          import("@/lib/password"),
        ]);
        const email = String(credentials.email).toLowerCase().trim();
        const user = await getUserByEmail(email);
        if (!user) return null;
        const ok = await verifyPassword(String(credentials.password), user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.isMainAdmin = isMainAdminEmail(user.email);
      }
      if (token.email) {
        token.isMainAdmin = isMainAdminEmail(String(token.email));
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) || session.user.email || "";
        session.user.isMainAdmin = Boolean(token.isMainAdmin);
      }
      return session;
    },
  },
});
