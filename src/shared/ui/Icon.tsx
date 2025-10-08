import { SVGAttributes } from "react";
import { cn } from "@/shared";

export interface IconProps extends SVGAttributes<SVGElement> {
  name: string;
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("icon", className)} {...props}>
      <use href={`/icons.svg#icon-${name}`} />
    </svg>
  );
}
