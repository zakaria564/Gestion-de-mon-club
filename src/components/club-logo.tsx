import * as React from "react"
import { cn } from "@/lib/utils"

export function ClubLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" className="fill-primary stroke-primary" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fill="hsl(var(--primary-foreground))"
        className="font-sans font-bold"
      >
        GC
      </text>
    </svg>
  );
}
