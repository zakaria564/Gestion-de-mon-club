
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Trophy,
  Banknote,
  Settings,
  BarChart,
  Shield,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import { ClubLogo } from "@/components/club-logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ProtectedRoute, useAuth } from "@/context/auth-context";
import { useClubContext } from "@/context/club-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/players", label: "Joueurs", icon: Users },
  { href: "/coaches", label: "Entraîneurs", icon: UserCheck },
  { href: "/opponents", label: "Adversaires", icon: Shield },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/results", label: "Résultats", icon: Trophy },
  { href: "/ranking", label: "Classement", icon: BarChart },
  { href: "/finances", label: "Paiements", icon: Banknote },
  { href: "/registration-form", label: "Fiche d'inscription", icon: FileText },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function DesktopHeader() {
    return (
        <header className="hidden md:flex sticky top-0 z-10 h-14 items-center justify-end gap-4 border-b bg-background px-6">
            <ClubLogo className="h-9 w-9" />
        </header>
    );
}


function MobileHeader() {
    const pathname = usePathname();
    const currentPage = navItems.find((item) => item.href === pathname);
    const pageTitle = currentPage ? currentPage.label : "Gestion Club";

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <span className="font-semibold">{pageTitle}</span>
            </div>
            <ClubLogo className="h-9 w-9" />
        </header>
    );
}

function MainAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut, loading } = useAuth();
  const { clubInfo, loading: clubLoading } = useClubContext();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();


  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message,
      });
    }
  }

  if (loading || clubLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
          <ClubLogo className="size-12" imageClassName="animate-pulse" />
      </div>
    );
  }

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  return (
    <ProtectedRoute>
        <div className={cn("flex min-h-screen w-full", isMobile && "no-select")}>
            <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                <ClubLogo className="size-12 shrink-0" />
                <span className="text-lg font-semibold truncate">{clubInfo.name}</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label }}
                        onClick={handleLinkClick}
                    >
                        <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 p-2">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "Admin"} data-ai-hint="user avatar" />
                        <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-left group-data-[collapsible=icon]:hidden">
                        <p className="font-medium text-sm truncate">Compte</p>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName || "Admin"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>Profil</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>Paramètres</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        Se déconnecter
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
            </Sidebar>
            <main className="flex-1 flex flex-col overflow-auto w-full">
                <MobileHeader />
                <DesktopHeader />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    </ProtectedRoute>
  )
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainAppLayout>{children}</MainAppLayout>
    </SidebarProvider>
  )
}
