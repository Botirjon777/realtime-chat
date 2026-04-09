"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Star, Search, Loader2, Filter, MessageSquare, BadgeCheck, BadgeAlert } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  isResolved: boolean;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  topic: string;
  operatorName: string;
}

export default function RatingsPage() {
  const router = useRouter();
  const { token, logout, isLoading: isAuthLoading } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/login");
    } else if (token) {
      fetchFeedbacks();
    }
  }, [token, isAuthLoading, router]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/feedbacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch feedbacks");
      }
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchesSearch =
        !search ||
        f.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        f.clientEmail?.toLowerCase().includes(search.toLowerCase()) ||
        f.operatorName?.toLowerCase().includes(search.toLowerCase()) ||
        f.topic?.toLowerCase().includes(search.toLowerCase());

      const matchesRating = ratingFilter === null || f.rating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [feedbacks, search, ratingFilter]);

  if (isAuthLoading || isLoading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      <AdminSidebar />

      <div className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
              Service Ratings
            </h2>
            <p className="text-slate-500 font-medium">
              Monitor customer satisfaction and operator performance.
            </p>
          </header>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search legacy feedbacks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-700 transition-all"
              />
            </div>
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setRatingFilter(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ratingFilter === null ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(star)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    ratingFilter === star ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {star} <Star size={12} fill={ratingFilter === star ? "white" : "none"} />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-20 text-center">
                <Star size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  No match found
                </p>
              </div>
            ) : (
              filteredFeedbacks.map((f) => (
                <div
                  key={f.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-xl group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Header Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 font-bold text-xs text-blue-400">
                          {f.clientName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h4 className="font-bold text-white leading-none">
                            {f.clientName || "Anonymous Client"}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {f.clientEmail}
                          </span>
                        </div>
                        <div className="ml-auto md:ml-4 flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < f.rating ? "text-yellow-400" : "text-slate-800"}
                              fill={i < f.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pl-13 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-950 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded border border-slate-800">
                            {f.topic}
                          </span>
                          <span className="text-slate-700 text-xs">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              Operator:
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                              {f.operatorName}
                            </span>
                          </div>
                          {f.isResolved ? (
                            <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-widest ml-auto">
                              <BadgeCheck size={14} /> Resolved
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-widest ml-auto">
                              <BadgeAlert size={14} /> Not Resolved
                            </div>
                          )}
                        </div>
                        {f.comment && (
                          <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl italic text-slate-400 text-sm leading-relaxed">
                            "{f.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        {new Date(f.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
