import React, { createContext, useState, useEffect } from "react";
import { fetchUsers } from "../services/api";
import type { User } from "@/types/auction";

const UserContext = createContext<User[]>([]);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <UserContext.Provider value={users}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
