# Live Commerce Marketplace

Production-grade Sprint 1 foundation for a live commerce marketplace built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Stack

- Next.js App Router with server components by default
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Mock authentication helper for buyer, seller, and admin UI development

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` for your PostgreSQL database.

4. Run the migration:

```bash
npx prisma migrate dev
```

5. Seed sample users, sellers, categories, products, listings, an auction, bids, a stream, and an order:

```bash
npx prisma db seed
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000/marketplace`.

## Sprint 1 Routes

- `/marketplace`
- `/marketplace/[listingId]`
- `/seller/dashboard`
- `/seller/products`
- `/seller/products/new`
- `/seller/listings`
- `/admin`
- `/admin/users`
- `/admin/listings`
- `/account`
- `/account/orders`
- `/account/bids`

## Authentication

Sprint 2 uses Auth.js/NextAuth Credentials for local email/password authentication, database-backed users, password hashes, JWT sessions, and role guards in the route layouts.

Seed credentials:

- Seller: `theo@ateliergoods.test` / `seller123`
- Buyer: `maya@example.com` / `buyer123`
- Admin: `admin@market.test` / `admin123`

Protected areas:

- `/account/*` requires a signed-in user.
- `/seller/*` requires seller or admin access. Seller tools also require a `SellerProfile`.
- `/admin/*` requires admin access.

Auth routes:

- `/sign-in`
- `/sign-up`
- `/sign-out`
- `/account/selling` lets a buyer upgrade by creating a `SellerProfile`.

## Seller Flows

The seller product and listing forms now persist to PostgreSQL through server actions:

- `/seller/products/new`
- `/seller/listings/new`
- `/seller/listings/[listingId]/edit`

Products capture title, description, category, brand, condition, quantity, and image URLs. Listings can be `BUY_NOW`, `AUCTION`, or `LIVE_ONLY`; Buy Now listings require price and quantity, while Auction listings require starting price, bid increment, start time, end time, and an optional anti-sniping setting.

## Stripe Test Checkout

Buy Now listings use Stripe Checkout in test mode only. Required environment variables:

- `STRIPE_SECRET_KEY`: must start with `sk_test_`.
- `STRIPE_WEBHOOK_SECRET`: from `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- `NEXT_PUBLIC_APP_URL`: local app URL, usually `http://localhost:3000`.
- `PLATFORM_FEE_BPS`: platform fee in basis points. `1000` means 10%.

The webhook fulfills `checkout.session.completed` and `checkout.session.async_payment_succeeded` events by creating `Order` and `OrderItem` records, recording platform fee fields, and reducing listing/product inventory.

## Auction System

Auction listings support bid placement through `/api/auctions/[auctionId]/bids`. The server validates that the auction is active, the bid is above the current bid, the bid meets the configured increment, and the seller is not bidding on their own item. Sellers can opt into anti-sniping per auction; when enabled, bids in the final 30 seconds extend the auction by 30 seconds. Ended auctions can be locked from `/seller/auctions`, which creates a pending order for the winning bidder.

Run bidding flow tests with:

```bash
npm run test:playwright
```

## Database

The Prisma schema includes:

- User
- SellerProfile
- Product
- ProductImage
- Listing
- Category
- Order
- OrderItem
- Auction
- Bid
- LiveStream
- LiveProduct

Run `npx prisma studio` after seeding to inspect the sample data.
