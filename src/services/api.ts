const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchAuctions() {
  const res = await fetch(`${API_BASE_URL}/auctions`);
  if (!res.ok) throw new Error("Failed to fetch auctions");
  return res.json();
}

export async function fetchAuctionById(id: number) {
  const res = await fetch(`${API_BASE_URL}/auctions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch auction details");
  return res.json();
}

export async function placeBid(auctionId: number, userId: number, amount: number) {
  const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({auctionId, userId, amount }),
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
}: {
  name: string;
  description: string;
  startingPrice: number;
  auctionEndTime?: string;
  durationMinutes?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/auctions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchAuctionBids(auctionId: number) {
  const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bids`);
  if (!res.ok) throw new Error("Failed to fetch auction bids");
  return res.json();
}