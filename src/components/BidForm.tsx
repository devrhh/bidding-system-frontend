import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { placeBid } from "../services/api";
import { useUsers } from "../contexts/useUsers";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup } from "@/components/ui/select";
import type { User, BidFormFields } from "@/types/auction";
import { bidFormSchema } from "@/lib/validations";

type BidFormProps = {
  auctionId: number;
  onClose?: () => void;
};

const BidForm: React.FC<BidFormProps> = ({ auctionId, onClose }) => {
  const users = useUsers();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<BidFormFields>({
    resolver: yupResolver(bidFormSchema),
    defaultValues: {
      userId: "",
      amount: 1,
    },
  });

  const onSubmit = async (data: BidFormFields) => {
    try {
      await placeBid(auctionId, Number(data.userId), Number(data.amount));
      toast.success("Bid placed successfully!");
      reset();
      if (onClose) onClose();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to place bid");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-center mt-4">
      <div className="flex flex-col">
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={users.length === 0 ? "Loading users..." : "Select user"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {users.map((user: User) => (
            <SelectItem key={user.id} value={String(user.id)}>
            {user.id} {user.firstName}
          </SelectItem>
          ))}
          </SelectGroup>
        </SelectContent>
      </Select>
          )}
        />
        {errors.userId && <div className="text-xs text-red-500 mt-1">{errors.userId.message}</div>}
      </div>
      <div className="flex flex-col">
      <Input
        type="number"
        min="1"
        placeholder="Enter your bid"
          {...register("amount")}
        className="w-32"
        />
        {errors.amount && <div className="text-xs text-red-500 mt-1">{errors.amount.message}</div>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Placing..." : "Place Bid"}
      </Button>
    </form>
  );
};

export default BidForm; 