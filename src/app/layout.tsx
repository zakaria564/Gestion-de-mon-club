
"use client";

import * as React from "react";
import { Inter } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { PlayersProvider } from "@/context/players-context";
import { CoachesProvider } from "@/context/coaches-context";
import { CalendarProvider } from "@/context/calendar-context";
import { FinancialProvider } from "@/context/financial-context";
import { ResultsProvider } from "@/context/results-context";
import { ClubProvider } from "@/context/club-context";
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

function AppProviders({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

  React.useEffect(() => {
    if (loading) return; 

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
        <ClubLogo className="size-12" imageClassName="animate-pulse" />
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
                    <ClubProvider>
                        <AppLayout>{children}</AppLayout>
                    </ClubProvider>
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

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <ClubLogo className="size-12" imageClassName="animate-pulse" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
       <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="https://img.logoipsum.com/288.svg" type="image/svg+xml" />
      </head>
      <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <ClubProvider>
                <AppProviders>{children}</AppProviders>
              </ClubProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
