"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = async () => {
    try {
      const response = await fetch("/api/auth/token");

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
      } else {
        setAccessToken(null);
      }
    } catch (err) {
      console.error("Error fetching token:", err);
      setError("Failed to fetch authentication token");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/token", { method: "DELETE" });
      setAccessToken(null);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return {
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
    logout,
    refreshToken: fetchToken,
  };
}
