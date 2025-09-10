
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useClubContext } from "@/context/club-context"
import { Skeleton } from "./ui/skeleton"

interface ClubLogoProps {
    className?: string;
    imageClassName?: string;
}

export function ClubLogo({ className, imageClassName }: ClubLogoProps) {
  const { clubInfo, loading: clubLoading } = useClubContext();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const finalSrc = clubInfo?.logoUrl || "https://image.noelshack.com/fichiers/2025/35/6/1756565561-football-logo-design-template-bebebf8ff1c25b66b504d37afaee99f0-screen.jpg";

  if (clubLoading || !isClient) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  return (
    <div className={cn("relative flex items-center justify-center rounded-full", className)}>
        <Image 
          src={finalSrc} 
          alt="Club Logo" 
          width={40} 
          height={40} 
          className={cn("rounded-full bg-white", imageClassName)} 
          data-ai-hint="club logo" 
        />
    </div>
  )
}
