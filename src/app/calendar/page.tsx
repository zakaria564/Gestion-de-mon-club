
"use client";

import { useState, useContext, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fr } from 'date-fns/locale';
import { format, parse, parseISO, isPast } from 'date-fns';
import { CalendarEvent, NewCalendarEvent, useCalendarContext } from '@/context/calendar-context';
import { useResultsContext, NewResult, PerformanceDetail } from '@/context/results-context';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { Player } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClubContext } from '@/context/club-context';


const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

export default function CalendarPage() {
  const calendarContext = useCalendarContext();
  const resultsContext = useResultsContext();
  const playersContext = usePlayersContext();
  const { clubInfo } = useClubContext();
  const { toast } = useToast();

  if (!calendarContext || !resultsContext || !playersContext) {
    throw new Error("CalendarPage must be used within all required providers");
  }

  const { calendarEvents, loading: calendarLoading, addEvent, updateEvent, deleteEvent } = calendarContext;
  const { addResult, loading: resultsLoading } = resultsContext;
  const { players, loading: playersLoading } = playersContext;

  const loading = calendarLoading || resultsLoading || playersLoading;

  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // State for Add/Edit Event Dialog
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<NewCalendarEvent>({
    type: '',
    opponent: '',
    date: '',
    time: '',
    location: '',
    teamCategory: 'Sénior',
  });

  // State for Add Result Dialog
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [newResult, setNewResult] = useState<NewResult>({
      opponent: '',
      date: '',
      time: '',
      location: '',
      score: '',
      scorers: [],
      assists: [],
      category: 'Match Championnat',
      teamCategory: 'Sénior',
  });

  // State for Event Details Dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEvent(prev => ({ ...prev, [id]: value }));
  };

  const handleEventSelectChange = (field: 'type' | 'teamCategory', value: string) => {
    setNewEvent(prev => ({ ...prev, [field]: value as any }));
  };

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isEditing && editingEvent) {
       await updateEvent({
        id: editingEvent.id,
        ...newEvent,
       });
    } else {
      await addEvent(newEvent);
    }
    
    resetEventForm();
  };

  const resetEventForm = () => {
    setNewEvent({ type: '', opponent: '', date: '', time: '', location: '', teamCategory: 'Sénior' });
    setEventDialogOpen(false);
    setIsEditing(false);
    setEditingEvent(null);
  }

  const handleEventClick = (event: CalendarEvent) => {
    const isMatch = event.type.toLowerCase().includes('match');
    const hasPassed = isPast(parseISO(event.date));

    if (isMatch && hasPassed) {
        openAddResultDialog(event);
    } else {
        setSelectedEvent(event);
        setDetailsOpen(true);
    }
  };
  
  const openAddEventDialog = (selectedDate: Date) => {
    setIsEditing(false);
    setEditingEvent(null);
    setNewEvent({ 
        type: '', 
        opponent: '', 
        date: format(selectedDate, 'yyyy-MM-dd'), 
        time: '', 
        location: '',
        teamCategory: 'Sénior'
    });
    setEventDialogOpen(true);
  }
  
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    setDate(day);
  };

  const openEditEventDialog = (event: CalendarEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDetailsOpen(false);
    setIsEditing(true);
    setEditingEvent(event);
    setNewEvent({
      type: event.type,
      opponent: event.opponent,
      date: format(parseISO(event.date), 'yyyy-MM-dd'),
      time: event.time,
      location: event.location,
      teamCategory: event.teamCategory || 'Sénior',
    });
    setEventDialogOpen(true);
  }

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setDetailsOpen(false);
    setSelectedEvent(null);
    setDeleteConfirmationOpen(false);
  }

  const openAddResultDialog = (event: CalendarEvent) => {
     setDetailsOpen(false);
     setNewResult({
        opponent: event.opponent,
        date: event.date,
        time: event.time,
        location: event.location,
        teamCategory: event.teamCategory,
        category: event.type, // 'Match Amical', etc.
        score: '',
        scorers: [],
        assists: [],
      });
      setResultDialogOpen(true);
  };

  const handleResultInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };

  const handleDynamicListChange = (
    listName: 'scorers' | 'assists',
    index: number,
    field: 'playerName' | 'count',
    value: string | number
  ) => {
    const list = [...newResult[listName]];
    const currentItem = { ...list[index] };
    
    if (field === 'count') {
        currentItem.count = Number(value) < 1 ? 1 : Number(value);
    } else {
        currentItem.playerName = value as string;
    }

    list[index] = currentItem;
    setNewResult(prev => ({ ...prev, [listName]: list }));
  };

  const addDynamicListItem = (listName: 'scorers' | 'assists') => {
    const list = [...newResult[listName], { playerName: '', count: 1 }];
    setNewResult(prev => ({ ...prev, [listName]: list }));
  };

  const removeDynamicListItem = (listName: 'scorers' | 'assists', index: number) => {
    const list = newResult[listName].filter((_, i) => i !== index);
    setNewResult(prev => ({ ...prev, [listName]: list }));
  };

  const resetResultForm = () => {
    setNewResult({ opponent: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: 'Match Championnat', teamCategory: 'Sénior' });
    setResultDialogOpen(false);
  };

  const handleResultSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalResult = {
        ...newResult,
        scorers: newResult.scorers.filter(s => s.playerName),
        assists: newResult.assists.filter(a => a.playerName)
    };
    await addResult(finalResult);
    toast({ title: "Résultat ajouté", description: "Le résultat du match a été enregistré." });
    resetResultForm();
  };

  const filteredPlayerOptions = useMemo(() => {
    return players
      .filter(p => p.category === newResult.teamCategory)
      .map(p => ({ value: p.name, label: p.name }));
  }, [players, newResult.teamCategory]);

  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const eventDate = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, typeof calendarEvents>);

  const selectedDateString = date ? format(date, 'yyyy-MM-dd') : undefined;
  const eventsForSelectedDate = selectedDateString 
    ? (eventsByDate[selectedDateString] || []).sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0];
        }
        return timeA[1] - timeB[1];
      })
    : undefined;

  const getEventColor = (eventType: string) => {
    const lowerType = eventType.toLowerCase();
    if (lowerType.includes('match')) return 'bg-primary'; // Blue
    if (lowerType.includes('entraînement')) return 'bg-green-500'; // Green
    if (lowerType.includes('réunion')) return 'bg-orange-500'; // Orange
    if (lowerType.includes('événement spécial')) return 'bg-purple-500'; // Purple
    return 'bg-secondary-foreground'; // Default
  }

  const getEventBadgeStyle = (eventType: string): React.CSSProperties => {
    const lowerType = eventType.toLowerCase();
    if (lowerType.includes('match')) return { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' };
    if (lowerType.includes('entraînement')) return { backgroundColor: 'hsl(var(--chart-2))', color: 'hsl(var(--primary-foreground))' };
    if (lowerType.includes('réunion')) return { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' };
    if (lowerType.includes('événement spécial')) return { backgroundColor: '#A855F7', color: 'white' }; // Purple
    return { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' };
  };

  if (loading || !date) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Skeleton className="w-full h-[700px]" />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
             <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendrier</h2>
        <Dialog open={eventDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetEventForm(); else setEventDialogOpen(true);}}>
          <DialogTrigger asChild>
            <Button onClick={() => openAddEventDialog(date)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleEventSubmit}>
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un événement</DialogTitle>
                <DialogDescription>
                  Remplissez les détails ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type d'événement</Label>
                  <Select name="type" onValueChange={(v) => handleEventSelectChange('type', v)} value={newEvent.type} required>
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
                    <Label htmlFor="teamCategory">Catégorie de l'équipe</Label>
                    <Select onValueChange={(v) => handleEventSelectChange('teamCategory', v)} value={newEvent.teamCategory} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            {playerCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opponent">Adversaire (si match)</Label>
                  <Input id="opponent" placeholder="Nom de l'équipe adverse" value={newEvent.opponent} onChange={handleEventInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={newEvent.date} onChange={handleEventInputChange} required/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input id="time" type="time" value={newEvent.time} onChange={handleEventInputChange} required/>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Stade ou lieu" value={newEvent.location} onChange={handleEventInputChange} required/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDayClick}
                className="w-full"
                locale={fr}
                components={{
                  DayContent: ({ date: dayDate }) => {
                    const dayEvents = eventsByDate[format(dayDate, 'yyyy-MM-dd')];
                    return (
                      <div 
                        className="relative h-full w-full flex flex-col items-center justify-center group"
                        onClick={() => handleDayClick(dayDate)}
                      >
                        <PlusCircle 
                          className="absolute top-1 right-1 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddEventDialog(dayDate);
                          }}
                        />
                        <span>{dayDate.getDate()}</span>
                        {dayEvents && (
                          <div className="absolute bottom-1 flex space-x-1">
                            {dayEvents.map(event => (
                              <div key={event.id} className={`h-1.5 w-1.5 rounded-full ${getEventColor(event.type)}`} />
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
                  cell: "h-16 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 md:h-24",
                  day: "h-full w-full p-2 font-normal",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                  day_today: "bg-accent text-accent-foreground rounded-md",
                  day_outside: "text-muted-foreground opacity-50",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          {date && eventsForSelectedDate && eventsForSelectedDate.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Événements du {date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div key={event.id} onClick={() => handleEventClick(event)} className="p-4 rounded-md border flex items-center gap-2 cursor-pointer hover:bg-muted/50 relative group">
                        <div className="flex flex-col flex-1 text-center">
                            <div className='flex gap-2 items-center justify-center mb-2'>
                                <Badge style={getEventBadgeStyle(event.type)}>{event.type}</Badge>
                                {event.teamCategory && <Badge variant="secondary">{event.teamCategory}</Badge>}
                            </div>
                            <p className="font-semibold">{event.type.toLowerCase().includes('match') && event.opponent ? `USDS vs ${event.opponent}` : event.type}</p>
                            <p className="text-sm text-muted-foreground">{format(parseISO(event.date), 'dd/MM/yyyy')} à {event.time}</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
           {(!eventsForSelectedDate || eventsForSelectedDate.length === 0) && date && (
                <Card>
                <CardHeader>
                    <CardTitle>Événements du {date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aucun événement prévu pour cette date.</p>
                </CardContent>
                </Card>
            )}
        </div>
      </div>

       <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.type}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.type.toLowerCase().includes('match') && selectedEvent.opponent ? `vs ${selectedEvent.opponent}` : 'Détails de l\'événement'}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <>
              <div className="grid gap-4 py-4">
                  {selectedEvent.teamCategory && <p><strong>Catégorie:</strong> {selectedEvent.teamCategory}</p>}
                  <p><strong>Date:</strong> {format(parseISO(selectedEvent.date), 'dd/MM/yyyy')}</p>
                  <p><strong>Heure:</strong> {selectedEvent.time}</p>
                  <p><strong>Lieu:</strong> {selectedEvent.location}</p>
                  {selectedEvent.opponent && <p><strong>Adversaire:</strong> {selectedEvent.opponent}</p>}
              </div>
              <DialogFooter className="justify-end gap-2">
                 {isPast(parseISO(selectedEvent.date)) && selectedEvent.type.toLowerCase().includes("match") ? (
                    <Button variant="outline" onClick={() => openAddResultDialog(selectedEvent)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter le score final
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={(e) => openEditEventDialog(selectedEvent, e)}>
                          <Edit className="mr-2 h-4 w-4" /> Modifier
                      </Button>
                      <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Cette action ne peut pas être annulée. Cela supprimera définitivement cet événement.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(selectedEvent.id)}>Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Ajouter un résultat</DialogTitle>
                <DialogDescription>
                    Match du {newResult.date} contre {newResult.opponent}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResultSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="overflow-y-auto pr-6 -mr-6 flex-1">
                    <div className="grid gap-4 py-4 px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="score">Score final (ex: 3-1)</Label>
                            <Input id="score" value={newResult.score} onChange={handleResultInputChange} required />
                        </div>

                        <div className="space-y-4">
                            <Label>Buteurs</Label>
                            {newResult.scorers.map((scorer, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Select onValueChange={(value) => handleDynamicListChange('scorers', index, 'playerName', value)} value={scorer.playerName}>
                                        <SelectTrigger><SelectValue placeholder="Choisir un joueur..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredPlayerOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" min="1" value={scorer.count} onChange={(e) => handleDynamicListChange('scorers', index, 'count', e.target.value)} className="w-20" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('scorers', index)}><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('scorers')}>Ajouter un buteur</Button>
                        </div>

                        <div className="space-y-4">
                            <Label>Passeurs décisifs</Label>
                            {newResult.assists.map((assist, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Select onValueChange={(value) => handleDynamicListChange('assists', index, 'playerName', value)} value={assist.playerName}>
                                        <SelectTrigger><SelectValue placeholder="Choisir un joueur..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredPlayerOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" min="1" value={assist.count} onChange={(e) => handleDynamicListChange('assists', index, 'count', e.target.value)} className="w-20" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicListItem('assists', index)}><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('assists')}>Ajouter un passeur</Button>
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={() => resetResultForm()}>Annuler</Button>
                    <Button type="submit">Sauvegarder le Résultat</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

    </div>
  );
}

    

    
