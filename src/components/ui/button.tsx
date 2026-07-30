import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** כפתורי המותג — pill תמיד, וריאנטים לפי העיצובים. */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border-none font-bold no-underline transition-colors disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        brand:
          "bg-brand text-white shadow-[0_12px_28px_rgba(0,0,255,0.25)] hover:bg-brand-hover",
        accent: "bg-accent text-white hover:bg-accent-hover",
        outline:
          "border border-solid border-hairline bg-white font-normal text-ink hover:border-brand hover:text-brand",
        "outline-accent":
          "border-[1.5px] border-solid border-accent bg-white font-normal text-accent-text hover:bg-accent-tint",
        ghost: "bg-transparent font-normal text-ink hover:text-brand",
        link: "bg-transparent p-0 text-brand hover:underline",
      },
      size: {
        default: "min-h-[50px] px-7 py-3 text-[17px]",
        sm: "min-h-11 px-5 py-2 text-[15.5px]",
        lg: "min-h-[52px] px-11 py-4 text-lg md:text-[19px]",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "brand", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
