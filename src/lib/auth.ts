import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

const prisma = new PrismaClient();

const TRUSTED_ORIGINS = process.env.TRUSTED_ORIGINS?.split(",") || [];

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail(user.email, url);
        },
    },

    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail(user.email, url);
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
            enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
            enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        },
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },

    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin"],
        }),
    ],

    advanced: {
        cookiePrefix: "better-auth",
        generateId: false,
        crossSubDomainCookies: {
            enabled: true,
        },
    },

    trustedOrigins: [...TRUSTED_ORIGINS, process.env.BETTER_AUTH_URL || ""],
});

export type Session = typeof auth.$Infer.Session;
