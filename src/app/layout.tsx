import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { SidebarInset } from '@/components/ui/sidebar';
import { FinancialProvider } from '@/context/financial-context';
import { PlayersProvider } from '@/context/players-context';
import { CoachesProvider } from '@/context/coaches-context';
import { AuthProvider } from '@/context/auth-context';
import { CalendarProvider } from '@/context/calendar-context';

export const metadata: Metadata = {
  title: 'Gestion de mon club',
  description: 'Une application pour gérer votre club de sport.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
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
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
