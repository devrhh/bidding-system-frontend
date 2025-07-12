export type AuctionPayload = {
  name: string;
  description: string;
  startingPrice: number;
  auctionEndTime?: string;
  durationMinutes?: number;
}
export type User = {
  id: number;
  firstName: string;
}

export type Bid = {
  id: string;
  user?: { username: string };
  amount: number;
  createdAt: string;
}

export type Auction = {
  id: number;
  name: string;
  description: string;
  startingPrice: number;
  currentHighestBid?: number;
  totalBids?: number;
  isExpired?: boolean;
  auctionEndTime: string;
  timeLeft?: number;
  timeLeftFormatted?: string;
  bids?: Bid[];
}

export type EndType = 'date' | 'duration';

export type AddAuctionFormFields = {
  name: string;
  description: string;
  startingPrice: number;
  endType: EndType;
  auctionDate?: string;
  durationMinutes?: number;
}

export type BidUpdatePayload = {
  auctionId: number;
  newHighestBid: number;
  totalBids?: number;
};

export type AuctionUpdatePayload = {
  auctionId: number;
  currentHighestBid: number;
  totalBids: number;
  isExpired: boolean;
};