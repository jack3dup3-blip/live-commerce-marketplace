import test from "node:test";
import assert from "node:assert/strict";
import { UserRole } from "@prisma/client";
import {
  canAccessAccount,
  canAccessAdmin,
  canAccessSeller,
  canAccessSellerTools,
  getProtectedRouteDecision
} from "../src/lib/access";

test("account routes require a signed-in user", () => {
  assert.equal(canAccessAccount(null), false);
  assert.equal(canAccessAccount({ role: UserRole.BUYER }), true);
  assert.equal(getProtectedRouteDecision("/account/orders", null), "sign-in");
  assert.equal(getProtectedRouteDecision("/account/orders", { role: UserRole.BUYER }), "allow");
});

test("seller routes require seller or admin role", () => {
  assert.equal(canAccessSeller(null), false);
  assert.equal(canAccessSeller({ role: UserRole.BUYER }), false);
  assert.equal(canAccessSeller({ role: UserRole.SELLER }), true);
  assert.equal(canAccessSeller({ role: UserRole.ADMIN }), true);
  assert.equal(getProtectedRouteDecision("/seller/dashboard", null), "sign-in");
  assert.equal(getProtectedRouteDecision("/seller/dashboard", { role: UserRole.BUYER }), "deny");
  assert.equal(getProtectedRouteDecision("/seller/dashboard", { role: UserRole.SELLER }), "allow");
});

test("seller tools also require a seller profile", () => {
  assert.equal(canAccessSellerTools({ role: UserRole.SELLER }), false);
  assert.equal(canAccessSellerTools({ role: UserRole.SELLER, sellerProfileId: "seller_profile_1" }), true);
  assert.equal(canAccessSellerTools({ role: UserRole.ADMIN }), false);
  assert.equal(canAccessSellerTools({ role: UserRole.ADMIN, sellerProfileId: "seller_profile_1" }), true);
});

test("admin routes require admin role", () => {
  assert.equal(canAccessAdmin(null), false);
  assert.equal(canAccessAdmin({ role: UserRole.BUYER }), false);
  assert.equal(canAccessAdmin({ role: UserRole.SELLER }), false);
  assert.equal(canAccessAdmin({ role: UserRole.ADMIN }), true);
  assert.equal(getProtectedRouteDecision("/admin/users", null), "sign-in");
  assert.equal(getProtectedRouteDecision("/admin/users", { role: UserRole.SELLER }), "deny");
  assert.equal(getProtectedRouteDecision("/admin/users", { role: UserRole.ADMIN }), "allow");
});
