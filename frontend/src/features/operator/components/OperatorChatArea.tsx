"use client";

import { motion } from "framer-motion";
import { MessageSquare, CheckCircle2, History } from "lucide-react";
import { Room, Message } from "../types";

interface OperatorChatAreaProps {
  activeRoom: Room | null;
  messages: Message[];
  user: any;
  roomsCount: number;
  onCloseRoom: (roomId: string) => void;
}

export function OperatorChatArea({
  activeRoom,
  messages,
  user,
  roomsCount,
  onCloseRoom,
}: OperatorChatAreaProps) {
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="p-8 bg-blue-600/5 border-b border-blue-600/10">
          <h2 className="text-2xl font-black text-white mb-1">
            Hello, {user?.firstName || "Operator"}!
          </h2>
          <p className="text-sm text-slate-400">
            You have{" "}
            <span className="text-blue-400 font-bold">{roomsCount}</span> chats
            in the inbound pool.
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center mb-6 shadow-2xl">
              <MessageSquare size={48} className="opacity-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">
              Ready for incoming requests
            </h3>
            <p className="text-sm text-slate-600">
              Select a chat from the sidebar to begin messaging
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-sm text-blue-400">
            {activeRoom.clientName?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">
              {activeRoom.clientName || "Private Client"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeRoom.clientOnline !== false &&
                  activeRoom.status !== "closed"
                    ? "text-green-500"
                    : "text-slate-500"
                }`}
              >
                {activeRoom.clientOnline !== false &&
                activeRoom.status !== "closed"
                  ? "Active"
                  : "Offline"}
              </p>
              <span className="text-slate-800">•</span>
              <p className="text-[10px] text-slate-500 font-medium">
                {activeRoom.clientContact}
              </p>
              <span className="text-slate-800">•</span>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                {activeRoom.topic}
              </p>
            </div>
          </div>
        </div>

        {activeRoom.status !== "closed" && (
          <button
            onClick={() => onCloseRoom(activeRoom.id)}
            className="px-4 py-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/50 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={14} /> End Session
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-800/50">
        {messages.map((msg, idx) => {
          if (msg.senderType === "system") {
            return (
              <div key={idx} className="flex justify-center">
                <span className="bg-slate-900 text-slate-500 text-[10px] px-3 py-1 rounded-full border border-slate-800 uppercase font-bold tracking-widest">
                  {msg.content}
                </span>
              </div>
            );
          }
          const isOperator = msg.senderType === "operator";
          return (
            <div
              key={idx}
              className={`flex ${isOperator ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex flex-col ${isOperator ? "items-end" : "items-start"} max-w-[70%]`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isOperator
                      ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20"
                      : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 font-medium uppercase tracking-tighter">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {activeRoom.status === "active" && activeRoom.clientOnline === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-900/30 p-4 rounded-2xl text-center space-y-3"
          >
            <p className="text-xs text-red-300 font-medium">
              The client is offline. You might want to close this session.
            </p>
            <button
              onClick={() => onCloseRoom(activeRoom.id)}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-900/20"
            >
              Close Chat Now
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
