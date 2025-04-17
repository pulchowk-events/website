import { type AuthOptions, type Session } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        url: "https://discord.com/oauth2/authorize",
        params: {
          scope: "identify email",
          response_type: "code",
          redirect_uri: "http://localhost:3000/api/auth/callback/discord",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { error } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          { onConflict: "id" }
        );

      if (error) return false;
      return true;
    },

    async session({ session, token }): Promise<Session> {
      if (token.sub) session.user.id = token.sub;
      if (token.email) session.user.email = token.email;
      return session;
    },

    async jwt({ token, account, user }): Promise<any> {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true,
};
