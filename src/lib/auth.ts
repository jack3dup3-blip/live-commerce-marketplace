import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { canAccessSeller } from "@/lib/access";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      sellerProfileId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    sellerProfileId?: string | null;
  }
}

type LiveMarketToken = JWT & {
  role?: UserRole;
  sellerProfileId?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { sellerProfile: true }
        });

        if (!user || !verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.imageUrl,
          role: user.role,
          sellerProfileId: user.sellerProfile?.id
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const liveToken = token as LiveMarketToken;

      if (user) {
        liveToken.role = user.role;
        liveToken.sellerProfileId = user.sellerProfileId;
      }

      if (liveToken.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: liveToken.sub },
          select: { role: true, sellerProfile: { select: { id: true } } }
        });

        if (dbUser) {
          liveToken.role = dbUser.role;
          liveToken.sellerProfileId = dbUser.sellerProfile?.id;
        }
      }

      return liveToken;
    },
    async session({ session, token }) {
      const liveToken = token as LiveMarketToken;

      if (session.user && liveToken.sub) {
        session.user.id = liveToken.sub;
        session.user.role = liveToken.role ?? UserRole.BUYER;
        session.user.sellerProfileId = liveToken.sellerProfileId;
      }

      return session;
    }
  }
});

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sellerProfileId?: string | null;
};

export async function currentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? "Customer",
    email: user.email,
    role: user.role,
    sellerProfileId: user.sellerProfileId
  };
}

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    redirect("/access-denied");
  }

  return user;
}

export async function requireSellerTools() {
  const user = await requireRole([UserRole.SELLER, UserRole.ADMIN]);

  if (!canAccessSeller(user) || !user.sellerProfileId) {
    redirect("/account/selling");
  }

  return user;
}
