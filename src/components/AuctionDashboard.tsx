import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddAuctionModal from "./AddAuctionModal";
import AuctionTimerBadge from "./AuctionTimerBadge";
import { fetchAuctions, createAuction } from "../services/api";
import { toast } from "sonner";
import type { Auction } from "@/types/auction";
import { useEffect as useSocketEffect } from "react";
import { getSocket } from "@/lib/utils";
import { WEBSOCKET_EVENTS } from "@/lib/websocket.constants";
import type { NewAuctionData } from "@/lib/websocket.constants";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink
} from "@/components/ui/pagination";
import { truncate } from "@/lib/utils";

const AuctionDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Track the auctions currently subscribed to
  const [subscribedAuctions, setSubscribedAuctions] = useState<number[]>([]);

  const loadAuctions = (pageNum = page) => {
    setLoading(true);
    fetchAuctions(pageNum, limit)
      .then((res) => {
        if (Array.isArray(res)) {
          setAuctions(res);
          setTotal(res.length);
        } else {
          setAuctions(Array.isArray(res.data) ? res.data : []);
          setTotal(res.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAuctions(page);
  }, [page]);

  // Subscribe to only the auctions on the current page
  useEffect(() => {
    const socket = getSocket();
    const currentAuctionIds = auctions.map(a => a.id);
    
    // Only join/leave rooms as needed
    const toJoin = currentAuctionIds.filter(id => !subscribedAuctions.includes(id));
    const toLeave = subscribedAuctions.filter(id => !currentAuctionIds.includes(id));

    toJoin.forEach(id => socket.emit(WEBSOCKET_EVENTS.JOIN_AUCTION, id));
    toLeave.forEach(id => socket.emit(WEBSOCKET_EVENTS.LEAVE_AUCTION, id));
    setSubscribedAuctions(currentAuctionIds);
    return () => {
      // Debug logs removed
      currentAuctionIds.forEach(id => socket.emit(WEBSOCKET_EVENTS.LEAVE_AUCTION, id));
    };
  }, [auctions.map(a => a.id).join(",")]);

  // Listen for per-auction bid and auction updates
  useSocketEffect(() => {
    const socket = getSocket();
    function handleBidUpdate(data: { auctionId: number; newHighestBid: number; totalBids?: number; timestamp?: number }) {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === data.auctionId
            ? {
                ...auction,
                currentHighestBid: data?.newHighestBid,
                totalBids: data.totalBids ?? 0,
              }
            : auction
        )
      );
    }
    function handleAuctionUpdate(data: { auctionId: number; currentHighestBid: number; totalBids: number; isExpired: boolean; timestamp?: number }) {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === data.auctionId
            ? {
                ...auction,
                currentHighestBid: data.currentHighestBid,
                totalBids: data.totalBids,
                isExpired: data.isExpired,
              }
            : auction
        )
      );
    }
    socket.on(WEBSOCKET_EVENTS.BID_UPDATE, handleBidUpdate);
    socket.on(WEBSOCKET_EVENTS.AUCTION_UPDATE, handleAuctionUpdate);
    return () => {
      socket.off(WEBSOCKET_EVENTS.BID_UPDATE, handleBidUpdate);
      socket.off(WEBSOCKET_EVENTS.AUCTION_UPDATE, handleAuctionUpdate);
    };
  }, []);

  // Listen for new auctions to add them to the list in real time
  useSocketEffect(() => {
    const socket = getSocket();
    function handleNewAuction(data: NewAuctionData) {
      toast.success(`New auction created: ${data.name}`);
    }
    socket.on(WEBSOCKET_EVENTS.NEW_AUCTION, handleNewAuction);
    return () => {
      socket.off(WEBSOCKET_EVENTS.NEW_AUCTION, handleNewAuction);
    };
  }, []);

  const handleAddAuction = async (data: {
    name: string;
    description: string;
    startingPrice: number;
    auctionEndTime?: string;
    durationMinutes?: number;
  }) => {
    setLoading(true);
    try {
      await createAuction(data);
      if (page === 1) {
        loadAuctions(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-center">Auctions Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <AddAuctionModal onAddAuction={handleAddAuction} />
        </div>
        {Array.isArray(auctions) && auctions.length === 0 ? (
          <div>No auctions found.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Current Highest Bid</TableHead>
                  <TableHead>Total Bids</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell title={auction.name}>{truncate(auction.name, 20)}</TableCell>
                    <TableCell title={auction.description}>{truncate(auction.description, 20)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">${auction.startingPrice}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>${auction.currentHighestBid ?? 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{auction.totalBids}</Badge>
                    </TableCell>
                    <TableCell>
                      {!auction.isExpired ? (
                        <AuctionTimerBadge 
                          endTime={auction.auctionEndTime} 
                          onExpire={() => {
                            // Update the auction as expired in the local state
                            setAuctions((prevAuctions) =>
                              prevAuctions.map((a) =>
                                a.id === auction.id ? { ...a, isExpired: true } : a
                              )
                            );
                          }}
                        />
                      ) : (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link to={`/auction/${auction.id}`}>
                        <button
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          // disabled={auction.isExpired}
                        >
                          Show Details
                        </button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {page === 1 ? (
                    <span className="pointer-events-none opacity-50">
                      <PaginationPrevious />
                    </span>
                  ) : (
                    <PaginationPrevious onClick={() => setPage(page - 1)} />
                  )}
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  {page === totalPages || totalPages === 0 ? (
                    <span className="pointer-events-none opacity-50">
                      <PaginationNext />
                    </span>
                  ) : (
                    <PaginationNext onClick={() => setPage(page + 1)} />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuctionDashboard; 