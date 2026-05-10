import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
}

// Secrets come from CF request env, not process.env (next dev doesn't load .dev.vars).
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const { env } = getCloudflareContext();
  const e = env as unknown as Env;
  const db = drizzle(e.DB, { schema });
  return {
    secret: e.AUTH_SECRET,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      Discord({
        clientId: e.DISCORD_CLIENT_ID,
        clientSecret: e.DISCORD_CLIENT_SECRET,
        authorization: { params: { scope: "identify" } },
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      jwt: ({ token, user }) => {
        if (user?.id) token.uid = user.id;
        return token;
      },
      session: ({ session, token }) => {
        if (token.uid && session.user) {
          session.user.id = token.uid as string;
        }
        return session;
      },
    },
  };
});
