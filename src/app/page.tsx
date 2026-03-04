
"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, Calendar } from "lucide-react";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useCalendarContext } from "@/context/calendar-context";
import { useClubContext } from "@/context/club-context";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isAfter, isSameDay } from "date-fns";
import Link from "next/link";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))',
  'U23': 'hsl(var(--chart-2))',
  'U19': 'hsl(var(--chart-3))',
  'U18': 'hsl(var(--chart-4))',
  'U17': 'hsl(var(--chart-5))',
  'U16': 'hsl(var(--chart-6))',
  'U15': 'hsl(var(--chart-7))',
  'U13': 'hsl(var(--chart-8))',
  'U9': 'hsl(25 60% 45%)',
  'U11': 'hsl(var(--chart-10))',
  'U7': 'hsl(var(--chart-11))',
  'U20': 'hsl(340, 80%, 55%)',
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
        const eventDate = parseISO(event.date);
        if (isSameDay(eventDate, now)) {
            if (!event.time) return true;
            const [hours, minutes] = event.time.split(':').map(Number);
            const eventDateTime = new Date(eventDate);
            eventDateTime.setHours(hours, minutes, 0, 0);
            return isAfter(eventDateTime, now) || eventDateTime.getTime() === now.getTime();
        }
        return isAfter(eventDate, now);
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || "").localeCompare(b.time || "");
      })
      .slice(0, 5)
      .map(event => {
        const isMatch = event.type.toLowerCase().includes('match');
        let matchTitle = "";
        if (isMatch) {
          if (event.matchType === 'opponent-vs-opponent') {
            matchTitle = event.opponent;
          } else {
            const clubName = clubInfo.name;
            const opponentName = event.opponent;
            const homeTeam = event.homeOrAway === 'home' ? clubName : opponentName;
            const awayTeam = event.homeOrAway === 'home' ? opponentName : clubName;
            matchTitle = `${homeTeam} vs ${awayTeam}`;
          }
        }

        return {
          ...event,
          matchTitle,
          formattedDate: `${format(parseISO(event.date), 'dd/MM/yyyy')} à ${event.time} - ${event.location}`
        };
      });
  }, [calendarEvents, clubInfo.name]);

  const playersByCategory = useMemo(() => {
    const counts = players.reduce((acc, player) => {
      const category = player.category || 'Sénior';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    return Object.keys(counts).map(category => ({
        name: category,
        value: counts[category],
        fill: categoryColors[category] || 'hsl(var(--chart-1))',
    }));
  }, [players]);

  if (loading) {
    return <div className="p-8"><Skeleton className="h-10 w-48 mb-8" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div></div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Joueurs</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{players.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Entraîneurs</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{coaches.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Événements</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{upcomingEvents.length}</div></CardContent></Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Répartition par Catégorie</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={playersByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}><Cell fill="hsl(var(--primary))" /></Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Événements à Venir</CardTitle></CardHeader>
          <CardContent>
             <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-2 border rounded-md">
                    <div className="flex-1">
                        <p className="font-semibold">{event.type} {event.matchTitle && `: ${event.matchTitle}`}</p>
                        <p className="text-sm text-muted-foreground">{event.formattedDate}</p>
                    </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-center text-muted-foreground">Aucun événement prévu.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
