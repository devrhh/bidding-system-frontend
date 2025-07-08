const API_BASE = "http://localhost:3001"; // Update if your backend runs elsewhere

export async function fetchAuctions() {
  const res = await fetch(`${API_BASE}/auctions`);
  if (!res.ok) throw new Error("Failed to fetch auctions");
  return res.json();
}

export async function fetchAuctionById(id: number) {
  const res = await fetch(`${API_BASE}/auctions/${id}`);
  if (!res.ok) throw new Error("Failed to fetch auction details");
  return res.json();
}

export async function placeBid(auctionId: number, userId: number, amount: number) {
  const res = await fetch(`${API_BASE}/auctions/${auctionId}/bids`, {
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
  const res = await fetch(`${API_BASE}/auctions`, {
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
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchAuctionBids(auctionId: number) {
  const res = await fetch(`${API_BASE}/auctions/${auctionId}/bids`);
  if (!res.ok) throw new Error("Failed to fetch auction bids");
  return res.json();
}