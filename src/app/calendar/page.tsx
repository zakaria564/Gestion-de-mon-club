
"use client";

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarContext } from '@/context/calendar-context';
import { useOpponentsContext } from '@/context/opponents-context';
import { useClubContext } from '@/context/club-context';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, MapPin, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

export default function CalendarPage() {
  const { calendarEvents, addEvent, loading } = useCalendarContext();
  const { opponents } = useOpponentsContext();
  const { clubInfo } = useClubContext();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState<any>({
    type: 'Match Championnat', opponent: '', homeTeam: '', awayTeam: '', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', location: '', teamCategory: 'Sénior', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match',
  });

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const dayEvents = useMemo(() => {
    return (calendarEvents || []).filter(e => e.date === selectedDateStr).sort((a,b) => a.time.localeCompare(b.time));
  }, [calendarEvents, selectedDateStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let final = { ...newEvent };
      if (final.matchType === 'opponent-vs-opponent') final.opponent = `${final.homeTeam} vs ${final.awayTeam}`;
      await addEvent(final);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = (e: any) => {
    if (!e.type.toLowerCase().includes('match')) return e.type;
    if (e.matchType === 'opponent-vs-opponent') return e.opponent;
    return e.homeOrAway === 'home' ? `${clubInfo.name} vs ${e.opponent}` : `${e.opponent} vs ${clubInfo.name}`;
  };

  if (loading && calendarEvents.length === 0) return <div className="p-8">Chargement...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendrier</h2>
        <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} className="w-full" locale={fr} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Événements du {date ? format(date, 'dd MMMM', {locale: fr}) : ''}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dayEvents.map(e => (
                  <div key={e.id} className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex justify-between mb-2">
                      <Badge>{e.type}</Badge>
                      <Badge variant="outline">{e.teamCategory}</Badge>
                    </div>
                    <p className="font-black text-lg">{getTitle(e)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <CalendarIcon className="size-3" /> {e.time} - <MapPin className="size-3" /> {e.location}
                    </p>
                  </div>
                ))}
                {dayEvents.length === 0 && <p className="text-center py-10 text-muted-foreground">Aucun événement ce jour.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Nouvel Événement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={newEvent.type} onValueChange={v => setNewEvent({...newEvent, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Match Championnat">Championnat</SelectItem>
                      <SelectItem value="Match Amical">Amical</SelectItem>
                      <SelectItem value="Entraînement">Entraînement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newEvent.type.includes('Match') && (
                  <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
                    <RadioGroup value={newEvent.matchType} onValueChange={v => setNewEvent({...newEvent, matchType: v})} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="club-match" id="c1" /><Label htmlFor="c1">Mon Club</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="opponent-vs-opponent" id="c2" /><Label htmlFor="c2">Adversaires</Label></div>
                    </RadioGroup>
                    {newEvent.matchType === 'club-match' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Lieu</Label>
                          <Select value={newEvent.homeOrAway} onValueChange={v => setNewEvent({...newEvent, homeOrAway: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="home">Domicile</SelectItem><SelectItem value="away">Extérieur</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Adversaire</Label>
                          <Select value={newEvent.opponent} onValueChange={v => setNewEvent({...newEvent, opponent: v})}>
                            <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                            <SelectContent>{opponents.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Équipe Domicile</Label><Input value={newEvent.homeTeam} onChange={e => setNewEvent({...newEvent, homeTeam: e.target.value})} /></div>
                        <div className="grid gap-2"><Label>Équipe Extérieur</Label><Input value={newEvent.awayTeam} onChange={e => setNewEvent({...newEvent, awayTeam: e.target.value})} /></div>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Date</Label><Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Heure</Label><Input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} /></div>
                </div>
                <div className="grid gap-2"><Label>Lieu exact</Label><Input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Stade..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Catégorie</Label>
                    <Select value={newEvent.teamCategory} onValueChange={v => setNewEvent({...newEvent, teamCategory: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Genre</Label>
                    <Select value={newEvent.gender} onValueChange={v => setNewEvent({...newEvent, gender: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-background shrink-0 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
