
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

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic to add event would go here
    console.log("Nouvel événement ajouté");
    setOpen(false);
  };

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
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="entrainement">Entraînement</SelectItem>
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
