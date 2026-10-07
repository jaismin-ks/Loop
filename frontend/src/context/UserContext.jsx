import React, { createContext, useState } from "react";
import { API_URL } from "../lib/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load user from localStorage on initial load
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Creates a throwaway guest account and logs into it
  const loginAsGuest = async () => {
    const res = await fetch(`${API_URL}/guest`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not continue as guest");
    login(data.user);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
};