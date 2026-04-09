"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

// Features
import { useOperatorSocket } from "@/features/operator/hooks/use-operator-socket";
import { OperatorSidebar } from "@/features/operator/components/OperatorSidebar";
import { OperatorChatArea } from "@/features/operator/components/OperatorChatArea";
import { OperatorMessageInput } from "@/features/operator/components/OperatorMessageInput";
import { OperatorTab } from "@/features/operator/types";

export default function OperatorDashboard() {
  const router = useRouter();
  const { token, logout, isLoading: isAuthLoading, user } = useAuthStore();

  const {
    rooms,
    roomMessages,
    unreadCounts,
    isConnected,
    joinRoom,
    sendMessage,
    closeRoom,
  } = useOperatorSocket(user);

  const [activeTab, setActiveTab] = useState<OperatorTab>("active");
  const [filter, setFilter] = useState("");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Auth check
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/login");
    }
  }, [token, isAuthLoading, router]);

  // Clock for relative time
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getWaitingTime = (createdAt: string) => {
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const filteredSortedRooms = useMemo(() => {
    const currentUserId = user?.id?.toString();
    return rooms
      .filter((r) => {
        const matchesFilter =
          !filter ||
          r.clientName?.toLowerCase().includes(filter.toLowerCase()) ||
          r.topic?.toLowerCase().includes(filter.toLowerCase()) ||
          r.id.toLowerCase().includes(filter.toLowerCase());

        if (!matchesFilter) return false;

        if (activeTab === "closed") return r.status === "closed";
        return (
          r.status === "waiting" ||
          (r.status === "active" && r.operatorId === currentUserId)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [rooms, activeTab, user, filter]);

  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    joinRoom(roomId);
  };

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) || null,
    [rooms, activeRoomId]
  );
  const activeMessages = activeRoom ? roomMessages[activeRoom.id] || [] : [];

  if (isAuthLoading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <OperatorSidebar
        user={user}
        isConnected={isConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filter={filter}
        setFilter={setFilter}
        activeRoomId={activeRoomId}
        joinRoom={handleJoinRoom}
        filteredRooms={filteredSortedRooms}
        unreadCounts={unreadCounts}
        getWaitingTime={getWaitingTime}
        logout={() => {
          logout();
          router.push("/login");
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <OperatorChatArea
          activeRoom={activeRoom}
          messages={activeMessages}
          user={user}
          roomsCount={rooms.filter((r) => r.status === "waiting").length}
          onCloseRoom={closeRoom}
        />

        {activeRoom && (
          <OperatorMessageInput
            status={activeRoom.status}
            isConnected={isConnected}
            onSendMessage={(content) => sendMessage(activeRoom.id, content)}
          />
        )}
      </div>
    </div>
  );
}
