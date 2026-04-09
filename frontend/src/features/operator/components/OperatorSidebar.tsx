"use client";

import { motion } from "framer-motion";
import {
  User as UserIcon,
  Inbox,
  History,
  Search,
  MessageSquare,
  Clock,
  Power,
} from "lucide-react";
import { Room, OperatorTab } from "../types";

interface OperatorSidebarProps {
  user: any;
  isConnected: boolean;
  activeTab: OperatorTab;
  setActiveTab: (tab: OperatorTab) => void;
  filter: string;
  setFilter: (filter: string) => void;
  activeRoomId: string | null;
  joinRoom: (roomId: string) => void;
  filteredRooms: Room[];
  unreadCounts: { [key: string]: number };
  getWaitingTime: (createdAt: string) => string;
  logout: () => void;
}

export function OperatorSidebar({
  user,
  isConnected,
  activeTab,
  setActiveTab,
  filter,
  setFilter,
  activeRoomId,
  joinRoom,
  filteredRooms,
  unreadCounts,
  getWaitingTime,
  logout,
}: OperatorSidebarProps) {
  return (
    <motion.div
      initial={{ width: 320 }}
      className="bg-slate-900 border-r border-slate-800 flex flex-col z-40 relative overflow-hidden h-full shadow-2xl"
    >
      <div className="p-4 pt-16 border-b border-slate-800 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <UserIcon size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Operator Center"}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              {user?.role || "Dashboard"}
            </p>
          </div>
          <div
            className={`ml-auto w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}
          />
          <span className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {isConnected ? "Active" : "Disconnected"}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "active"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Inbox size={14} /> Active
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "closed"
                ? "bg-slate-700 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History size={14} /> Closed
          </button>
        </div>

        {/* Filter Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by name or topic..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-[11px] outline-none focus:ring-1 focus:ring-blue-500 text-slate-300 placeholder:text-slate-600 transition-all focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredRooms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <MessageSquare size={32} className="mb-2 opacity-10" />
            <p className="text-sm">No {activeTab} chats found</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => joinRoom(room.id)}
              className={`group p-3 rounded-xl cursor-pointer transition-all border ${
                activeRoomId === room.id
                  ? "bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/10"
                  : "bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 font-bold text-xs text-blue-400 group-hover:border-blue-500/50 transition-colors">
                    {room.clientName?.charAt(0) || "?"}
                  </div>
                  {room.clientOnline !== false && room.status !== "closed" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm truncate">
                      {room.clientName || `Client #${room.id.slice(0, 4)}`}
                    </p>
                    {unreadCounts[room.id] > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                        {unreadCounts[room.id]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1 py-0.5 bg-slate-950 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded border border-slate-800">
                      {room.topic || "General"}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-slate-500 font-medium whitespace-nowrap">
                      <Clock size={10} /> {getWaitingTime(room.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-950/20 transition-all font-bold text-sm"
        >
          <Power size={18} /> Sign Out
        </button>
      </div>
    </motion.div>
  );
}
