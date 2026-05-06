import { UserRole } from "@prisma/client";

export type AccessUser = {
  role: UserRole;
  sellerProfileId?: string | null;
} | null;

export function canAccessAccount(user: AccessUser) {
  return Boolean(user);
}

export function canAccessAdmin(user: AccessUser) {
  return user?.role === UserRole.ADMIN;
}

export function canAccessSeller(user: AccessUser) {
  return user?.role === UserRole.SELLER || user?.role === UserRole.ADMIN;
}

export function canAccessSellerTools(user: AccessUser) {
  return canAccessSeller(user) && Boolean(user?.sellerProfileId);
}

export function getProtectedRouteDecision(pathname: string, user: AccessUser) {
  if (pathname.startsWith("/admin")) {
    return canAccessAdmin(user) ? "allow" : user ? "deny" : "sign-in";
  }

  if (pathname.startsWith("/seller")) {
    return canAccessSeller(user) ? "allow" : user ? "deny" : "sign-in";
  }

  if (pathname.startsWith("/account")) {
    return canAccessAccount(user) ? "allow" : "sign-in";
  }

  return "allow";
}
