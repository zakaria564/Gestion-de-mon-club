
import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ClubLogoProps extends Omit<React.SVGProps<SVGSVGElement>, 'src'> {
    src?: string | null;
    containerClassName?: string;
}

export function ClubLogo({ className, src, containerClassName, ...props }: ClubLogoProps) {
  const finalSrc = src || "https://image.noelshack.com/fichiers/2025/35/6/1756565561-football-logo-design-template-bebebf8ff1c25b66b504d37afaee99f0-screen.jpg";

  if (finalSrc) {
      return (
        <div className={cn("relative flex items-center justify-center rounded-full", containerClassName)}>
            <Image 
              src={finalSrc} 
              alt="Club Logo" 
              width={40} 
              height={40} 
              className={cn("rounded-full bg-white", className)} 
              data-ai-hint="club logo" 
            />
        </div>
      )
  }
  
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
