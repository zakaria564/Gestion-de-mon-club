
"use client";

import { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar } from "lucide-react";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useCalendarContext, CalendarEvent } from "@/context/calendar-context";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";

type FormattedEvent = CalendarEvent & { formattedDate: string };

export default function Dashboard() {
  const playersContext = usePlayersContext();
  const coachesContext = useCoachesContext();
  const calendarContext = useCalendarContext();

  const [formattedUpcomingEvents, setFormattedUpcomingEvents] = useState<FormattedEvent[]>([]);

  if (!playersContext || !coachesContext || !calendarContext) {
    throw new Error("Dashboard must be used within all required providers");
  }

  const { players, loading: playersLoading } = playersContext;
  const { coaches, loading: coachesLoading } = coachesContext;
  const { calendarEvents, loading: calendarLoading } = calendarContext;
  
  const loading = playersLoading || coachesLoading || calendarLoading;

  useEffect(() => {
    const upcoming = calendarEvents
      .filter(event => new Date(event.date) >= new Date())
      .slice(0, 5)
      .map(event => ({
        ...event,
        formattedDate: `${format(new Date(event.date), 'dd/MM/yyyy')} à ${event.time} - ${event.location}`
      }));
    setFormattedUpcomingEvents(upcoming);
  }, [calendarEvents]);


  if (loading) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Événements à Venir</CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Joueurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground">
              membres actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Entraîneurs
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coaches.length}</div>
            <p className="text-xs text-muted-foreground">
              membres du staff
            </p>
          </CardContent>
        </Card>
        <Link href="/calendar">
            <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Prochains Événements
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedUpcomingEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                dans les prochains jours
                </p>
            </CardContent>
            </Card>
        </Link>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Événements à Venir</CardTitle>
            <CardDescription>
              Les prochains matchs et entraînements.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {formattedUpcomingEvents.map((event) => (
                <Link href="/calendar" key={event.id} className="block hover:bg-muted/50 p-2 rounded-md transition-colors">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 mr-4 text-primary" />
                    <div className="flex-1 text-center">
                      <p className="text-sm font-medium leading-none">
                        {event.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                         {event.opponent && `vs ${event.opponent} - `}{event.formattedDate}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
               {formattedUpcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">Aucun événement à venir.</p>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
