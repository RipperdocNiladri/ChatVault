import React from "react";
import { cn } from "@/lib/utils";

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

export function MaterialIcon({
  name,
  filled = false,
  className,
  size,
}: MaterialIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined select-none leading-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...(size ? { fontSize: `${size}px` } : {}),
      }}
    >
      {name}
    </span>
  );
}
