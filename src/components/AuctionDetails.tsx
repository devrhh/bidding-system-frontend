import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BidForm from "./BidForm";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAuctionById, fetchAuctionBids } from "../services/api";
import AuctionTimerBadge from "./AuctionTimerBadge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogHeaderModal, DialogTitle as DialogTitleModal, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useAuctionSocket } from "../lib/utils";

interface Bid {
  id: string;
  user?: { username: string };
  amount: number;
  createdAt: string;
}

interface Auction {
  id: number;
  name: string;
  description: string;
  currentHighestBid: number;
  startingPrice: number;
  auctionEndTime: string;
  isExpired: boolean;
  bids: Bid[];
}

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchAuctionById(Number(id))
        .then((data) => {
          // debugger
          setAuction(data);
          setBids((data.bids || []).slice().sort((a: Bid, b: Bid) => Number(b.amount) - Number(a.amount)));
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (auction && auction.isExpired) {
      setExpired(true);
    }
  }, [auction]);

  // Listen for bid updates via WebSocket
  useAuctionSocket(Number(id), async () => {
    if (id) {
      const latestBids = await fetchAuctionBids(Number(id));
      setBids(latestBids.slice().sort((a: Bid, b: Bid) => Number(b.amount) - Number(a.amount)));
    }
  });

  if (loading) return <div>Loading...</div>;
  if (!auction) return <div>Auction not found.</div>;

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <button
        onClick={() => navigate("/")}
      >
        ← Back to Dashboard
      </button>
      <CardHeader>
        <CardTitle>{auction.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-gray-600">{auction.description}</p>
        <div className="flex items-center gap-4 mb-4">
          <Badge>Highest Bid: ${auction.currentHighestBid ?? 0}</Badge>
          <Badge variant="secondary">Starting Price:	${auction.startingPrice}</Badge>
          {!expired ? (
            <AuctionTimerBadge endTime={auction.auctionEndTime} onExpire={() => setExpired(true)} />
          ) : (
            <Badge variant="destructive">Expired</Badge>
          )}
        </div>
        {/* Bids Table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Bids</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No bids yet.</TableCell>
                </TableRow>
              ) : (
                bids.map((bid: Bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>{bid.user?.username}</TableCell>
                    <TableCell>${bid.amount}</TableCell>
                    <TableCell>{new Date(bid.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
          <DialogTrigger asChild>
            <Button disabled={expired}>Add Bid</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeaderModal>
              <DialogTitleModal>Add a Bid</DialogTitleModal>
            </DialogHeaderModal>
            <BidForm auctionId={auction.id} onClose={() => setBidModalOpen(false)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setBidModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AuctionDetails;
