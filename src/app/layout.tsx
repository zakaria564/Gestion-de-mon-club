
"use client";

import * as React from "react";
import { Inter } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { PlayersProvider } from "@/context/players-context";
import { CoachesProvider } from "@/context/coaches-context";
import { CalendarProvider } from "@/context/calendar-context";
import { FinancialProvider } from "@/context/financial-context";
import { ResultsProvider } from "@/context/results-context";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { ClubLogo } from "@/components/club-logo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

function AppProviders({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

  React.useEffect(() => {
    if (loading) return; // Ne rien faire pendant le chargement

    if (user && isAuthPage) {
      router.push('/');
    }
    
    if (!user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, loading, isAuthPage, pathname, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ClubLogo className="size-12 animate-pulse" />
      </div>
    );
  }

  if (user && !isAuthPage) {
    return (
      <PlayersProvider>
        <CoachesProvider>
          <CalendarProvider>
            <FinancialProvider>
                <ResultsProvider>
                    <AppLayout>{children}</AppLayout>
                </ResultsProvider>
            </FinancialProvider>
          </CalendarProvider>
        </CoachesProvider>
      </PlayersProvider>
    );
  }
  
  if (!user && isAuthPage) {
    return <>{children}</>;
  }

  // Fallback pour les cas transitoires (par exemple, pendant que le routeur redirige)
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <ClubLogo className="size-12 animate-pulse" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <AuthProvider>
          <AppProviders>{children}</AppProviders>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

    