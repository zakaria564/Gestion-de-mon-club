
"use client";

import * as React from "react";
import { Inter } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { PlayersProvider, usePlayersContext } from "@/context/players-context";
import { CoachesProvider, useCoachesContext } from "@/context/coaches-context";
import { CalendarProvider, useCalendarContext } from "@/context/calendar-context";
import { FinancialProvider, useFinancialContext } from "@/context/financial-context";
import { ResultsProvider, useResultsContext } from "@/context/results-context";
import { ClubProvider, useClubContext } from "@/context/club-context";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { ClubLogo } from "@/components/club-logo";
import { ThemeProvider } from "@/components/theme-provider";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: clubLoading } = useClubContext();
  const { loading: playersLoading } = usePlayersContext();
  const { loading: coachesLoading } = useCoachesContext();
  const { loading: calendarLoading } = useCalendarContext();
  const { loading: financialLoading } = useFinancialContext();
  const { loading: resultsLoading } = useResultsContext();
  
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

  const isLoading = authLoading || clubLoading || playersLoading || coachesLoading || calendarLoading || financialLoading || resultsLoading;

  React.useEffect(() => {
    if (authLoading) return; 

    if (user && isAuthPage) {
      router.push('/');
    }
    
    if (!user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, authLoading, isAuthPage, pathname, router]);

  // Global loading state for the whole app
  if (isLoading && !isAuthPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ClubLogo className="size-12" imageClassName="animate-pulse" />
      </div>
    );
  }
  
  if (user && !isAuthPage) {
    return <AppLayout>{children}</AppLayout>;
  }
  
  if (!user && isAuthPage) {
    return <>{children}</>;
  }

  // Fallback for edge cases, e.g. initial load before routing logic kicks in
  return (
    <div className="flex h-screen w-full items-center justify-center">
        <ClubLogo className="size-12" imageClassName="animate-pulse" />
    </div>
  );
}

function AppHead() {
    const { clubInfo } = useClubContext();
    const logo = clubInfo?.logoUrl || "/icon-192x192.png";

    return (
        <head>
            <link rel="manifest" href="/manifest.webmanifest" />
            <meta name="theme-color" content="#0ea5e9" />
            <link rel="apple-touch-icon" href={logo} />
            <link rel="icon" href={logo} type="image/png" sizes="any" />
      </head>
    )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <ClubProvider>
                  <PlayersProvider>
                    <CoachesProvider>
                      <CalendarProvider>
                        <FinancialProvider>
                            <ResultsProvider>
                              <AppHead />
                              <AppContent>{children}</AppContent>
                            </ResultsProvider>
                        </FinancialProvider>
                      </CalendarProvider>
                    </CoachesProvider>
                  </PlayersProvider>
                </ClubProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
