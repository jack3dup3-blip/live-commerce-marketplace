import { z } from "zod";

export const productFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  brand: z.string().min(2, "Brand must be at least 2 characters."),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  categoryId: z.string().min(1, "Select a category."),
  imageUrls: z.string().min(1, "Add at least one image URL."),
  description: z.string().min(20, "Description must be at least 20 characters.")
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const listingFormSchema = z.object({
  listingId: z.string().optional(),
  productId: z.string().min(1, "Select a product."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  listingType: z.enum(["BUY_NOW", "AUCTION", "LIVE_ONLY"]),
  price: z.coerce.number().positive("Price must be greater than zero.").optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive("Quantity must be at least one.").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED"]),
  startingPrice: z.coerce.number().positive("Starting price must be positive.").optional().or(z.literal("")),
  bidIncrement: z.coerce.number().positive("Bid increment must be positive.").optional().or(z.literal("")),
  antiSnipingEnabled: z.enum(["on"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.listingType === "BUY_NOW") {
    if (value.price === "" || value.price === undefined) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Buy Now listings require a price." });
    }

    if (value.quantity === "" || value.quantity === undefined) {
      ctx.addIssue({ code: "custom", path: ["quantity"], message: "Buy Now listings require quantity." });
    }
  }

  if (value.listingType === "AUCTION") {
    if (value.startingPrice === "" || value.startingPrice === undefined) {
      ctx.addIssue({ code: "custom", path: ["startingPrice"], message: "Auction listings require a starting price." });
    }

    if (value.bidIncrement === "" || value.bidIncrement === undefined) {
      ctx.addIssue({ code: "custom", path: ["bidIncrement"], message: "Auction listings require a bid increment." });
    }

    if (!value.startTime) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Auction listings require a start time." });
    }

    if (!value.endTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "Auction listings require an end time." });
    }

    if (value.startTime && value.endTime && new Date(value.endTime) <= new Date(value.startTime)) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after start time." });
    }
  }
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
