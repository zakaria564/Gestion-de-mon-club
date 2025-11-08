
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

  const defaultLogo = "https://firebasestorage.googleapis.com/v0/b/gestion-de-mon-club.appspot.com/o/logo_transparent.png?alt=media&token=2424b649-411a-43f7-8736-249113689404";
  const finalSrc = clubInfo?.logoUrl || defaultLogo;

  if (clubLoading || !isClient) {
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
