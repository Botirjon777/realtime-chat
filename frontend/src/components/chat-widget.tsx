"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Send, MessageCircle, X, Minus, Star } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { API_BASE_URL } from "@/config/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState<string>("");
  const [room, setRoom] = useState<any>(null);
  const { socket, isConnected } = useSocket(API_BASE_URL);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = localStorage.getItem("chat_client_id");
    const savedName = localStorage.getItem("chat_client_name");
    const savedContact = localStorage.getItem("chat_client_contact");

    if (id) {
      setClientId(id);
    } else {
      const newId = uuidv4();
      localStorage.setItem("chat_client_id", newId);
      setClientId(newId);
    }

    if (savedName && savedContact) {
      setClientInfo((prev) => ({
        ...prev,
        name: savedName,
        contact: savedContact,
      }));
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !clientId) return;

    socket.on("room:created", (newRoom) => {
      setRoom(newRoom);
      setMessages(newRoom.messages || []);
      setStep("chat");
    });

    socket.on("message:receive", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("room:status", (data) => {
      if (room && data.roomId === room.id && data.status === "closed") {
        setShowFeedback(true);
      }
    });

    socket.on("room:updated", (updatedRoom) => {
      if (room && updatedRoom.id === room.id) {
        setRoom(updatedRoom);
      }
    });

    return () => {
      socket.off("room:created");
      socket.off("message:receive");
      socket.off("room:status");
      socket.off("room:updated");
    };
  }, [socket, clientId, room]);

  const initChat = () => {
    setIsOpen(true);
  };

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
    if (!message.trim()) return;

    if (!room) {
      alert("Please use the form to start a chat");
      return;
    }

    socket?.emit("message:send", {
      roomId: room.id,
      senderId: clientId,
      senderType: "client",
      content: message,
    });
    setMessage("");
  };

  const submitFeedback = () => {
    socket?.emit("feedback:submit", {
      roomId: room.id,
      rating,
      isResolved,
      comment,
    });
    setShowFeedback(false);
    setRoom(null);
    setStep("form");
    setMessages([]);
    setRating(0);
    setComment("");
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
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-sm">Online Support</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-500 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages / Feedback */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
          >
            {showFeedback ? (
              // ... existing feedback UI
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <h3 className="font-bold text-slate-800">Support Chat Ended</h3>
                <p className="text-xs text-slate-500">
                  How would you rate our support?
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`text-2xl transition-all hover:scale-110 active:scale-90 ${rating >= s ? "text-yellow-400" : "text-slate-200"}`}
                    >
                      <Star fill={rating >= s ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <div className="w-full text-left space-y-3">
                  <Checkbox
                    label="Problem resolved?"
                    checked={isResolved}
                    onChange={setIsResolved}
                  />
                  <Input
                    placeholder="Any feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="h-20"
                  />
                </div>
                <Button
                  onClick={submitFeedback}
                  disabled={rating === 0}
                  className="w-full mt-4"
                  size="lg"
                >
                  Submit & Close
                </Button>
              </div>
            ) : step === "form" && !room ? (
              <form
                id="chat-init-form"
                onSubmit={startChat}
                className="space-y-4 py-4"
              >
                <div className="text-center mb-6">
                  <h3 className="font-bold text-slate-800 text-lg">
                    Start Conversation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Please provide your details to connect with our team.
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    required
                    value={clientInfo.name}
                    onChange={(e) =>
                      setClientInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter your name"
                  />
                  <Input
                    label="Email or Phone"
                    required
                    value={clientInfo.contact}
                    onChange={(e) =>
                      setClientInfo((prev) => ({
                        ...prev,
                        contact: e.target.value,
                      }))
                    }
                    placeholder="e.g. john@example.com"
                  />
                  <Select
                    label="What is your problem?"
                    value={clientInfo.topic}
                    onChange={(val) =>
                      setClientInfo((prev) => ({
                        ...prev,
                        topic: val,
                      }))
                    }
                    options={[
                      { label: "General Support", value: "General Support" },
                      { label: "Technical Issue", value: "Technical Issue" },
                      {
                        label: "Billing & Payments",
                        value: "Billing & Payments",
                      },
                      { label: "Sales Inquiry", value: "Sales Inquiry" },
                    ]}
                  />
                </div>
              </form>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center text-slate-400 mt-10">
                    <p className="text-sm">
                      {room?.operatorId
                        ? "Operator connected!"
                        : "Connecting you to an operator..."}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-widest mt-2">
                      {clientInfo.topic}
                    </p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderType === "client" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.senderType === "client"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Input */}
          {!showFeedback && (
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
              {step === "chat" ? (
                <>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Write a message..."
                    className="flex-1 h-10 rounded-full"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!isConnected}
                    size="icon"
                    className="rounded-full shrink-0"
                  >
                    <Send size={16} />
                  </Button>
                </>
              ) : (
                <Button
                  type="submit"
                  form="chat-init-form"
                  disabled={!isConnected}
                  className="w-full"
                  size="lg"
                  isLoading={!isConnected && step === "form"}
                >
                  Start Chatting
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
