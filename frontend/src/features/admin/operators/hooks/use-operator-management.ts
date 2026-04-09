"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Operator, NewOperatorPayload } from "../types";
import { API_BASE_URL } from "@/config/api";

export function useOperatorManagement(token: string | null, logout: () => void) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { socket } = useSocket(API_BASE_URL);

  const fetchOperators = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/operators`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
          return;
        }
        throw new Error("Failed to fetch operators");
      }

      const data = await res.json();
      setOperators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDataLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  useEffect(() => {
    if (!socket) return;

    socket.on("operator:status", (data) => {
      setOperators((prev) =>
        prev.map((op) =>
          op.id.toString() === data.operatorId.toString()
            ? { ...op, status: data.status }
            : op
        )
      );
    });

    return () => {
      socket.off("operator:status");
    };
  }, [socket]);

  const createOperator = async (payload: NewOperatorPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/operators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create operator");

      const created = await res.json();
      setOperators((prev) => [...prev, created]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteOperator = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/operators/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete operator");
      setOperators((prev) => prev.filter((op) => op.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const filteredOperators = useMemo(() => {
    return operators.filter(
      (op) =>
        op.email.toLowerCase().includes(search.toLowerCase()) ||
        op.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        op.lastName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [operators, search]);

  return {
    operators: filteredOperators,
    isDataLoading,
    search,
    setSearch,
    createOperator,
    deleteOperator,
    refresh: fetchOperators,
  };
}
