"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Star, ShieldCheck, Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/use-auth-store";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminVolumeChart } from "@/components/admin/admin-volume-chart";

import { useAdminDashboard } from "@/features/admin/hooks/use-admin-dashboard";
import { StatCard } from "@/features/admin/components/StatCard";

export default function AdminDashboard() {
  const { token, logout, isLoading: isAuthLoading } = useAuthStore();
  const router = useRouter();

  const { stats, volumeData, isDataLoading } = useAdminDashboard(token, logout);

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/login");
    }
  }, [token, isAuthLoading, router]);

  if (isAuthLoading || isDataLoading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                Platform Statistics
              </h2>
              <p className="text-slate-500 font-medium">
                Monitoring real-time performance and system health.
              </p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              title="Total Chats"
              value={stats?.totalRooms}
              icon={MessageSquare}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Sessions"
              value={stats?.activeRooms}
              icon={Loader2}
              color="bg-amber-500"
            />
            <StatCard
              title="Avg Rating"
              value={stats?.avgRating ? `${stats.avgRating}/5.0` : "0/5.0"}
              icon={Star}
              color="bg-green-500"
            />
            <StatCard
              title="Total Feedbacks"
              value={stats?.totalFeedbacks}
              icon={ShieldCheck}
              color="bg-purple-500"
            />
          </div>

          {/* Detailed View */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Conversation Volume</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Live Traffic
                </span>
              </div>
            </div>

            <div className="h-96 bg-slate-950 rounded-2xl border border-slate-800 p-6 relative group overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <AdminVolumeChart data={volumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
