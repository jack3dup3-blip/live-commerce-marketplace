import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getStripe() {
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeSecretKey.startsWith("sk_test_")) {
    throw new Error("Only Stripe test mode keys are supported in this environment.");
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2026-04-22.dahlia"
  });
}

export function getPlatformFeeRate() {
  const raw = Number(process.env.PLATFORM_FEE_BPS ?? "1000");
  return Number.isFinite(raw) && raw >= 0 ? raw : 1000;
}

export function calculatePlatformFeeCents(amountCents: number) {
  return Math.round((amountCents * getPlatformFeeRate()) / 10000);
}

export function centsToDecimal(cents: number) {
  return cents / 100;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
