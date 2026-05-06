"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSellerTools } from "@/lib/auth";
import { closeAuction } from "@/lib/auctions";
import { prisma } from "@/lib/prisma";

export async function closeAuctionAction(formData: FormData) {
  const user = await requireSellerTools();
  const auctionId = String(formData.get("auctionId") ?? "");

  if (!auctionId || !user.sellerProfileId) {
    return;
  }

  const auction = await prisma.auction.findFirst({
    where: {
      id: auctionId,
      listing: {
        sellerProfileId: user.sellerProfileId
      }
    }
  });

  if (!auction) {
    return;
  }

  await closeAuction(auction.id);
  revalidatePath("/seller/auctions");
  revalidatePath("/seller/orders");
  revalidatePath(`/marketplace/${auction.listingId}`);
  redirect("/seller/auctions");
}
