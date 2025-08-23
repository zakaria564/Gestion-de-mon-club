
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
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fr } from 'date-fns/locale';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic to add event would go here
    console.log("Nouvel événement ajouté");
    setOpen(false);
  };

  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const eventDate = new Date(event.date).toDateString();
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, typeof calendarEvents>);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendrier</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddEvent}>
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel événement</DialogTitle>
                <DialogDescription>
                  Remplissez les détails ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type d'événement</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match-amical">Match Amical</SelectItem>
                      <SelectItem value="match-championnat">Match de Championnat</SelectItem>
                      <SelectItem value="match-coupe">Match de Coupe</SelectItem>
                      <SelectItem value="entrainement-physique">Entraînement Physique</SelectItem>
                      <SelectItem value="entrainement-technique">Entraînement Technique</SelectItem>
                      <SelectItem value="entrainement-tactique">Entraînement Tactique</SelectItem>
                      <SelectItem value="reunion">Réunion</SelectItem>
                      <SelectItem value="evenement-special">Événement Spécial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opponent">Adversaire (si match)</Label>
                  <Input id="opponent" placeholder="Nom de l'équipe adverse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Stade ou lieu" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full"
            locale={fr}
            components={{
              DayContent: ({ date, ...props }) => {
                const dayEvents = eventsByDate[date.toDateString()];
                return (
                  <div className="relative h-full w-full flex flex-col items-center justify-center">
                    <span>{date.getDate()}</span>
                    {dayEvents && (
                      <div className="absolute bottom-1 flex space-x-1">
                        {dayEvents.map(event => (
                          <div key={event.id} className={`h-1.5 w-1.5 rounded-full ${event.type === 'Match' ? 'bg-primary' : 'bg-secondary-foreground'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            }}
             classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4 w-full",
              table: "w-full border-collapse",
              head_row: "flex justify-around",
              head_cell: "w-full text-muted-foreground rounded-md font-normal text-[0.8rem]",
              row: "flex w-full mt-2 justify-around",
              cell: "h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-full w-full p-2 font-normal",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
              day_today: "bg-accent text-accent-foreground rounded-md",
              day_outside: "text-muted-foreground opacity-50",
            }}
          />
        </CardContent>
      </Card>

      {date && eventsByDate[date.toDateString()] && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Événements du {date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventsByDate[date.toDateString()].map((event) => (
                <div key={event.id} className="p-4 rounded-md border flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Badge variant={event.type === 'Match' ? 'default' : 'secondary'}>{event.type}</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{event.type === 'Match' ? `vs ${event.opponent}` : 'Session d\'entraînement'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
