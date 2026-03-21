
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Stethoscope, AlertCircle, Banknote, FileText } from "lucide-react";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useCalendarContext } from "@/context/calendar-context";
import { useClubContext } from "@/context/club-context";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isSameDay, isAfter, startOfDay } from "date-fns";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))', 'U23': 'hsl(var(--chart-2))', 'U19': 'hsl(var(--chart-3))', 'U18': 'hsl(var(--chart-4))', 'U17': 'hsl(var(--chart-5))', 'U16': 'hsl(var(--chart-6))', 'U15': 'hsl(var(--chart-7))', 'U13': 'hsl(var(--chart-8))', 'U9': 'hsl(25 60% 45%)', 'U11': 'hsl(var(--chart-10))', 'U7': 'hsl(var(--chart-11))', 'U20': 'hsl(340, 80%, 55%)',
};

export default function Dashboard() {
  const { players, loading: playersLoading } = usePlayersContext();
  const { coaches, loading: coachesLoading } = useCoachesContext();
  const { calendarEvents, loading: calendarLoading } = useCalendarContext();
  const { clubInfo } = useClubContext();
  const { profile } = useAuth();
  
  const loading = playersLoading || coachesLoading || calendarLoading;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);

    return (calendarEvents || [])
      .filter(event => {
        try {
          const eventDate = parseISO(event.date);
          if (isSameDay(eventDate, todayStart)) {
            if (!event.time) return true;
            const [hours, minutes] = event.time.split(':').map(Number);
            const eventTime = new Date(eventDate);
            eventTime.setHours(hours, minutes);
            return eventTime >= now;
          }
          return isAfter(eventDate, todayStart);
        } catch (e) { return false; }
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
      .slice(0, 5)
      .map(event => {
        let title = event.type;
        if (event.type.toLowerCase().includes('match')) {
          if (event.matchType === 'opponent-vs-opponent') {
            title = event.opponent;
          } else {
            const h = event.homeOrAway === 'home' ? clubInfo.name : event.opponent;
            const a = event.homeOrAway === 'home' ? event.opponent : clubInfo.name;
            title = `${h} vs ${a}`;
          }
        }
        return { 
          ...event, 
          title, 
          displayDate: `${format(parseISO(event.date), 'dd/MM/yyyy')} à ${event.time || '10:00'}` 
        };
      });
  }, [calendarEvents, clubInfo.name]);

  const stats = useMemo(() => {
    const counts = players.reduce((acc, p) => { 
      const cat = p.category || 'Non classé';
      acc[cat] = (acc[cat] || 0) + 1; 
      return acc; 
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value, 
      fill: categoryColors[name] || 'hsl(var(--primary))' 
    }));
  }, [players]);

  if (loading) return <div className="p-8 space-y-8"><Skeleton className="h-10 w-64" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div></div>;

  const isAdmin = profile?.role === 'admin';
  const isCoach = profile?.role === 'coach';
  const isMedical = profile?.role === 'medical';
  const isParent = profile?.role === 'parent';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Bonjour, {profile?.displayName}</h2>
        <p className="text-muted-foreground">Bienvenue sur la plateforme de {clubInfo.name}.</p>
      </div>

      {/* Vue Admin & Coach */}
      {(isAdmin || isCoach) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Joueurs</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{players.length}</div></CardContent></Card>
          {isAdmin && <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Entraîneurs</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{coaches.length}</div></CardContent></Card>}
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Blessés</CardTitle><Stethoscope className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold">{players.filter(p => p.status === 'Blessé').length}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Événements</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{upcomingEvents.length}</div></CardContent></Card>
        </div>
      )}

      {/* Vue Médicale Spécifique */}
      {isMedical && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-destructive/20">
            <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertCircle /> Joueurs à traiter</CardTitle><CardDescription>Liste des joueurs actuellement indisponibles.</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {players.filter(p => p.status === 'Blessé').map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div><p className="font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{p.category} - {p.poste}</p></div>
                    <Badge variant="destructive">Soins requis</Badge>
                  </div>
                ))}
                {players.filter(p => p.status === 'Blessé').length === 0 && <p className="text-center py-4 text-muted-foreground">Aucun joueur blessé.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Prochains rendez-vous</CardTitle></CardHeader>
            <CardContent><p className="text-center py-10 text-muted-foreground">Aucun soin programmé aujourd'hui.</p></CardContent>
          </Card>
        </div>
      )}

      {/* Vue Parent / Joueur */}
      {isParent && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Mon Dossier Administratif</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-xl">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1"><p className="font-bold">Inscription Saison 2024-2025</p><p className="text-sm text-muted-foreground">Statut: En attente de validation</p></div>
                <Button asChild size="sm"><Link href="/registration-form">Voir</Link></Button>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-xl">
                <Banknote className="h-8 w-8 text-green-600" />
                <div className="flex-1"><p className="font-bold">Dernière Cotisation</p><p className="text-sm text-muted-foreground">Mois en cours</p></div>
                <Badge>À jour</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Mes Prochains Matchs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="p-3 border rounded-lg bg-muted/20">
                    <p className="font-bold">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.displayDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques et Événements (Admin/Coach) */}
      {(isAdmin || isCoach) && (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Effectif par Catégorie</CardTitle></CardHeader><CardContent className="h-[350px]"><ResponsiveContainer><PieChart><Pie data={stats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}><Cell fill="hsl(var(--primary))" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
          <Card><CardHeader><CardTitle>Agenda du Club</CardTitle></CardHeader><CardContent><div className="space-y-4">{upcomingEvents.map((e) => (<div key={e.id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"><div className="flex-1"><p className="font-bold text-lg">{e.title}</p><p className="text-sm text-muted-foreground">{e.displayDate} - {e.location}</p><Badge variant="outline" className="mt-2">{e.teamCategory}</Badge></div></div>))}{upcomingEvents.length === 0 && <div className="text-center py-20 text-muted-foreground">Aucun événement prévu.</div>}</div></CardContent></Card>
        </div>
      )}
    </div>
  );
}
