"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createPasswordHash } from "@/lib/password";
import { signIn, signOut, requireUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export type SignInState = {
  error?: string;
};

export async function signInAction(_state: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/account"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }

    throw error;
  }

  return {};
}

export type SignUpState = {
  errors?: Record<string, string>;
};

export async function signUpAction(_state: SignUpState, formData: FormData): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const errors: Record<string, string> = {};

  if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: createPasswordHash(password),
        role: UserRole.BUYER
      }
    });
  } catch {
    return { errors: { email: "An account with this email already exists." } };
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/account"
  });

  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/marketplace" });
}

export type SellerUpgradeState = {
  errors?: Record<string, string>;
};

async function uniqueSellerSlug(shopName: string) {
  const base = slugify(shopName);
  let slug = base;
  let suffix = 1;

  while (await prisma.sellerProfile.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

export async function createSellerProfileAction(_state: SellerUpgradeState, formData: FormData): Promise<SellerUpgradeState> {
  const user = await requireUser();
  const shopName = String(formData.get("shopName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  const errors: Record<string, string> = {};

  if (shopName.length < 3) {
    errors.shopName = "Shop name must be at least 3 characters.";
  }

  if (bio && bio.length < 20) {
    errors.bio = "Bio must be at least 20 characters when provided.";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }

  const existing = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });

  if (existing) {
    redirect("/seller/dashboard");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.SELLER }
    }),
    prisma.sellerProfile.create({
      data: {
        userId: user.id,
        shopName,
        slug: await uniqueSellerSlug(shopName),
        bio: bio || null
      }
    })
  ]);

  redirect("/seller/dashboard");
}
