import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full resize-none rounded-2xl border border-selah-gold/20 bg-selah-bg2 px-4 py-3 text-[15px] leading-relaxed text-selah-cream",
        "placeholder:text-selah-cream3/60 outline-none transition-colors",
        "focus:border-selah-gold/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
