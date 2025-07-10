import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label"
import type { AuctionPayload } from "@/types/auction";

interface AddAuctionModalProps {
  onAddAuction: (data: { name: string; description: string; startingPrice: number; auctionEndTime?: string; durationMinutes?: number }) => void;
}

function getEndOfDayISOString(dateStr: string) {
  const date = new Date(dateStr + 'T23:59:59');
  return date.toISOString();
}

const AddAuctionModal: React.FC<AddAuctionModalProps> = ({ onAddAuction }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [endType, setEndType] = useState<'date' | 'duration'>("date");
  const [auctionDate, setAuctionDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AuctionPayload = {
      name,
      description,
      startingPrice: Number(startingPrice),
    };
    if (endType === "date" && auctionDate) {
      payload.auctionEndTime = getEndOfDayISOString(auctionDate);
    } else if (endType === "duration" && durationMinutes) {
      payload.durationMinutes = Number(durationMinutes);
    }
    onAddAuction(payload);
    setOpen(false);
    setName("");
    setDescription("");
    setStartingPrice("");
    setAuctionDate("");
    setDurationMinutes("");
    setEndType("date");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white rounded" >Add Auction Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Auction Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="Starting Price"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            min={1}
            required
          />
          <RadioGroup value={endType} onValueChange={v => setEndType(v as 'date' | 'duration')} className="flex gap-4">
  <div>
    <RadioGroupItem 
      value="date" 
      id="date"
    />
    <Label htmlFor="date">End date</Label>
  </div>
  <div>
    <RadioGroupItem 
      value="duration" 
      id="duration" 
    />
    <Label htmlFor="duration" className="ml-2">End duration (minutes)</Label>
  </div>
</RadioGroup>
          {endType === "date" ? (
            <Input
              type="date"
              placeholder="Auction End Date"
              value={auctionDate}
              onChange={(e) => setAuctionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          ) : (
            <Input
              type="number"
              placeholder="Duration in minutes"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min={1}
              required
            />
          )}
          <DialogFooter>
            <Button type="submit">Add Auction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAuctionModal; 