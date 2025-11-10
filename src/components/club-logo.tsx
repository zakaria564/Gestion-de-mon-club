
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
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
  
  const finalSrc = clubInfo?.logoUrl;

  if (clubLoading || !isClient || !finalSrc) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  return (
    <div className={cn("relative flex items-center justify-center rounded-full bg-transparent overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={finalSrc} 
          alt="Club Logo" 
          width={60} 
          height={60} 
          className={cn("w-full h-full object-cover", imageClassName)} 
          data-ai-hint="club logo" 
        />
    </div>
  )
}
