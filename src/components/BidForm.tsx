import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { placeBid, fetchUsers } from "../services/api";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup } from "@/components/ui/select";
import type { User } from "@/types/auction";

type BidFormProps = {
  auctionId: number;
  onClose?: () => void;
};

const BidForm: React.FC<BidFormProps> = ({ auctionId, onClose }) => {
  const [amount, setAmount] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUsersOpen = async () => {
    if (users.length === 0 && !usersLoading) {
      setUsersLoading(true);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || "Unable to fetch Users");
      } finally {
        setUsersLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await placeBid(auctionId, Number(userId), Number(amount));
      toast.success("Bid placed successfully!");
      setAmount("");
      if (onClose) onClose();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-4">
      <Select onOpenChange={handleUsersOpen} onValueChange={setUserId} value={userId} disabled={loading || usersLoading}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={usersLoading ? "Loading users..." : "Select user"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
          {users.map((user) => (
            <SelectItem key={user.id} value={String(user.id)}>
            {user.id} {user.firstName}
          </SelectItem>
          ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        type="number"
        min="1"
        placeholder="Enter your bid"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-32"
        required
      />
      <Button type="submit" disabled={loading || !userId}>
        {loading ? "Placing..." : "Place Bid"}
      </Button>
    </form>
  );
};

export default BidForm; 