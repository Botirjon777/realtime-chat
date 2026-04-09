"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OperatorFiltersProps {
  search: string;
  setSearch: (value: string) => void;
}

export function OperatorFilters({ search, setSearch }: OperatorFiltersProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl mb-8 flex items-center gap-4 shadow-lg transition-all hover:border-slate-700">
      <div className="relative flex-1 group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-700 transition-all focus:border-transparent"
        />
      </div>
      <Button
        variant="secondary"
        size="md"
        className="px-6 rounded-2xl font-bold flex items-center gap-2"
      >
        <Filter size={16} /> Filters
      </Button>
    </div>
  );
}
