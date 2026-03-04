"use client";

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fr } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { CalendarEvent, useCalendarContext } from '@/context/calendar-context';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useClubContext } from '@/context/club-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOpponentsContext } from '@/context/opponents-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const playerCategories: string[] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))',
  'U23': 'hsl(var(--chart-2))',
  'U20': 'hsl(340, 80%, 55%)',
  'U19': 'hsl(var(--chart-3))',
  'U18': 'hsl(var(--chart-4))',
  'U17': 'hsl(var(--chart-5))',
  'U16': 'hsl(var(--chart-6))',
  'U15': 'hsl(var(--chart-7))',
  'U13': 'hsl(var(--chart-8))',
  'U9': 'hsl(25 60% 45%)',
  'U11': 'hsl(var(--chart-10))',
  'U7': 'hsl(var(--chart-11))',
};

export default function CalendarPage() {
  const calendarContext = useCalendarContext();
  const playersContext = usePlayersContext();
  const opponentsContext = useOpponentsContext();
  const { clubInfo } = useClubContext();

  if (!calendarContext || !playersContext || !opponentsContext) {
    return null;
  }

  const { calendarEvents, loading: calendarLoading, addEvent, updateEvent, deleteEvent } = calendarContext;
  const { opponents, loading: opponentsLoading } = opponentsContext;

  const loading = calendarLoading || opponentsLoading;

  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<any>({
    type: '',
    opponent: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    location: '',
    teamCategory: '',
    gender: 'Masculin',
    homeOrAway: 'home',
    matchType: 'club-match',
  });

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEvent((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleEventSelectChange = (field: string, value: string) => {
    setNewEvent((prev: any) => ({ ...prev, [field]: value as any }));
  };

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    let finalEvent = { ...newEvent };
    if (finalEvent.matchType === 'opponent-vs-opponent') {
        finalEvent.opponent = `${finalEvent.homeTeam} vs ${finalEvent.awayTeam}`;
    }

    if (isEditing && editingEvent) {
       await updateEvent({ id: editingEvent.id, ...finalEvent });
    } else {
      await addEvent(finalEvent);
    }
    
    resetEventForm();
  };

  const resetEventForm = () => {
    setNewEvent({ type: '', opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    setEventDialogOpen(false);
    setIsEditing(false);
    setEditingEvent(null);
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };
  
  const openAddEventDialog = (selectedDate: Date) => {
    setIsEditing(false);
    setEditingEvent(null);
    setNewEvent({ 
        type: '', 
        opponent: '',
        homeTeam: '',
        awayTeam: '',
        date: format(selectedDate, 'yyyy-MM-dd'), 
        time: '', 
        location: '',
        teamCategory: '',
        gender: 'Masculin',
        homeOrAway: 'home',
        matchType: 'club-match',
    });
    setEventDialogOpen(true);
  }
  
  const openEditEventDialog = (event: CalendarEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDetailsOpen(false);
    setIsEditing(true);
    setEditingEvent(event);
    setNewEvent({
      type: event.type,
      opponent: event.opponent,
      homeTeam: event.homeTeam || '',
      awayTeam: event.awayTeam || '',
      date: format(parseISO(event.date), 'yyyy-MM-dd'),
      time: event.time,
      location: event.location,
      teamCategory: event.teamCategory || '',
      gender: event.gender || 'Masculin',
      homeOrAway: event.homeOrAway || 'home',
      matchType: event.matchType || 'club-match',
    });
    setEventDialogOpen(true);
  }

  const handleDeleteEvent = async (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteEvent(eventId);
    setDetailsOpen(false);
    setSelectedEvent(null);
  }

  const filteredOpponentOptions = useMemo(() => {
    return opponents.filter(op => op.gender === newEvent.gender);
  }, [opponents, newEvent.gender]);

  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const eventDate = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[eventDate]) acc[eventDate] = [];
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, typeof calendarEvents>);

  const selectedDateString = date ? format(date, 'yyyy-MM-dd') : undefined;
  const eventsForSelectedDate = selectedDateString 
    ? (eventsByDate[selectedDateString] || []).sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const getEventBadgeStyle = (eventType: string): React.CSSProperties => {
    const lowerType = eventType.toLowerCase();
    if (lowerType.includes('match')) return { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' };
    if (lowerType.includes('entraînement')) return { backgroundColor: 'hsl(var(--chart-2))', color: 'hsl(var(--primary-foreground))' };
    if (lowerType.includes('réunion')) return { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' };
    return { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' };
  };

  const getMatchTitle = (event: CalendarEvent) => {
    const isMatch = event.type.toLowerCase().includes('match');
    if (!isMatch || !event.opponent) return event.type;
    if (event.matchType === 'opponent-vs-opponent') return event.opponent;
    const clubName = clubInfo.name;
    const homeTeam = event.homeOrAway === 'home' ? clubName : event.opponent;
    const awayTeam = event.homeOrAway === 'home' ? event.opponent : clubName;
    return `${homeTeam} vs ${awayTeam}`;
  }

  if (loading || !date) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2"><Skeleton className="w-full h-[600px]" /></div>
          <div className="md:col-span-1"><Skeleton className="h-[400px] w-full" /></div>
        </div>
      </div>
    )
  }

  const isNewEventMatch = newEvent.type.toLowerCase().includes('match');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendrier</h2>
        <Button onClick={() => openAddEventDialog(date)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un événement</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card><CardContent className="p-0"><Calendar mode="single" selected={date} onSelect={setDate} className="w-full" locale={fr} /></CardContent></Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader><CardTitle>Événements du {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</CardTitle></CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div key={event.id} className="p-4 rounded-md border cursor-pointer hover:bg-muted/50 relative group" onClick={() => handleEventClick(event)}>
                        <div className="mb-2 flex flex-wrap gap-2">
                            <Badge style={getEventBadgeStyle(event.type)}>{event.type}</Badge>
                            <Badge style={{backgroundColor: categoryColors[event.teamCategory], color: 'white'}}>{event.gender === 'Féminin' ? `${event.teamCategory} F` : event.teamCategory}</Badge>
                        </div>
                        <p className="font-semibold">{getMatchTitle(event)}</p>
                        <p className="text-sm text-muted-foreground">{event.time} - {event.location}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">Aucun événement.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2"><DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un événement</DialogTitle></DialogHeader>
          <form onSubmit={handleEventSubmit} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="grid gap-4 py-2 pb-6">
                <div className="grid gap-2">
                  <Label>Type d'événement</Label>
                  <Select onValueChange={(v) => handleEventSelectChange('type', v)} value={newEvent.type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Match Amical">Match Amical</SelectItem>
                      <SelectItem value="Match Championnat">Match de Championnat</SelectItem>
                      <SelectItem value="Match Coupe">Match Coupe</SelectItem>
                      <SelectItem value="Match Tournoi">Match Tournoi</SelectItem>
                      <SelectItem value="Entraînement Physique">Entraînement Physique</SelectItem>
                      <SelectItem value="Entraînement Technique">Entraînement Technique</SelectItem>
                      <SelectItem value="Entraînement Tactique">Entraînement Tactique</SelectItem>
                      <SelectItem value="Réunion">Réunion</SelectItem>
                      <SelectItem value="Événement Spécial">Événement Spécial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isNewEventMatch && (
                  <div className="space-y-4 pt-2">
                    <RadioGroup value={newEvent.matchType} onValueChange={(v) => handleEventSelectChange('matchType', v)} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="club-match" id="cal-club" /><Label htmlFor="cal-club">Match Club</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="opponent-vs-opponent" id="cal-opp" /><Label htmlFor="cal-opp">Adversaires</Label></div>
                    </RadioGroup>
                    <Separator />
                    {newEvent.matchType === 'club-match' ? (
                      <>
                        <div className="grid gap-2">
                            <Label>Lieu</Label>
                            <RadioGroup value={newEvent.homeOrAway} onValueChange={(v: any) => handleEventSelectChange('homeOrAway', v)} className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="home" id="h" /><Label htmlFor="h">Domicile</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="away" id="a" /><Label htmlFor="a">Extérieur</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="grid gap-2">
                            <Label>Adversaire</Label>
                            <Select onValueChange={(v) => handleEventSelectChange('opponent', v)} value={newEvent.opponent}>
                                <SelectTrigger><SelectValue placeholder="Choisir un adversaire..." /></SelectTrigger>
                                <SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2"><Label>Équipe Dom.</Label><Select onValueChange={(v) => handleEventSelectChange('homeTeam', v)} value={newEvent.homeTeam}><SelectTrigger><SelectValue placeholder="Equipe Dom..." /></SelectTrigger><SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent></Select></div>
                          <div className="grid gap-2"><Label>Équipe Ext.</Label><Select onValueChange={(v) => handleEventSelectChange('awayTeam', v)} value={newEvent.awayTeam}><SelectTrigger><SelectValue placeholder="Equipe Ext..." /></SelectTrigger><SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent></Select></div>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2"><Label>Catégorie</Label><Select onValueChange={(v) => handleEventSelectChange('teamCategory', v)} value={newEvent.teamCategory}><SelectTrigger><SelectValue placeholder="Catégorie..." /></SelectTrigger><SelectContent>{playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</Select><FormMessage /></FormItem></div>
                    <div className="grid gap-2"><Label>Genre</Label><Select onValueChange={(v) => handleEventSelectChange('gender', v)} value={newEvent.gender}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Date</Label><Input id="date" type="date" value={newEvent.date} onChange={handleEventInputChange} /></div>
                  <div className="grid gap-2"><Label>Heure</Label><Input id="time" type="time" value={newEvent.time} onChange={handleEventInputChange} /></div>
                </div>
                <div className="grid gap-2"><Label>Lieu exact</Label><Input id="location" value={newEvent.location} onChange={handleEventInputChange} placeholder="ex: Stade Oulfa" /></div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 border-t gap-2 bg-background mt-auto">
              <Button type="button" variant="outline" onClick={resetEventForm}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedEvent?.type}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
              <p><strong>Affiche:</strong> {selectedEvent && getMatchTitle(selectedEvent)}</p>
              <p><strong>Date:</strong> {selectedEvent && format(parseISO(selectedEvent.date), 'dd/MM/yyyy')}</p>
              <p><strong>Heure:</strong> {selectedEvent?.time}</p>
              <p><strong>Lieu:</strong> {selectedEvent?.location}</p>
          </div>
          <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => openEditEventDialog(selectedEvent!)}>Modifier</Button>
              <Button variant="destructive" onClick={() => handleDeleteEvent(selectedEvent!.id)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}