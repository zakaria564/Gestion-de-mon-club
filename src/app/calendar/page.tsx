"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { calendarEvents } from "@/lib/data";
import { Badge } from '@/components/ui/badge';
import { List, ListItem } from 'lucide-react';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendrier</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-3">
            <Card>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-3"
                        classNames={{
                            month: "space-y-4 w-full",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex justify-around",
                            row: "flex w-full mt-2 justify-around",
                          }}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="col-span-4">
            <Card>
                <CardHeader>
                    <CardTitle>Événements à Venir</CardTitle>
                    <CardDescription>
                        Liste des prochains matchs et entraînements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {calendarEvents.map((event) => (
                            <div key={event.id} className="p-4 rounded-md border flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Badge variant={event.type === 'Match' ? 'default' : 'secondary'}>{event.type}</Badge>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{event.type === 'Match' ? `vs ${event.opponent}` : 'Session d\'entraînement'}</p>
                                    <p className="text-sm text-muted-foreground">{event.date} à {event.time}</p>
                                    <p className="text-sm text-muted-foreground">{event.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
