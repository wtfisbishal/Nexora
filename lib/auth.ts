import NextAuth, { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: { 
    async signIn({ user, account, profile }) {
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token, user }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
};

export default NextAuth(authOptions);
