"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { AdminStats, VolumeDataPoint } from "../types";
import { API_BASE_URL } from "@/config/api";

export function useAdminDashboard(token: string | null, logout: () => void) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const { socket } = useSocket(API_BASE_URL);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };
      const statsRes = await fetch(`${API_BASE_URL}/admin/statistics`, {
        headers: authHeaders,
      });

      if (!statsRes.ok) {
        if (statsRes.status === 401 || statsRes.status === 403) {
          logout();
          return;
        }
        throw new Error("Failed to fetch platform data");
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      // Initialize volume data with dummy points
      const now = new Date();
      const initialData: VolumeDataPoint[] = [];
      for (let i = 15; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60000);
        initialData.push({
          time: `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`,
          count: Math.floor(Math.random() * 3),
        });
      }
      setVolumeData(initialData);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setIsDataLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room:init", () => {
      setStats((prev) =>
        prev
          ? {
              ...prev,
              activeRooms: (prev.activeRooms || 0) + 1,
              totalRooms: (prev.totalRooms || 0) + 1,
            }
          : null
      );
    });

    socket.on("room:status", (data) => {
      if (data.status === "closed") {
        setStats((prev) =>
          prev
            ? { ...prev, activeRooms: Math.max(0, (prev.activeRooms || 0) - 1) }
            : null
        );
      }
    });

    socket.on("message:global_signal", () => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

      setVolumeData((prev) => {
        const lastItem = prev[prev.length - 1];
        if (lastItem && lastItem.time === timeStr) {
          return [
            ...prev.slice(0, -1),
            { ...lastItem, count: lastItem.count + 1 },
          ];
        }
        const newData = [...prev, { time: timeStr, count: 1 }];
        if (newData.length > 20) return newData.slice(1);
        return newData;
      });

      setStats((prev) =>
        prev
          ? { ...prev, totalMessages: (prev.totalMessages || 0) + 1 }
          : null
      );
    });

    return () => {
      socket.off("room:init");
      socket.off("room:status");
      socket.off("message:global_signal");
    };
  }, [socket]);

  return {
    stats,
    volumeData,
    isDataLoading,
    refreshData: fetchData,
  };
}
