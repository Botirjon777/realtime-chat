"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-[16px] text-slate-900 transition-all",
              "placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              "hover:border-slate-300",
              className,
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-0 rounded-xl bg-blue-600/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-200" />
        </div>
        {(error || hint) && (
          <p
            className={cn(
              "text-[10px] ml-1 font-medium",
              error ? "text-red-500" : "text-slate-400",
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
