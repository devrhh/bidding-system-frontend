import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import AuctionItem from "./AuctionItem";
// import AuctionDetails from "./AuctionDetails";
import AddAuctionModal from "./AddAuctionModal";
import { fetchAuctions, createAuction } from "../services/api";
import { toast } from "sonner";

const AuctionDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const [selectedAuction, setSelectedAuction] = useState<any | null>(null);

  const loadAuctions = () => {
    setLoading(true);
    fetchAuctions()
      .then(setAuctions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAuctions();
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
    } catch (err: any) {
      toast.error(err.message || "Failed to create auction");
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
                <TableHead>Status</TableHead>
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
                    {auction.isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
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