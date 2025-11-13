
"use client";

import * as React from "react";
import { Inter } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { PlayersProvider } from "@/context/players-context";
import { CoachesProvider } from "@/context/coaches-context";
import { CalendarProvider } from "@/context/calendar-context";
import { FinancialProvider } from "@/context/financial-context";
import { ResultsProvider } from "@/context/results-context";
import { ClubProvider, useClubContext } from "@/context/club-context";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { ClubLogo } from "@/components/club-logo";
import { ThemeProvider } from "@/components/theme-provider";
import { OpponentsProvider } from "@/context/opponents-context";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: clubLoading } = useClubContext();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

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
  if ((authLoading || (user && clubLoading)) && !isAuthPage) {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logo = "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/football-logos-2023-design-template-ba96ccb6c8645a69c9eef50607d84d34_screen.jpg?ts=1667330722";
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="theme-color" content="#0ea5e9" />
          <link rel="apple-touch-icon" href={logo} />
          <link rel="icon" href={logo} type="image/jpeg" sizes="any" />
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
                <ResultsProvider>
                  <FinancialProvider>
                    <PlayersProvider>
                      <CoachesProvider>
                        <OpponentsProvider>
                          <CalendarProvider>
                            <AppContent>{children}</AppContent>
                          </CalendarProvider>
                        </OpponentsProvider>
                      </CoachesProvider>
                    </PlayersProvider>
                  </FinancialProvider>
                </ResultsProvider>
              </ClubProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
