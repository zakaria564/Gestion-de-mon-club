"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, Calendar, Trophy } from "lucide-react";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useCalendarContext } from "@/context/calendar-context";
import { useClubContext } from "@/context/club-context";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isAfter } from "date-fns";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))', 'U23': 'hsl(var(--chart-2))', 'U19': 'hsl(var(--chart-3))', 'U18': 'hsl(var(--chart-4))', 'U17': 'hsl(var(--chart-5))', 'U16': 'hsl(var(--chart-6))', 'U15': 'hsl(var(--chart-7))', 'U13': 'hsl(var(--chart-8))', 'U9': 'hsl(25 60% 45%)', 'U11': 'hsl(var(--chart-10))', 'U7': 'hsl(var(--chart-11))', 'U20': 'hsl(340, 80%, 55%)',
};

export default function Dashboard() {
  const { players, loading: playersLoading } = usePlayersContext();
  const { coaches, loading: coachesLoading } = useCoachesContext();
  const { calendarEvents, loading: calendarLoading } = useCalendarContext();
  const { clubInfo } = useClubContext();
  
  const loading = playersLoading || coachesLoading || calendarLoading;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return calendarEvents
      .filter(event => {
        const eventDateTime = parseISO(`${event.date}T${event.time || '00:00'}`);
        const limitTime = new Date(now.getTime() - 120 * 60 * 1000); // 2h après début
        return isAfter(eventDateTime, limitTime);
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
      .slice(0, 5)
      .map(event => {
        let matchTitle = event.type;
        if (event.type.toLowerCase().includes('match')) {
          if (event.matchType === 'opponent-vs-opponent') {
            matchTitle = event.opponent;
          } else {
            const home = event.homeOrAway === 'home' ? clubInfo.name : event.opponent;
            const away = event.homeOrAway === 'home' ? event.opponent : clubInfo.name;
            matchTitle = `${home} vs ${away}`;
          }
        }
        return { ...event, matchTitle, formattedDate: `${format(parseISO(event.date), 'dd/MM/yyyy')} à ${event.time} - ${event.location}` };
      });
  }, [calendarEvents, clubInfo.name]);

  const playersByCategory = useMemo(() => {
    const counts = players.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: categoryColors[name] || 'hsl(var(--primary))' }));
  }, [players]);

  if (loading) return <div className="p-8"><Skeleton className="h-10 w-48 mb-8" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div></div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Tableau de bord - {clubInfo.name}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Joueurs</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{players.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Entraîneurs</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{coaches.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Événements</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{upcomingEvents.length}</div></CardContent></Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Effectif par Catégorie</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={playersByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}><Cell fill="hsl(var(--primary))" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle>Prochains Événements</CardTitle></CardHeader><CardContent><div className="space-y-4">{upcomingEvents.map((e) => (<div key={e.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"><div className="flex-1"><p className="font-bold">{e.matchTitle}</p><p className="text-sm text-muted-foreground">{e.formattedDate}</p><Badge variant="outline" className="mt-1">{e.teamCategory}</Badge></div></div>))}{upcomingEvents.length === 0 && <p className="text-center text-muted-foreground py-10">Aucun événement prévu.</p>}</div></CardContent></Card>
      </div>
    </div>
  );
}
