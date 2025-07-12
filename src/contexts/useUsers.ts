import { useContext } from "react";
import UserContext from "./UserContext";
import type { User } from "@/types/auction";

export const useUsers = (): User[] => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}; 