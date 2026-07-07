"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Send, MessageCircle, X, Star, UserCheck, Loader2, Bot } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { API_BASE_URL } from "@/config/api";

// Speed: characters revealed per tick (higher = faster)
const TYPING_SPEED_MS = 12;
const CHARS_PER_TICK = 4;

/**
 * Renders bot message text with basic markdown:
 * - **text** → <strong>
 * - \n → line break
 */
function renderBotText(text: string) {
  return text.split('\n').map((line, lineIdx) => {
    // Split on **bold** tokens
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={lineIdx}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-semibold text-violet-800">{part}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
        {lineIdx < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

interface ChatMessage {
  id: number;
  senderType: string;
  content: string;
  createdAt?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState<string>("");
  const [room, setRoom] = useState<any>(null);
  const { socket, isConnected } = useSocket(API_BASE_URL);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [clientInfo, setClientInfo] = useState({
    name: "",
    contact: "",
    topic: "General",
  });
  const [rating, setRating] = useState(0);
  const [isResolved, setIsResolved] = useState(false);
  const [comment, setComment] = useState("");
  const [requestingOperator, setRequestingOperator] = useState(false);

  // ── Typing indicator (bot is thinking) ──────────────────────────────────────
  const [botIsTyping, setBotIsTyping] = useState(false);

  // ── Text animation state ─────────────────────────────────────────────────────
  // animating: { id of message being animated, how many chars are revealed }
  const [animating, setAnimating] = useState<{ id: number; revealed: number } | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = localStorage.getItem("chat_client_id");
    const savedName = localStorage.getItem("chat_client_name");
    const savedContact = localStorage.getItem("chat_client_contact");
    if (id) { setClientId(id); }
    else { const newId = uuidv4(); localStorage.setItem("chat_client_id", newId); setClientId(newId); }
    if (savedName && savedContact) {
      setClientInfo((prev) => ({ ...prev, name: savedName, contact: savedContact }));
    }
  }, []);

  // Auto-scroll whenever messages change or animation progresses
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, botIsTyping, animating]);

  // ── Text animation ticker ────────────────────────────────────────────────────
  useEffect(() => {
    if (!animating) return;

    const msg = messages.find((m) => m.id === animating.id);
    if (!msg) { setAnimating(null); return; }

    if (animating.revealed >= msg.content.length) {
      setAnimating(null);
      return;
    }

    animTimerRef.current = setTimeout(() => {
      setAnimating((prev) =>
        prev ? { ...prev, revealed: Math.min(prev.revealed + CHARS_PER_TICK, msg.content.length) } : null
      );
    }, TYPING_SPEED_MS);

    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [animating, messages]);

  // ── Socket events ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !clientId) return;

    socket.on("room:created", (newRoom) => {
      setRoom(newRoom);
      setMessages(newRoom.messages || []);
      setStep("chat");
    });

    socket.on("message:receive", (msg: ChatMessage) => {
      setBotIsTyping(false);
      setMessages((prev) => [...prev, msg]);
      // Trigger animation only for bot messages
      if (msg.senderType === "bot") {
        setAnimating({ id: msg.id, revealed: 0 });
      }
    });

    socket.on("bot:typing", () => {
      setBotIsTyping(true);
    });

    socket.on("room:status", (data) => {
      if (room && data.roomId === room.id && data.status === "closed") {
        setShowFeedback(true);
        setBotIsTyping(false);
      }
    });

    socket.on("room:updated", (updatedRoom) => {
      if (room && updatedRoom.id === room.id) {
        setRoom(updatedRoom);
        if (updatedRoom.operatorId) {
          setRequestingOperator(false);
          setBotIsTyping(false);
        }
      }
    });

    return () => {
      socket.off("room:created");
      socket.off("message:receive");
      socket.off("bot:typing");
      socket.off("room:status");
      socket.off("room:updated");
    };
  }, [socket, clientId, room]);

  const initChat = () => setIsOpen(true);

  const startChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInfo.name || !clientInfo.contact) return;
    localStorage.setItem("chat_client_name", clientInfo.name);
    localStorage.setItem("chat_client_contact", clientInfo.contact);
    socket?.emit("room:init", {
      clientId,
      clientName: clientInfo.name,
      clientContact: clientInfo.contact,
      topic: clientInfo.topic,
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !room) return;
    socket?.emit("message:send", {
      roomId: room.id,
      senderId: clientId,
      senderType: "client",
      content: message,
    });
    setMessage("");
  };

  const requestOperator = () => {
    if (!room) return;
    setRequestingOperator(true);
    setBotIsTyping(false);
    socket?.emit("room:request_operator", { roomId: room.id });
  };

  const submitFeedback = () => {
    socket?.emit("feedback:submit", { roomId: room.id, rating, isResolved, comment });
    setShowFeedback(false);
    setRoom(null);
    setStep("form");
    setMessages([]);
    setRating(0);
    setComment("");
    setRequestingOperator(false);
    setBotIsTyping(false);
    setAnimating(null);
  };

  // Resolved display text for animated messages
  const getDisplayContent = (msg: ChatMessage) => {
    if (animating?.id === msg.id) {
      return msg.content.substring(0, animating.revealed);
    }
    return msg.content;
  };

  const isCursorVisible = (msg: ChatMessage) =>
    animating?.id === msg.id && animating.revealed < msg.content.length;

  // Header label
  const headerStatus = () => {
    if (!room) return "Online Support";
    if (room.operatorId) return "Operator Connected";
    if (room.requestedOperator || requestingOperator) return "Connecting to operator…";
    return "Mainframe AI";
  };

  const headerDotColor = () => {
    if (room?.operatorId) return "bg-emerald-400";
    if (room?.requestedOperator || requestingOperator) return "bg-amber-400 animate-pulse";
    return "bg-violet-400 animate-pulse";
  };

  return (
    <div className={`fixed z-50 font-sans transition-all duration-300 ${
      isOpen ? "max-sm:inset-0 sm:bottom-6 sm:right-6" : "bottom-6 right-6"
    }`}>
      {!isOpen ? (
        <button
          onClick={initChat}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-500 transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle size={28} />
        </button>
      ) : (
        <div className="bg-white shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4 duration-300
          max-sm:w-full max-sm:h-full max-sm:rounded-none
          sm:w-[400px] sm:h-[650px] sm:rounded-2xl font-sans">

          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${headerDotColor()}`} />
              <span className="font-semibold text-sm">{headerStatus()}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {showFeedback ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <h3 className="font-bold text-slate-800">Support Chat Ended</h3>
                <p className="text-xs text-slate-500">How would you rate our support?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}
                      className={`text-2xl transition-all hover:scale-110 active:scale-90 ${rating >= s ? "text-yellow-400" : "text-slate-200"}`}>
                      <Star fill={rating >= s ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <div className="w-full text-left space-y-3">
                  <Checkbox label="Problem resolved?" checked={isResolved} onChange={setIsResolved} />
                  <Input placeholder="Any feedback..." value={comment} onChange={(e) => setComment(e.target.value)} className="h-20" />
                </div>
                <Button onClick={submitFeedback} disabled={rating === 0} className="w-full mt-4" size="lg">
                  Submit &amp; Close
                </Button>
              </div>
            ) : step === "form" && !room ? (
              <form id="chat-init-form" onSubmit={startChat} className="space-y-4 py-4">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-slate-800 text-lg">Start Conversation</h3>
                  <p className="text-xs text-slate-500">Please provide your details to connect with our team.</p>
                </div>
                <div className="space-y-4">
                  <Input label="Full Name" required value={clientInfo.name}
                    onChange={(e) => setClientInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name" />
                  <Input label="Email or Phone" required value={clientInfo.contact}
                    onChange={(e) => setClientInfo((prev) => ({ ...prev, contact: e.target.value }))}
                    placeholder="e.g. john@example.com" />
                  <Select label="What is your problem?" value={clientInfo.topic}
                    onChange={(val) => setClientInfo((prev) => ({ ...prev, topic: val }))}
                    options={[
                      { label: "General Support", value: "General Support" },
                      { label: "Technical Issue", value: "Technical Issue" },
                      { label: "Billing & Payments", value: "Billing & Payments" },
                      { label: "Sales Inquiry", value: "Sales Inquiry" },
                    ]} />
                </div>
              </form>
            ) : (
              <>
                {/* Status banners */}
                {(room?.requestedOperator || requestingOperator) && !room?.operatorId && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-700 text-xs font-medium">
                    <Loader2 size={14} className="animate-spin shrink-0" />
                    <span>Waiting for a human operator to join…</span>
                  </div>
                )}
                {room?.operatorId && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-emerald-700 text-xs font-medium">
                    <UserCheck size={14} className="shrink-0" />
                    <span>A support operator has joined the chat.</span>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg) => {
                  const isClient = msg.senderType === "client";
                  const isBot = msg.senderType === "bot";
                  const displayContent = getDisplayContent(msg);
                  const showCursor = isCursorVisible(msg);

                  return (
                    <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"} items-end gap-2`}>
                      {isBot && (
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mb-1">
                          <Bot size={14} className="text-violet-600" />
                        </div>
                      )}
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        isClient
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : isBot
                          ? "bg-violet-50 text-slate-800 rounded-tl-none border border-violet-200"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                      }`}>
                        {isBot && (
                          <span className="block text-[10px] text-violet-500 font-semibold uppercase tracking-wide mb-1">
                            Mainframe AI
                          </span>
                        )}
                        {isBot ? (
                          <span className="whitespace-pre-wrap break-words leading-relaxed">
                            {renderBotText(displayContent)}
                            {showCursor && (
                              <span className="inline-block w-[2px] h-[14px] bg-violet-400 ml-[1px] align-middle animate-pulse" />
                            )}
                          </span>
                        ) : (
                          <span className="whitespace-pre-wrap break-words">
                            {displayContent}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Bot typing indicator (three dots) */}
                {botIsTyping && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-violet-600" />
                    </div>
                    <div className="bg-violet-50 border border-violet-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!showFeedback && (
            <div className="bg-white border-t border-slate-100">
              {step === "chat" && room && !room.operatorId && !room.requestedOperator && !requestingOperator && (
                <div className="px-4 pt-3">
                  <button onClick={requestOperator}
                    className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg py-2 px-3 transition-all">
                    <UserCheck size={13} />
                    Talk to a human operator
                  </button>
                </div>
              )}
              <div className="p-4 flex gap-2 items-center">
                {step === "chat" ? (
                  <>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Write a message…"
                      className="flex-1 h-10 rounded-full"
                    />
                    <Button onClick={sendMessage} disabled={!isConnected} size="icon" className="rounded-full shrink-0">
                      <Send size={16} />
                    </Button>
                  </>
                ) : (
                  <Button type="submit" form="chat-init-form" disabled={!isConnected} className="w-full" size="lg"
                    isLoading={!isConnected && step === "form"}>
                    Start Chatting
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
