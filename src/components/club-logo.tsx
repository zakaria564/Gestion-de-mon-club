
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

  const defaultLogo = "https://image.noelshack.com/fichiers/2025/45/4/1762466303-football-logos-2023-design-template-ba96ccb6c8645a69c9eef50607d84d34-screen.png";
  const finalSrc = clubInfo?.logoUrl || defaultLogo;

  if (clubLoading || !isClient) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  return (
    <div className={cn("relative flex items-center justify-center rounded-full bg-transparent p-1", className)}>
        <Image 
          src={finalSrc} 
          alt="Club Logo" 
          width={40} 
          height={40} 
          className={cn("rounded-full object-contain", imageClassName)} 
          data-ai-hint="club logo" 
        />
    </div>
  )
}
