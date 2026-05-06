"use server";

import { AuctionStatus, ListingStatus, ListingType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSellerTools } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingFormSchema, productFormSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

type FormErrors = Record<string, string>;

export type SellerActionState = {
  errors?: FormErrors;
  message?: string;
  redirectTo?: string;
};

function toErrors(issues: Array<{ path: Array<string | number>; message: string }>) {
  return issues.reduce<FormErrors>((acc, issue) => {
    const field = String(issue.path[0]);
    acc[field] = issue.message;
    return acc;
  }, {});
}

function imageUrlsFromText(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toLocalDate(value?: string) {
  return value ? new Date(value) : undefined;
}

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  let slug = slugify(base);
  let suffix = 1;

  while (await exists(slug)) {
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }

  return slug;
}

export async function createProductAction(_state: SellerActionState, formData: FormData): Promise<SellerActionState> {
  const user = await requireSellerTools();
  const parsed = productFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { errors: toErrors(parsed.error.issues) };
  }

  if (!user.sellerProfileId) {
    return { message: "Create a seller profile before adding products." };
  }

  const data = parsed.data;
  const imageUrls = imageUrlsFromText(data.imageUrls);

  if (!imageUrls.length || imageUrls.some((url) => !URL.canParse(url))) {
    return { errors: { imageUrls: "Add one or more valid image URLs." } };
  }

  const slug = await uniqueSlug(data.title, async (candidate) =>
    Boolean(await prisma.product.findUnique({ where: { sellerProfileId_slug: { sellerProfileId: user.sellerProfileId!, slug: candidate } } }))
  );

  try {
    await prisma.product.create({
      data: {
        sellerProfileId: user.sellerProfileId,
        categoryId: data.categoryId,
        name: data.title,
        slug,
        brand: data.brand,
        condition: data.condition,
        description: data.description,
        sku: `${slug}-${Date.now()}`,
        price: 0,
        inventory: data.quantity,
        images: imageUrls.length
          ? {
              create: imageUrls.map((url, index) => ({
                url,
                alt: `${data.title} image ${index + 1}`,
                sortOrder: index
              }))
            }
          : undefined
      }
    });
  } catch {
    return { message: "We could not save this product. Try again with a different title." };
  }

  revalidatePath("/seller/products");
  return { message: "Product saved.", redirectTo: "/seller/products" };
}

export async function createListingAction(_state: SellerActionState, formData: FormData): Promise<SellerActionState> {
  const user = await requireSellerTools();
  const parsed = listingFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { errors: toErrors(parsed.error.issues) };
  }

  if (!user.sellerProfileId) {
    return { message: "Create a seller profile before adding listings." };
  }

  const data = parsed.data;
  const product = await prisma.product.findFirst({
    where: { id: data.productId, sellerProfileId: user.sellerProfileId }
  });

  if (!product) {
    return { errors: { productId: "Select one of your products." } };
  }

  const listingQuantity = data.quantity === "" || data.quantity === undefined ? 1 : data.quantity;
  const listingPrice = data.price === "" || data.price === undefined ? 0 : data.price;

  if (listingQuantity > product.inventory) {
    return { errors: { quantity: `Only ${product.inventory} units are in inventory.` } };
  }

  const slug = await uniqueSlug(data.title, async (candidate) =>
    Boolean(await prisma.listing.findUnique({ where: { slug: candidate } }))
  );

  const auctionStartPrice = data.startingPrice === "" || data.startingPrice === undefined ? 0 : data.startingPrice;
  const startsAt = toLocalDate(data.startTime) ?? new Date();
  const endsAt = toLocalDate(data.endTime) ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.listing.create({
    data: {
      productId: product.id,
      sellerProfileId: user.sellerProfileId,
      title: data.title,
      slug,
      listingType: data.listingType as ListingType,
      description: data.description,
      price: data.listingType === "AUCTION" ? auctionStartPrice : listingPrice,
      quantity: listingQuantity,
      status: data.status as ListingStatus,
      startsAt,
      endsAt,
      auction: data.listingType === "AUCTION"
        ? {
            create: {
              status: data.status === "ACTIVE" ? AuctionStatus.LIVE : AuctionStatus.SCHEDULED,
              startingPrice: auctionStartPrice,
              currentPrice: auctionStartPrice,
              bidIncrement: data.bidIncrement === "" || data.bidIncrement === undefined ? 1 : data.bidIncrement,
              startsAt,
              endsAt
            }
          }
        : undefined
    }
  });

  revalidatePath("/seller/listings");
  revalidatePath("/marketplace");
  return { message: "Listing published.", redirectTo: "/seller/listings" };
}

export async function updateListingAction(_state: SellerActionState, formData: FormData): Promise<SellerActionState> {
  const user = await requireSellerTools();
  const parsed = listingFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { errors: toErrors(parsed.error.issues) };
  }

  if (!user.sellerProfileId || !parsed.data.listingId) {
    return { message: "Listing not found." };
  }

  const data = parsed.data;
  const listing = await prisma.listing.findFirst({
    where: { id: data.listingId, sellerProfileId: user.sellerProfileId },
    include: { auction: true }
  });

  if (!listing) {
    return { message: "Listing not found." };
  }

  const product = await prisma.product.findFirst({
    where: { id: data.productId, sellerProfileId: user.sellerProfileId }
  });

  if (!product) {
    return { errors: { productId: "Select one of your products." } };
  }

  const listingQuantity = data.quantity === "" || data.quantity === undefined ? 1 : data.quantity;

  if (listingQuantity > product.inventory) {
    return { errors: { quantity: `Only ${product.inventory} units are in inventory.` } };
  }

  const auctionStartPrice = data.startingPrice === "" || data.startingPrice === undefined ? 0 : data.startingPrice;
  const listingPrice = data.price === "" || data.price === undefined ? 0 : data.price;
  const startsAt = toLocalDate(data.startTime) ?? listing.startsAt ?? new Date();
  const endsAt = toLocalDate(data.endTime) ?? listing.endsAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listing.id },
      data: {
        productId: data.productId,
        title: data.title,
        description: data.description,
        listingType: data.listingType as ListingType,
        price: data.listingType === "AUCTION" ? auctionStartPrice : listingPrice,
        quantity: listingQuantity,
        status: data.status as ListingStatus,
        startsAt,
        endsAt
      }
    });

    if (data.listingType === "AUCTION") {
      await tx.auction.upsert({
        where: { listingId: listing.id },
        create: {
          listingId: listing.id,
          status: data.status === "ACTIVE" ? AuctionStatus.LIVE : AuctionStatus.SCHEDULED,
          startingPrice: auctionStartPrice,
          currentPrice: auctionStartPrice,
          bidIncrement: data.bidIncrement === "" || data.bidIncrement === undefined ? 1 : data.bidIncrement,
          startsAt,
          endsAt
        },
        update: {
          status: data.status === "ACTIVE" ? AuctionStatus.LIVE : AuctionStatus.SCHEDULED,
          startingPrice: auctionStartPrice,
          currentPrice: auctionStartPrice,
          bidIncrement: data.bidIncrement === "" || data.bidIncrement === undefined ? 1 : data.bidIncrement,
          startsAt,
          endsAt
        }
      });
    } else if (listing.auction) {
      await tx.auction.delete({ where: { listingId: listing.id } });
    }
  });

  revalidatePath("/seller/listings");
  revalidatePath(`/marketplace/${listing.id}`);
  revalidatePath("/marketplace");
  return { message: "Listing updated.", redirectTo: "/seller/listings" };
}

export async function deleteListingAction(formData: FormData) {
  const user = await requireSellerTools();
  const listingId = String(formData.get("listingId") ?? "");

  if (!user.sellerProfileId || !listingId) {
    return;
  }

  await prisma.listing.deleteMany({
    where: {
      id: listingId,
      sellerProfileId: user.sellerProfileId
    }
  });

  revalidatePath("/seller/listings");
  revalidatePath("/marketplace");
}
