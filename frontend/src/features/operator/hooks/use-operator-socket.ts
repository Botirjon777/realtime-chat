"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Room, Message } from "../types";
import { API_BASE_URL } from "@/config/api";

export function useOperatorSocket(user: any) {
  const { socket, isConnected } = useSocket(API_BASE_URL);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomMessages, setRoomMessages] = useState<{ [key: string]: Message[] }>(
    {}
  );
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    if (isConnected && user) {
      socket.emit("operator:identify", { operatorId: user.id.toString() });
      socket.emit("room:get_all");
    }

    socket.on("rooms:all", (allRooms: Room[]) => {
      setRooms(allRooms);
      const history: { [key: string]: Message[] } = {};
      allRooms.forEach((r) => {
        if (r.messages) history[r.id] = r.messages;
      });
      setRoomMessages((prev) => ({ ...prev, ...history }));
    });

    socket.on("room:assigned", (data) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId
            ? { ...r, operatorId: data.operatorId, status: "active" }
            : r
        )
      );
    });

    socket.on("room:waiting", (room: Room) => {
      setRooms((prev) => {
        if (prev.find((r) => r.id === room.id)) return prev;
        return [...prev, room];
      });
    });

    socket.on("message:receive", (msg: any) => {
      const roomId = msg.room.id;
      setRoomMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), msg],
      }));

      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId ? { ...r, messages: [...(r.messages || []), msg] } : r
        )
      );

      if (activeRoomId !== roomId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1,
        }));
      }
    });

    socket.on("room:status", (data) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === data.roomId ? { ...r, status: data.status } : r))
      );
    });

    socket.on("room:updated", (updatedRoom: Room) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
      );
    });

    socket.on("user:left", (data) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === data.roomId ? { ...r, clientOnline: false } : r))
      );
      setRoomMessages((prev) => ({
        ...prev,
        [data.roomId]: [
          ...(prev[data.roomId] || []),
          {
            senderId: "system",
            senderType: "system",
            content: "Client has left the conversation",
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    });

    socket.on("user:joined", (data) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === data.roomId ? { ...r, clientOnline: true } : r))
      );
    });

    return () => {
      socket.off("rooms:all");
      socket.off("room:waiting");
      socket.off("message:receive");
      socket.off("room:status");
      socket.off("room:updated");
      socket.off("user:left");
      socket.off("user:joined");
    };
  }, [socket, isConnected, user, activeRoomId]);

  const joinRoom = useCallback(
    (roomId: string) => {
      setActiveRoomId(roomId);
      setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
      socket?.emit("room:join", { roomId });
    },
    [socket]
  );

  const sendMessage = useCallback(
    (roomId: string, content: string) => {
      if (!socket || !user) return;
      socket.emit("message:send", {
        roomId,
        senderId: user.id.toString(),
        senderType: "operator",
        content,
      });
    },
    [socket, user]
  );

  const closeRoom = useCallback(
    (roomId: string) => {
      socket?.emit("room:close", { roomId });
    },
    [socket]
  );

  return {
    rooms,
    roomMessages,
    unreadCounts,
    isConnected,
    socket,
    joinRoom,
    sendMessage,
    closeRoom,
  };
}
