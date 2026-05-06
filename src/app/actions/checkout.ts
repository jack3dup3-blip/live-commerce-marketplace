"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePlatformFeeCents, getAppUrl, getStripe } from "@/lib/stripe";

export async function createBuyNowCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");
  const quantity = Number(formData.get("quantity") ?? "1");

  if (!listingId || !Number.isInteger(quantity) || quantity < 1) {
    redirect("/marketplace");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      sellerProfile: true
    }
  });

  if (!listing || listing.status !== "ACTIVE" || listing.listingType !== "BUY_NOW") {
    redirect(`/marketplace/${listingId}`);
  }

  if (quantity > listing.quantity || quantity > listing.product.inventory) {
    redirect(`/marketplace/${listingId}`);
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();
  const unitAmountCents = Math.round(Number(listing.price) * 100);
  const subtotalCents = unitAmountCents * quantity;
  const platformFeeCents = calculatePlatformFeeCents(subtotalCents);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/marketplace/${listing.id}`,
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      buyerId: user.id,
      listingId: listing.id,
      productId: listing.productId,
      sellerProfileId: listing.sellerProfileId,
      quantity: String(quantity),
      unitAmountCents: String(unitAmountCents),
      platformFeeCents: String(platformFeeCents)
    },
    line_items: [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitAmountCents,
          product_data: {
            name: listing.title,
            description: listing.product.brand ? `${listing.product.brand} · ${listing.product.condition.replace("_", " ").toLowerCase()}` : listing.product.condition,
            images: listing.product.images[0]?.url ? [listing.product.images[0].url] : undefined,
            metadata: {
              listingId: listing.id,
              sellerProfileId: listing.sellerProfileId
            }
          }
        }
      }
    ]
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  redirect(session.url);
}
