"use client";

import { Users, Trash2 } from "lucide-react";
import { Operator } from "../types";

interface OperatorTableProps {
  operators: Operator[];
  onDelete: (id: number) => void;
}

export function OperatorTable({ operators, onDelete }: OperatorTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px] font-black">
            <th className="px-8 py-5">Name</th>
            <th className="px-8 py-5">Email Address</th>
            <th className="px-8 py-5">Role</th>
            <th className="px-8 py-5 text-center">Status</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {operators.map((op) => (
            <tr
              key={op.id}
              className="group hover:bg-slate-800/30 transition-all"
            >
              <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 group-hover:bg-blue-600/10 group-hover:border-blue-600/30 transition-all">
                    <Users
                      size={18}
                      className="text-slate-500 group-hover:text-blue-500"
                    />
                  </div>
                  <span className="font-bold text-sm text-white">
                    {op.firstName} {op.lastName}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5">
                <span className="text-sm text-slate-400 font-medium">
                  {op.email}
                </span>
              </td>
              <td className="px-8 py-5">
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700">
                  {op.role}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex justify-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      op.status === "online"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${op.status === "online" ? "bg-green-500 animate-pulse" : "bg-slate-500"}`}
                    />
                    {op.status === "online" ? "Active" : "Offline"}
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <button
                  onClick={() => onDelete(op.id)}
                  className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {operators.length === 0 && (
        <div className="py-24 text-center">
          <Users size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            No operators matched your search
          </p>
        </div>
      )}
    </div>
  );
}
