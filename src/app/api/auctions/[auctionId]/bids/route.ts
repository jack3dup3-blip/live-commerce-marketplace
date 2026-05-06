import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AuctionError, placeAuctionBid } from "@/lib/auctions";

export async function POST(request: Request, { params }: { params: Promise<{ auctionId: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to place a bid." }, { status: 401 });
  }

  const { auctionId } = await params;
  const body = await request.json().catch(() => null) as { amount?: number } | null;

  try {
    const result = await placeAuctionBid({
      auctionId,
      bidderId: session.user.id,
      amount: Number(body?.amount)
    });

    return NextResponse.json({
      bid: {
        id: result.bid.id,
        amount: result.bid.amount.toString(),
        bidderName: result.bid.bidder.name,
        createdAt: result.bid.createdAt
      },
      auction: {
        currentPrice: result.auction.currentPrice.toString(),
        endsAt: result.auction.endsAt,
        extended: result.extended
      }
    });
  } catch (error) {
    if (error instanceof AuctionError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to place bid." }, { status: 500 });
  }
}
