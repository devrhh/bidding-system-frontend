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

const AuctionDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLatestTimestamps] = useState<{
    [auctionId: number]: {
      bidUpdate?: number;
      auctionUpdate?: number;
    }
  }>({});

  const loadAuctions = () => {
    setLoading(true);
    fetchAuctions()
      .then(setAuctions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  // Listen for globalBidUpdate to update currentHighestBid and totalBids in real time
  useSocketEffect(() => {
    const socket = getSocket();
    function handleGlobalBidUpdate(data: { auctionId: number; newHighestBid: number; totalBids?: number; timestamp?: number }) {
      setLatestTimestamps(prev => {
        const last = prev[data.auctionId]?.bidUpdate || 0;
        if (data.timestamp && data.timestamp > last) {
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
          return {
            ...prev,
            [data.auctionId]: {
              ...prev[data.auctionId],
              bidUpdate: data.timestamp
            }
          };
        }
        return prev;
      });
    }
    socket.on(WEBSOCKET_EVENTS.GLOBAL_BID_UPDATE, handleGlobalBidUpdate);
    return () => {
      socket.off(WEBSOCKET_EVENTS.GLOBAL_BID_UPDATE, handleGlobalBidUpdate);
    };
  }, []);

  // Listen for globalAuctionUpdate to update auction info in real time
  useSocketEffect(() => {
    const socket = getSocket();
    function handleGlobalAuctionUpdate(data: { auctionId: number; currentHighestBid: number; totalBids: number; isExpired: boolean; timestamp?: number }) {
      setLatestTimestamps(prev => {
        const last = prev[data.auctionId]?.auctionUpdate || 0;
        if (data.timestamp && data.timestamp > last) {
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
          return {
            ...prev,
            [data.auctionId]: {
              ...prev[data.auctionId],
              auctionUpdate: data.timestamp
            }
          };
        }
        return prev;
      });
    }
    socket.on(WEBSOCKET_EVENTS.GLOBAL_AUCTION_UPDATE, handleGlobalAuctionUpdate);
    return () => {
      socket.off(WEBSOCKET_EVENTS.GLOBAL_AUCTION_UPDATE, handleGlobalAuctionUpdate);
    };
  }, []);

  // Listen for new auctions to add them to the list in real time
  useSocketEffect(() => {
    const socket = getSocket();
    function handleNewAuction(data: NewAuctionData) {
      const newAuction: Auction = {
        id: data.auctionId,
        name: data.name,
        description: data.description,
        startingPrice: data.startingPrice,
        currentHighestBid: data.startingPrice,
        totalBids: 0,
        isExpired: false,
        auctionEndTime: new Date(data.auctionEndTime).toString(),
        timeLeft: data.timeLeft,
        timeLeftFormatted: data.timeLeftFormatted,
      };
      
      setAuctions((prevAuctions) => [newAuction, ...prevAuctions]);
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
      loadAuctions();
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
        {auctions.length === 0 ? (
          <div>No auctions found.</div>
        ) : (
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
                  <TableCell>{auction.name}</TableCell>
                  <TableCell>{auction.description}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
};

export default AuctionDashboard; 