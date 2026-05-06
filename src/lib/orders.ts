import type Stripe from "stripe";
import { OrderStatus } from "@prisma/client";
import { centsToDecimal } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function fulfillStripeCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return { fulfilled: false, reason: "Session is not a paid payment." };
  }

  const existingOrder = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: session.id }
  });

  if (existingOrder) {
    return { fulfilled: false, reason: "Order already exists.", orderId: existingOrder.id };
  }

  const listingId = session.metadata?.listingId;
  const buyerId = session.metadata?.buyerId;
  const quantity = Number(session.metadata?.quantity ?? "1");
  const unitAmountCents = Number(session.metadata?.unitAmountCents ?? "0");
  const subtotalCents = unitAmountCents * quantity;
  const platformFeeCents = Number(session.metadata?.platformFeeCents ?? "0");
  const totalCents = session.amount_total ?? subtotalCents;

  if (!listingId || !buyerId || !quantity || !unitAmountCents) {
    throw new Error("Stripe session is missing checkout metadata.");
  }

  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      include: { product: true }
    });

    if (!listing) {
      throw new Error("Listing not found for Stripe session.");
    }

    if (listing.listingType !== "BUY_NOW") {
      throw new Error("Only Buy Now listings can be fulfilled by checkout.");
    }

    if (listing.quantity < quantity || listing.product.inventory < quantity) {
      throw new Error("Insufficient inventory for Stripe fulfillment.");
    }

    const order = await tx.order.create({
      data: {
        buyerId,
        status: OrderStatus.PAID,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        currency: session.currency ?? "usd",
        subtotal: centsToDecimal(subtotalCents),
        shipping: 0,
        tax: 0,
        platformFee: centsToDecimal(platformFeeCents),
        sellerProceeds: centsToDecimal(Math.max(totalCents - platformFeeCents, 0)),
        total: centsToDecimal(totalCents),
        items: {
          create: {
            listingId: listing.id,
            productId: listing.productId,
            quantity,
            unitPrice: centsToDecimal(unitAmountCents),
            total: centsToDecimal(subtotalCents)
          }
        }
      }
    });

    await tx.listing.update({
      where: { id: listing.id },
      data: {
        quantity: { decrement: quantity },
        status: listing.quantity - quantity <= 0 ? "SOLD_OUT" : listing.status
      }
    });

    await tx.product.update({
      where: { id: listing.productId },
      data: {
        inventory: { decrement: quantity }
      }
    });

    return { fulfilled: true, orderId: order.id };
  });
}
