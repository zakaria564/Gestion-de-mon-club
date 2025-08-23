
"use client";

import * as React from "react";
import { Inter } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { PlayersProvider } from "@/context/players-context";
import { CoachesProvider } from "@/context/coaches-context";
import { CalendarProvider } from "@/context/calendar-context";
import { FinancialProvider } from "@/context/financial-context";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
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
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ClubLogo className="size-12 animate-pulse" />
      </div>
    );
  }

  if (user) {
    if (isAuthPage) {
       // Redirect to home if user is logged in and tries to access auth pages
       // This can be handled by a dedicated component or hook in a real app
       if (typeof window !== 'undefined') {
          window.location.href = '/';
       }
       return null;
    }
    return (
      <PlayersProvider>
        <CoachesProvider>
          <CalendarProvider>
            <FinancialProvider>
              <AppLayout>{children}</AppLayout>
            </FinancialProvider>
          </CalendarProvider>
        </CoachesProvider>
      </PlayersProvider>
    );
  }

  if (!user && !isAuthPage) {
     // Redirect to login if user is not logged in and not on an auth page
     if (typeof window !== 'undefined') {
        window.location.href = '/login';
     }
     return null;
  }
  
  // User is not logged in and on an auth page
  return <>{children}</>;
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
