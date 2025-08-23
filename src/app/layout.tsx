
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

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

function Providers({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(pathname);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user && !isAuthPage) {
    return null; // A ProtectedRoute will handle the redirect
  }
  
  if (!user && isAuthPage) {
    return <>{children}</>;
  }

  if(user) {
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

  return null;
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
          <Providers>{children}</Providers>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
