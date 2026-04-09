"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/use-auth-store";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";

// Features
import { useOperatorManagement } from "@/features/admin/operators/hooks/use-operator-management";
import { OperatorTable } from "@/features/admin/operators/components/OperatorTable";
import { AddOperatorModal } from "@/features/admin/operators/components/AddOperatorModal";
import { OperatorFilters } from "@/features/admin/operators/components/OperatorFilters";

export default function OperatorsPage() {
  const { token, logout, isLoading: isAuthLoading } = useAuthStore();
  const router = useRouter();

  const {
    operators,
    isDataLoading,
    search,
    setSearch,
    createOperator,
    deleteOperator,
  } = useOperatorManagement(token, logout);

  const [showAddModal, setShowAddModal] = useState(false);

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
                Staff Management
              </h2>
              <p className="text-slate-500 font-medium">
                Create and monitor operator accounts and system access.
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              size="lg"
              className="px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-900/30"
            >
              <Plus size={20} /> Add Operator
            </Button>
          </header>

          {/* List Controls */}
          <OperatorFilters search={search} setSearch={setSearch} />

          {/* Operators Table */}
          <OperatorTable
            operators={operators}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this operator?")) {
                deleteOperator(id);
              }
            }}
          />
        </div>
      </div>

      {/* Add Operator Modal */}
      <AddOperatorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createOperator}
      />
    </div>
  );
}
