import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "mobiauth",
      name: "MobiAuth",
      type: "oauth",
      authorization: {
        url: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/oauth/authorize`,
        params: { scope: "openid profile email admin:users" }
      },
      token: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/oauth/token`,
      userinfo: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/oauth/userinfo`,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      checks: ["state"],
      idToken: false,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name
        };
      }
    }
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
