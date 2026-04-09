"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    const id = React.useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className="flex items-center space-x-2 group">
        <div className="relative flex items-center justify-center">
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={handleChange}
            ref={ref}
            {...props}
          />
          <motion.div
            initial={false}
            animate={{
              backgroundColor: checked ? "#2563eb" : "#ffffff",
              borderColor: checked ? "#2563eb" : "#e2e8f0",
              scale: checked ? 1 : 1,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "h-5 w-5 rounded-md border-2 transition-colors cursor-pointer flex items-center justify-center",
              "peer-focus:ring-2 peer-focus:ring-blue-600 peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              className
            )}
            onClick={() => !props.disabled && onChange?.(!checked)}
          >
            <motion.div
              initial={false}
              animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
              transition={{ duration: 0.1 }}
            >
              <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
            </motion.div>
          </motion.div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-600 cursor-pointer select-none group-hover:text-slate-900 transition-colors"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
