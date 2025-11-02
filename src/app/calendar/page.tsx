
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
import { Edit, PlusCircle, Trash2, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fr } from 'date-fns/locale';
import { format, parse, parseISO, isPast, addHours } from 'date-fns';
import { CalendarEvent, NewCalendarEvent, useCalendarContext } from '@/context/calendar-context';
import { useResultsContext, NewResult, Result, PerformanceDetail } from '@/context/results-context';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { Player } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClubContext } from '@/context/club-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOpponentsContext } from '@/context/opponents-context';


const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const matchCategories = ['Match Championnat', 'Match Coupe', 'Match Amical', 'Match Tournoi'];

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
  const resultsContext = useResultsContext();
  const playersContext = usePlayersContext();
  const opponentsContext = useOpponentsContext();
  const { clubInfo } = useClubContext();
  const { toast } = useToast();

  if (!calendarContext || !resultsContext || !playersContext || !opponentsContext) {
    throw new Error("CalendarPage must be used within all required providers");
  }

  const { calendarEvents, loading: calendarLoading, addEvent, updateEvent, deleteEvent } = calendarContext;
  const { results, addResult, loading: resultsLoading } = resultsContext;
  const { players, loading: playersLoading } = playersContext;
  const { opponents, loading: opponentsLoading } = opponentsContext;

  const loading = calendarLoading || resultsLoading || playersLoading || opponentsLoading;

  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // State for Add/Edit Event Dialog
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventMatchType, setEventMatchType] = useState<'club-match' | 'opponent-vs-opponent'>('club-match');
  const [newEvent, setNewEvent] = useState<NewCalendarEvent>({
    type: '',
    opponent: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    location: '',
    teamCategory: 'Sénior',
    gender: 'Masculin',
    homeOrAway: 'home',
    matchType: 'club-match',
  });

  // State for Add Result Dialog
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultMatchType, setResultMatchType] = useState<'club-match' | 'opponent-vs-opponent'>('club-match');
  const [newResult, setNewResult] = useState<NewResult>({
      opponent: '',
      homeTeam: '',
      awayTeam: '',
      date: '',
      time: '',
      location: '',
      score: '',
      scorers: [],
      assists: [],
      category: 'Match Championnat',
      teamCategory: 'Sénior',
      gender: 'Masculin',
      homeOrAway: 'home',
      matchType: 'club-match',
  });

  // State for Event Details Dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultDetailsOpen, setResultDetailsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  
  useEffect(() => {
    setNewResult(prev => ({ ...prev, matchType: resultMatchType }));
  }, [resultMatchType]);

  useEffect(() => {
    setNewEvent(prev => ({ ...prev, matchType: eventMatchType }));
  }, [eventMatchType]);
  
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEvent(prev => ({ ...prev, [id]: value }));
  };

  const handleEventSelectChange = (field: keyof NewCalendarEvent, value: string) => {
    setNewEvent(prev => ({ ...prev, [field]: value as any }));
  };

  const handleHomeAwayChange = (value: "home" | "away") => {
    setNewEvent(prev => ({ ...prev, homeOrAway: value }));
  };

  const handleEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const finalEvent = { ...newEvent };
    if (newEvent.matchType === 'opponent-vs-opponent') {
        finalEvent.opponent = `${finalEvent.homeTeam} vs ${finalEvent.awayTeam}`;
    }

    if (isEditing && editingEvent) {
       await updateEvent({
        id: editingEvent.id,
        ...finalEvent,
       });
    } else {
      await addEvent(finalEvent);
    }
    
    resetEventForm();
  };

  const resetEventForm = () => {
    setNewEvent({ type: '', opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', teamCategory: 'Sénior', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    setEventDialogOpen(false);
    setIsEditing(false);
    setEditingEvent(null);
    setEventMatchType('club-match');
  }

  const handleEventClick = (event: CalendarEvent) => {
    const isMatch = event.type.toLowerCase().includes('match');
    const hasPassed = isPast(parseISO(event.date));

    if (isMatch && hasPassed) {
        const existingResult = results.find(
            (r) => r.date === event.date && r.opponent === event.opponent && r.teamCategory === event.teamCategory
        );

        if (existingResult) {
            setSelectedResult(existingResult);
            setResultDetailsOpen(true);
        } else {
            // Keep details open to allow adding result, editing, or deleting
            setSelectedEvent(event);
            setDetailsOpen(true);
        }
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
        homeTeam: '',
        awayTeam: '',
        date: format(selectedDate, 'yyyy-MM-dd'), 
        time: '', 
        location: '',
        teamCategory: 'Sénior',
        gender: 'Masculin',
        homeOrAway: 'home',
        matchType: 'club-match',
    });
    setEventMatchType('club-match');
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
    const matchType = event.matchType || 'club-match';
    setEventMatchType(matchType);
    setNewEvent({
      type: event.type,
      opponent: event.opponent,
      homeTeam: event.homeTeam || '',
      awayTeam: event.awayTeam || '',
      date: format(parseISO(event.date), 'yyyy-MM-dd'),
      time: event.time,
      location: event.location,
      teamCategory: event.teamCategory || 'Sénior',
      gender: event.gender || 'Masculin',
      homeOrAway: event.homeOrAway || 'home',
      matchType,
    });
    setEventDialogOpen(true);
  }

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setDetailsOpen(false);
    setSelectedEvent(null);
    setDeleteConfirmationOpen(false);
  }

  const openAddResultDialog = () => {
     setDetailsOpen(false);
     setResultDialogOpen(true);
     // Reset form for a clean slate, not pre-filled from calendar event
     resetResultForm(true); 
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

  const resetResultForm = (keepOpen = false) => {
    setNewResult({ opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: 'Match Championnat', teamCategory: 'Sénior', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    if (!keepOpen) {
      setResultDialogOpen(false);
    }
    setResultMatchType('club-match');
  };
  
  const handleResultSelectChange = (field: 'category' | 'teamCategory' | 'opponent' | 'homeTeam' | 'awayTeam' | 'gender', value: string) => {
    setNewResult(prev => ({ ...prev, [field]: value as any }));
  };
  
  const handleResultRadioChange = (value: "home" | "away") => {
    setNewResult(prev => ({...prev, homeOrAway: value}));
  }

  const handleResultSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalResult = {
        ...newResult,
        scorers: newResult.scorers.filter(s => s.playerName),
        assists: newResult.assists.filter(a => a.playerName)
    };
    
    if (resultMatchType === 'opponent-vs-opponent') {
        finalResult.opponent = `${finalResult.homeTeam} vs ${finalResult.awayTeam}`;
        finalResult.scorers = [];
        finalResult.assists = [];
    }
    
    await addResult(finalResult);
    toast({ title: "Résultat ajouté", description: "Le résultat du match a été enregistré." });
    resetResultForm();
  };

  const formatPerformance = (items: PerformanceDetail[] | undefined): string => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "Aucun";
    }
    return items.map(item => `${item.playerName}${item.count > 1 ? ` (${item.count})` : ''}`).join(", ");
  };

  const filteredPlayerOptions = useMemo(() => {
    return players
      .filter(p => p.category === newResult.teamCategory && p.gender === newResult.gender)
      .map(p => ({ value: p.name, label: p.name }));
  }, [players, newResult.teamCategory, newResult.gender]);

  const filteredOpponentOptions = useMemo(() => {
    return opponents.filter(op => op.gender === newEvent.gender);
  }, [opponents, newEvent.gender]);
  
  const filteredOpponentOptionsForResult = useMemo(() => {
    return opponents.filter(op => op.gender === newResult.gender);
  }, [opponents, newResult.gender]);

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

  const getMatchTitle = (event: CalendarEvent) => {
    const isMatch = event.type.toLowerCase().includes('match');
    if (!isMatch) return event.type;

    if (event.matchType === 'opponent-vs-opponent') {
        const homeTeamName = event.homeTeam;
        const awayTeamName = event.awayTeam;
        return `${homeTeamName} vs ${awayTeamName}`;
    }
    
    if (!event.opponent) return event.type;

    const clubName = clubInfo.name;
    const opponentName = event.opponent;
    const homeTeam = event.homeOrAway === 'home' ? clubName : opponentName;
    const awayTeam = event.homeOrAway === 'home' ? opponentName : clubName;
    
    return `${homeTeam} vs ${awayTeam}`;
  }
  
  const getResultTitle = (result: Result) => {
     if (result.matchType === 'opponent-vs-opponent') {
        const homeTeamName = result.homeTeam;
        const awayTeamName = result.awayTeam;
        return `${homeTeamName} vs ${awayTeamName}`;
    }
    const clubName = clubInfo.name;
    const opponentName = result.opponent;
    const homeTeam = result.homeOrAway === 'home' ? clubName : opponentName;
    const awayTeam = result.homeOrAway === 'home' ? opponentName : clubName;
    return `${homeTeam} vs ${awayTeam}`;
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

  const isNewEventMatch = newEvent.type.toLowerCase().includes('match');

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
                      <SelectItem value="Match Tournoi">Match Tournoi</SelectItem>
                      <SelectItem value="Entraînement Physique">Entraînement Physique</SelectItem>
                      <SelectItem value="Entraînement Technique">Entraînement Technique</SelectItem>
                      <SelectItem value="Entraînement Tactique">Entraînement Tactique</SelectItem>
                      <SelectItem value="Réunion">Réunion</SelectItem>
                      <SelectItem value="Événement Spécial">Événement Spécial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="gender">Genre</Label>
                        <Select onValueChange={(v) => handleEventSelectChange('gender', v)} value={newEvent.gender} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Masculin">Masculin</SelectItem>
                                <SelectItem value="Féminin">Féminin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {isNewEventMatch && (
                  <>
                     <div className="grid gap-2">
                        <Label>Type de Match</Label>
                        <RadioGroup value={eventMatchType} onValueChange={(v) => setEventMatchType(v as any)} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="club-match" id="club-match-event" />
                                <Label htmlFor="club-match-event">Match de mon club</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="opponent-vs-opponent" id="opponent-match-event" />
                                <Label htmlFor="opponent-match-event">Adversaires</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {eventMatchType === 'club-match' ? (
                        <>
                            <div className="grid gap-2">
                                <Label>Domicile / Extérieur</Label>
                                <RadioGroup defaultValue="home" value={newEvent.homeOrAway} onValueChange={handleHomeAwayChange} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="home" id="home" />
                                        <Label htmlFor="home">Domicile</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="away" id="away" />
                                        <Label htmlFor="away">Extérieur</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="opponent">Adversaire</Label>
                                <Select onValueChange={(v) => handleEventSelectChange('opponent', v)} value={newEvent.opponent} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un adversaire" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredOpponentOptions.map(op => (
                                            <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="homeTeam">Équipe à Domicile</Label>
                                <Select onValueChange={(v) => handleEventSelectChange('homeTeam', v)} value={newEvent.homeTeam} required>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                    <SelectContent>
                                        {filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="awayTeam">Équipe à l'Extérieur</Label>
                                <Select onValueChange={(v) => handleEventSelectChange('awayTeam', v)} value={newEvent.awayTeam} required>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                    <SelectContent>
                                        {filteredOpponentOptions.filter(op => op.name !== newEvent.homeTeam).map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                  </>
                )}
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
                                {event.teamCategory && (
                                    <Badge 
                                        style={{backgroundColor: categoryColors[event.teamCategory], color: 'white'}} 
                                        className="border-transparent"
                                    >
                                        {event.gender === 'Féminin' ? `${event.teamCategory} F` : event.teamCategory}
                                    </Badge>
                                )}
                            </div>
                            <p className="font-semibold">{getMatchTitle(event)}</p>
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
              {selectedEvent?.type.toLowerCase().includes('match') ? getMatchTitle(selectedEvent!) : 'Détails de l\'événement'}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <>
              <div className="grid gap-4 py-4">
                  {selectedEvent.teamCategory && <p><strong>Catégorie:</strong> {selectedEvent.gender === 'Féminin' ? `${selectedEvent.teamCategory} F` : selectedEvent.teamCategory}</p>}
                  <p><strong>Date:</strong> {format(parseISO(selectedEvent.date), 'dd/MM/yyyy')}</p>
                  <p><strong>Heure:</strong> {selectedEvent.time}</p>
                  <p><strong>Lieu:</strong> {selectedEvent.location}</p>
                  {selectedEvent.type.toLowerCase().includes('match') && selectedEvent.matchType !== 'opponent-vs-opponent' && selectedEvent.opponent && <p><strong>Adversaire:</strong> {selectedEvent.opponent}</p>}
              </div>
              <DialogFooter className="flex-wrap justify-end gap-2">
                 {isPast(parseISO(selectedEvent.date)) && selectedEvent.type.toLowerCase().includes("match") && (
                    <Button variant="outline" onClick={() => openAddResultDialog()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter le score
                    </Button>
                  )}
                  
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resultDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetResultForm(); else setResultDialogOpen(true); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Ajouter un résultat</DialogTitle>
                <DialogDescription>
                    Remplissez les détails du match ci-dessous.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResultSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="overflow-y-auto pr-6 -mr-6 flex-1">
                    <div className="grid gap-4 py-4 px-1">
                         <div className="grid gap-2">
                            <Label>Type de saisie</Label>
                             <RadioGroup value={resultMatchType} onValueChange={(v) => setResultMatchType(v as any)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="club-match" id="club-match-res" />
                                    <Label htmlFor="club-match-res">Match de mon club</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="opponent-vs-opponent" id="opponent-match-res" />
                                    <Label htmlFor="opponent-match-res">Match entre adversaires</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Type de match</Label>
                                <Select onValueChange={(v) => handleResultSelectChange('category', v)} value={newResult.category} required>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {matchCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teamCategory">Catégorie de l'équipe</Label>
                                <Select onValueChange={(v) => handleResultSelectChange('teamCategory', v)} value={newResult.teamCategory} required>
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
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gender">Genre</Label>
                            <Select onValueChange={(v) => handleResultSelectChange('gender', v)} value={newResult.gender} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un genre" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Masculin">Masculin</SelectItem>
                                    <SelectItem value="Féminin">Féminin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {resultMatchType === 'club-match' && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Domicile / Extérieur</Label>
                                    <RadioGroup defaultValue="home" value={newResult.homeOrAway} onValueChange={handleResultRadioChange} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="home" id="home-res" />
                                            <Label htmlFor="home-res">Domicile ({clubInfo.name} vs Adversaire)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="away" id="away-res" />
                                            <Label htmlFor="away-res">Extérieur (Adversaire vs {clubInfo.name})</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="opponent">Adversaire</Label>
                                    <Select onValueChange={(v) => handleResultSelectChange('opponent', v)} value={newResult.opponent} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un adversaire" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredOpponentOptionsForResult.map(op => (
                                                <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                         )}

                        {resultMatchType === 'opponent-vs-opponent' && (
                            <div className="grid grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                    <Label htmlFor="homeTeam">Équipe à Domicile</Label>
                                    <Select onValueChange={(v) => handleResultSelectChange('homeTeam', v)} value={newResult.homeTeam} required>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredOpponentOptionsForResult.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="awayTeam">Équipe à l'Extérieur</Label>
                                     <Select onValueChange={(v) => handleResultSelectChange('awayTeam', v)} value={newResult.awayTeam} required>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredOpponentOptionsForResult.filter(op => op.name !== newResult.homeTeam).map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={newResult.date} onChange={handleResultInputChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Heure</Label>
                                <Input id="time" type="time" value={newResult.time} onChange={handleResultInputChange} required />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Lieu</Label>
                            <Input id="location" value={newResult.location} onChange={handleResultInputChange} placeholder="Stade ou lieu" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="score">Score final (ex: 3-1)</Label>
                            <Input id="score" value={newResult.score} onChange={handleResultInputChange} required />
                        </div>

                        {resultMatchType === 'club-match' && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={() => resetResultForm()}>Annuler</Button>
                    <Button type="submit">Sauvegarder le Résultat</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

    <Dialog open={resultDetailsOpen} onOpenChange={setResultDetailsOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Détails du match {selectedResult ? getResultTitle(selectedResult) : ''}</DialogTitle>
                    <DialogDescription>
                    {selectedResult?.date} - Score final : {selectedResult?.score}
                </DialogDescription>
            </DialogHeader>
            {selectedResult && (
                <div className="space-y-4 py-4">
                    <p>
                        <strong>Catégorie :</strong> {selectedResult.gender === 'Féminin' ? `${selectedResult.teamCategory} F` : selectedResult.teamCategory}
                    </p>
                    <p>
                        <strong>Lieu :</strong> {selectedResult.location || "Non spécifié"}
                    </p>
                    {(selectedResult.matchType === 'club-match' || !selectedResult.matchType) && (
                        <>
                        <p>
                            <strong>Buteurs :</strong> {formatPerformance(selectedResult.scorers)}
                        </p>
                        <p>
                            <strong>Passeurs :</strong> {formatPerformance(selectedResult.assists)}
                        </p>
                        </>
                    )}
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setResultDetailsOpen(false)}>Fermer</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </div>
  );
}
