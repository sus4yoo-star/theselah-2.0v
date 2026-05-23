import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-selah-gold text-selah-bg font-semibold shadow-[0_8px_28px_rgba(212,175,55,0.18)] hover:brightness-110 active:scale-[0.98]",
        outline:
          "border border-selah-gold/30 bg-selah-bg1/60 text-selah-cream hover:border-selah-gold hover:bg-selah-bg2 active:scale-[0.98]",
        ghost:
          "text-selah-cream2 hover:bg-white/5 hover:text-selah-cream",
        subtle:
          "border border-white/10 bg-selah-bg2/70 text-selah-cream2 hover:bg-selah-bg3/70 hover:text-selah-cream",
        destructive:
          "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        link: "text-selah-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-[13px]",
        lg: "h-12 rounded-2xl px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
