import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg transition-all hover:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split("-")[1]}-500`}
        >
          <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          KPI
        </span>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value || "0"}</h3>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">
        {title}
      </p>
    </div>
  );
}
