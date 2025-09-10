
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useClubContext } from "@/context/club-context"
import { Skeleton } from "./ui/skeleton"

interface ClubImageProps {
    className?: string;
    imageClassName?: string;
}

export function ClubImage({ className, imageClassName }: ClubImageProps) {
  const { clubInfo, loading: clubLoading } = useClubContext();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const finalSrc = clubInfo?.logoUrl || "https://img.logoipsum.com/289.svg";

  if (clubLoading || !isClient) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  return (
    <div className={cn("relative flex items-center justify-center rounded-full bg-white", className)}>
        <Image 
          src={finalSrc} 
          alt="Club Logo" 
          width={40} 
          height={40} 
          className={cn("rounded-full", imageClassName)} 
          data-ai-hint="club logo" 
        />
    </div>
  )
}
