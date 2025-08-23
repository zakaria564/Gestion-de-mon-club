
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { SidebarInset } from '@/components/ui/sidebar';
import { FinancialProvider } from '@/context/financial-context';
import { PlayersProvider } from '@/context/players-context';
import { CoachesProvider } from '@/context/coaches-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { CalendarProvider } from '@/context/calendar-context';
import React from 'react';
import { usePathname } from 'next/navigation';

// We can't export metadata from a client component, but we can have this here.
// export const metadata: Metadata = {
//   title: 'Gestion de mon club',
//   description: 'Une application pour gérer votre club de sport.',
// };

function Providers({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

  if (loading) {
    return null; // or a loading spinner
  }

  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  return (
    <FinancialProvider>
      <PlayersProvider>
        <CoachesProvider>
          <CalendarProvider>
            {children}
          </CalendarProvider>
        </CoachesProvider>
      </PlayersProvider>
    </FinancialProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <title>Gestion de mon club</title>
        <meta name="description" content="Une application pour gérer votre club de sport." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <Providers>
            <AppLayout>
              <SidebarInset>
                {children}
              </SidebarInset>
            </AppLayout>
          </Providers>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
