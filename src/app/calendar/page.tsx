
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
import { calendarEvents as initialCalendarEvents } from "@/lib/data";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fr } from 'date-fns/locale';

type CalendarEvent = {
  id: number;
  type: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
};


export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  
  const [newEvent, setNewEvent] = useState({
    type: '',
    opponent: '',
    date: '',
    time: '',
    location: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEvent(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewEvent(prev => ({ ...prev, type: value }));
  };

  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const createdEvent: CalendarEvent = {
        id: calendarEvents.length + 1,
        opponent: newEvent.opponent,
        // The date from the form is 'YYYY-MM-DD'. We need to adjust for timezone to avoid off-by-one day errors.
        date: new Date(newEvent.date + 'T00:00:00').toISOString().split('T')[0],
        time: newEvent.time,
        type: newEvent.type,
        location: newEvent.location,
    };
    
    setCalendarEvents(prev => [...prev, createdEvent]);
    
    setNewEvent({ type: '', opponent: '', date: '', time: '', location: '' });
    setOpen(false);
  };

  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const eventDate = new Date(event.date + "T00:00:00").toDateString();
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
                  <Select name="type" onValueChange={handleSelectChange} value={newEvent.type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Match Amical">Match Amical</SelectItem>
                      <SelectItem value="Match Championnat">Match de Championnat</SelectItem>
                      <SelectItem value="Match Coupe">Match de Coupe</SelectItem>
                      <SelectItem value="Entraînement Physique">Entraînement Physique</SelectItem>
                      <SelectItem value="Entraînement Technique">Entraînement Technique</SelectItem>
                      <SelectItem value="Entraînement Tactique">Entraînement Tactique</SelectItem>
                      <SelectItem value="Réunion">Réunion</SelectItem>
                      <SelectItem value="Événement Spécial">Événement Spécial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opponent">Adversaire (si match)</Label>
                  <Input id="opponent" placeholder="Nom de l'équipe adverse" value={newEvent.opponent} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={newEvent.date} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input id="time" type="time" value={newEvent.time} onChange={handleInputChange}/>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Stade ou lieu" value={newEvent.location} onChange={handleInputChange}/>
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
                          <div key={event.id} className={`h-1.5 w-1.5 rounded-full ${event.type.toLowerCase().includes('match') ? 'bg-primary' : 'bg-secondary-foreground'}`} />
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
                    <Badge variant={event.type.toLowerCase().includes('match') ? 'default' : 'secondary'}>{event.type}</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{event.type.toLowerCase().includes('match') ? `vs ${event.opponent}` : event.type}</p>
                    <p className="text-sm text-muted-foreground">{new Date(event.date + "T00:00:00").toLocaleDateString('fr-FR')} à {event.time}</p>
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
