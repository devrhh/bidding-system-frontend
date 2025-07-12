import * as yup from "yup";
import type { AddAuctionFormFields, EndType } from "@/types/auction";
import { MAX_BID_AMOUNT } from './constants';

// Auctions form validation schema
export const MAX_DAYS = 20;
export const MAX_MINUTES = MAX_DAYS * 24 * 60;

export const auctionFormSchema: yup.ObjectSchema<AddAuctionFormFields> = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  startingPrice: yup.number().typeError("Starting price must be a valid number").min(1, "Starting price must be at least 1").required("Starting price is required"),
  endType: yup.mixed<EndType>().oneOf(["date", "duration"]).required(),
  auctionDate: yup.string().when("endType", ([endType], schema) =>
    endType === "date"
      ? schema
          .required("Auction end date is required")
          .test("not-in-past", "Auction end date cannot be in the past.", value => {
            if (!value) return false;
            const selected = new Date(value + "T23:59:59");
            return selected >= new Date();
          })
          .test("not-too-far", `Auction end date cannot be more than ${MAX_DAYS} days from today.`, value => {
            if (!value) return false;
            const selected = new Date(value + "T23:59:59");
            const max = new Date(Date.now() + MAX_DAYS * 24 * 60 * 60 * 1000);
            return selected <= max;
          })
      : schema.notRequired()
  ),
  durationMinutes: yup.number().when("endType", ([endType], schema) =>
    endType === "duration"
      ? schema
          .typeError("Duration is required")
          .min(1, "Duration must be at least 1 minute")
          .max(MAX_MINUTES, `Maximum duration: ${MAX_DAYS} days (${MAX_MINUTES} minutes).`)
          .required("Duration is required")
      : schema.notRequired()
  ),
});

// Bid form validation schema
export const bidFormSchema = yup.object({
  userId: yup.string().required("Please select a user"),
  amount: yup.number()
    .typeError("Bid amount must be a valid number")
    .min(1, "Bid amount must be at least 1")
    .max(MAX_BID_AMOUNT, `Bid amount must be less than ${MAX_BID_AMOUNT.toLocaleString()}`)
    .required("Bid amount is required"),
}); 