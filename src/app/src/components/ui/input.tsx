import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/10 bg-selah-bg/70 px-4 py-2 text-[15px] text-selah-cream",
          "placeholder:text-selah-cream3/70 outline-none transition-all",
          "focus:border-selah-gold focus:ring-2 focus:ring-selah-gold/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
