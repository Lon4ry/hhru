import NextLink from "next/link";
import { AnchorHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { UrlObject } from "node:url";
import { cn } from "@/shared";

const link = cva("rounded-lg px-4 py-2 transition", {
  variants: {
    disabled: {
      true: "bg-blue-100",
    },
    variant: {
      default: "bg-white text-white bg-blue-500 hover:bg-blue-600 ",
      ghost: "bg-transparent hover:underline",
    },
    active: {
      true: "text-blue-500 hover:no-underline",
    },
  },
  defaultVariants: {
    disabled: false,
    active: false,
    variant: "default",
  },
});

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "disabled" | "href">,
    VariantProps<typeof link> {
  href: string | UrlObject;
}

export function Link({
  className,
  disabled,
  active,
  variant,
  ...props
}: LinkProps) {
  return (
    <NextLink
      className={cn(link({ className, disabled, variant, active }))}
      {...props}
    />
  );
}
