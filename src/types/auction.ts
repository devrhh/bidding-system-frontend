export interface AuctionPayload {
  name: string;
  description: string;
  startingPrice: number;
  auctionEndTime?: string;
  durationMinutes?: number;
}

export interface User {
  id: number;
  firstName: string;
}

export interface Auction {
  id: number;
  name: string;
  description: string;
  startingPrice: number;
  currentHighestBid?: number;
  totalBids: number;
  isExpired?: boolean;
  auctionEndTime: string;
  timeLeft?: number;
  timeLeftFormatted?: string;
} 