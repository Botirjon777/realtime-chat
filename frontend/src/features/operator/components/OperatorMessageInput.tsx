"use client";

import { useState } from "react";
import { Send, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OperatorMessageInputProps {
  status: "waiting" | "active" | "closed";
  onSendMessage: (content: string) => void;
  isConnected: boolean;
}

export function OperatorMessageInput({
  status,
  onSendMessage,
  isConnected,
}: OperatorMessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  if (status === "closed") {
    return (
      <div className="p-8 bg-slate-900/20 border-t border-slate-800/50 flex flex-col items-center justify-center text-slate-500">
        <History className="mb-3 opacity-20" size={32} />
        <p className="text-sm font-medium">This conversation is archived</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/30 border-t border-slate-800/50">
      <div className="bg-slate-900 border border-slate-700 p-2 rounded-2xl flex items-center gap-2 shadow-inner focus-within:border-blue-500/50 transition-colors">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Write a response..."
          className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:ring-0 outline-none text-slate-200 placeholder:text-slate-600"
        />
        <Button
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
          size="icon"
          className="rounded-xl shrink-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
