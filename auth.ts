import { type AuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error(
    "[auth] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("[auth] Missing NEXTAUTH_SECRET");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      issuer: "https://discord.com", // ← Add this line
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Guard: JWT strategy gives user.id from the provider profile.
      // Missing id/email would otherwise silently break the upsert.
      if (!user?.id || !user?.email) {
        console.error("[auth] signIn: missing user id or email", { user });
        return false;
      }

      const { error } = await supabase.from("users").upsert(
        {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          image: user.image ?? null,
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("[auth] signIn: supabase upsert failed", error);
        return false;
      }
      return true;
    },

    async session({ session, token }): Promise<Session> {
      if (token.sub) session.user.id = token.sub;
      if (token.email) session.user.email = token.email;
      return session;
    },

    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // Relative callback (e.g. /admin) → same-origin absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Same-origin absolute URL → allow it
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // fall through to baseUrl
      }
      return baseUrl;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};
