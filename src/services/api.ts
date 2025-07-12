import { apiClient } from '@/lib/apiClient';
import type { AuctionPayload } from '../types/auction';

export async function fetchAuctions(page = 1, limit = 10) {
  const res = await apiClient(`/auctions?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch auctions");
  return res.json();
}

export async function fetchAuctionById(id: number) {
  const res = await apiClient(`/auctions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch auction details");
  return res.json();
}

export async function placeBid(auctionId: number, userId: number, amount: number) {
  const res = await apiClient(`/auctions/${auctionId}/bids`, {
    method: "POST",
    body: JSON.stringify({ auctionId, userId, amount }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to place bid");
  }
  return res.json();
}

export async function createAuction({
  name,
  description,
  startingPrice,
  auctionEndTime,
  durationMinutes,
}: AuctionPayload) {
  const res = await apiClient(`/auctions`, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      startingPrice,
      auctionEndTime,
      durationMinutes,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create auction");
  }
  return res.json();
}

export async function fetchUsers() {
  const res = await apiClient(`/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchAuctionBids(auctionId: number) {
  const res = await apiClient(`/auctions/${auctionId}/bids`);
  if (!res.ok) throw new Error("Failed to fetch auction bids");
  return res.json();
}