
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
import { ClubLogo } from '@/components/club-logo';

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
    // Affiche un écran de chargement global pendant que Firebase vérifie l'authentification
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
            <ClubLogo className="size-12 animate-pulse" />
        </div>
    );
  }
  
  // Si c'est une page d'authentification ou si l'utilisateur n'est pas connecté,
  // on affiche la page directement, sans les fournisseurs de données.
  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  // Si l'utilisateur est connecté et que ce n'est pas une page d'authentification,
  // on enveloppe l'application avec tous les fournisseurs de données.
  return (
    <FinancialProvider>
      <PlayersProvider>
        <CoachesProvider>
          <CalendarProvider>
             <AppLayout>
              <SidebarInset>
                {children}
              </SidebarInset>
            </AppLayout>
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
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

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
          { isAuthPage ? children : <Providers>{children}</Providers> }
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
