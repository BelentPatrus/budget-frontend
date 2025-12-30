"use client";

import { createContext, useContext } from "react";

export type User = {
  username: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
});

export const useAuth = () => useContext(AuthContext);
