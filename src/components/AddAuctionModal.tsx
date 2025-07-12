import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { AddAuctionFormFields, AuctionPayload, EndType } from "@/types/auction";
import { auctionFormSchema, MAX_DAYS, MAX_MINUTES } from "@/lib/validations";

const AddAuctionModal: React.FC<{ onAddAuction: (data: AuctionPayload) => void }> = ({ onAddAuction }) => {
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AddAuctionFormFields>({
    resolver: yupResolver(auctionFormSchema),
    defaultValues: {
      endType: "date",
      name: "",
      description: "",
      startingPrice: null,
      auctionDate: null,
      durationMinutes: null,
    },
  });

  const endType = watch("endType");

  const onSubmit = (data: AddAuctionFormFields) => {
    const payload: AuctionPayload = {
      name: data.name,
      description: data.description,
      startingPrice: Number(data.startingPrice),
    };
    if (endType === "date" && data.auctionDate) {
      payload.auctionEndTime = new Date(data.auctionDate + "T23:59:59").toISOString();
    } else if (endType === "duration" && data.durationMinutes) {
      payload.durationMinutes = Number(data.durationMinutes);
    }
    onAddAuction(payload);
    setOpen(false);
    reset({
      endType: "date",
      name: "",
      description: "",
      startingPrice: null,
      auctionDate: null,
      durationMinutes: null,
    });
  };

  // For date input max
  const maxDate = new Date(Date.now() + MAX_DAYS * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-white rounded">Add Auction Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Auction Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Name" {...register("name")} />
          {errors.name && <div className="text-xs text-red-500">{errors.name.message}</div>}
          <Input placeholder="Description" {...register("description")} />
          {errors.description && <div className="text-xs text-red-500">{errors.description.message}</div>}
          <Input type="number" placeholder="Starting Price" {...register("startingPrice")} min={1} />
          {errors.startingPrice && <div className="text-xs text-red-500">{errors.startingPrice.message}</div>}
          <RadioGroup value={endType} onValueChange={v => reset({ ...watch(), endType: v as EndType })} className="flex gap-4">
            <div>
              <RadioGroupItem value="date" id="date" />
              <Label htmlFor="date">End date</Label>
            </div>
            <div>
              <RadioGroupItem value="duration" id="duration" />
              <Label htmlFor="duration" className="ml-2">End duration (minutes)</Label>
            </div>
          </RadioGroup>
          {endType === "date" ? (
            <>
              <Input
                type="date"
                {...register("auctionDate")}
                min={new Date().toISOString().split("T")[0]}
                max={maxDate}
              />
              <div className="text-xs text-gray-500 mt-1">
                Auction end date cannot be more than 20 days from today.
              </div>
              {errors.auctionDate && <div className="text-xs text-red-500">{errors.auctionDate.message}</div>}
            </>
          ) : (
            <>
              <Input
                placeholder="Duration in minutes"
                type="number"
                {...register("durationMinutes")}
                min={1}
              />
              <div className="text-xs text-gray-500 mt-1">
                Maximum duration: 20 days ({MAX_MINUTES} minutes).
              </div>
              {errors.durationMinutes && <div className="text-xs text-red-500">{errors.durationMinutes.message}</div>}
            </>
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