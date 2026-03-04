"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResultsContext, NewResult, Result, PerformanceDetail } from "@/context/results-context";
import { Edit, PlusCircle, Trash2, X, FilterX, Eye, MoreHorizontal, Calendar, MapPin, Trophy, Star, Hash } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePlayersContext } from "@/context/players-context";
import type { Player } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useClubContext } from "@/context/club-context";
import { useOpponentsContext } from "@/context/opponents-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

type GroupedResults = Record<string, Record<string, Result[]>>;

export default function ResultsPage() {
  const context = useResultsContext();
  const playersContext = usePlayersContext();
  const clubContext = useClubContext();
  const opponentsContext = useOpponentsContext();

  if (!context || !playersContext || !clubContext || !opponentsContext) {
    throw new Error("ResultsPage must be used within all required providers");
  }

  const { results, loading, addResult, updateResult, deleteResult } = context;
  const { players, loading: playersLoading } = playersContext;
  const { clubInfo } = clubContext;
  const { opponents, loading: opponentsLoading } = opponentsContext;

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [opponentFilter, setOpponentFilter] = useState('all');
  const [matchType, setMatchType] = useState<'club-match' | 'opponent-vs-opponent'>('club-match');
  
  const [manualOpponentScorers, setManualOpponentScorers] = useState<PerformanceDetail[]>([]);
  const [manualOpponentAssists, setManualOpponentAssists] = useState<PerformanceDetail[]>([]);
  const [manualAwayScorers, setManualAwayScorers] = useState<PerformanceDetail[]>([]);
  const [manualAwayAssists, setManualAwayAssists] = useState<PerformanceDetail[]>([]);

  const [newResult, setNewResult] = useState<NewResult>({
    opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match',
  });
  
  useEffect(() => { if (!open) resetForm(); }, [open]);
  useEffect(() => { setNewResult(prev => ({ ...prev, matchType })); }, [matchType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: any, value: string) => { setNewResult(prev => ({ ...prev, [field]: value as any })); };
  const handleRadioChange = (value: "home" | "away") => { setNewResult(prev => ({...prev, homeOrAway: value})); }
  
  const handlePerformanceChange = (listName: 'scorers' | 'assists', index: number, field: 'playerName' | 'count', value: string | number) => {
      const updatedList = [...newResult[listName]];
      const item = { ...updatedList[index] };
      if (field === 'playerName') item.playerName = value as string;
      else item.count = Math.max(1, Number(value));
      updatedList[index] = item;
      setNewResult(prev => ({ ...prev, [listName]: updatedList }));
  };

  const handleManualPerformanceChange = (list: PerformanceDetail[], setList: React.Dispatch<React.SetStateAction<PerformanceDetail[]>>, index: number, field: 'playerName' | 'count', value: string | number) => {
      const updatedList = [...list];
      const item = { ...updatedList[index] };
      if (field === 'playerName') item.playerName = value as string;
      else item.count = Math.max(1, Number(value));
      updatedList[index] = item;
      setList(updatedList);
  };

  const resetForm = () => {
    setNewResult({ opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    setManualOpponentScorers([]); setManualOpponentAssists([]); setManualAwayScorers([]); setManualAwayAssists([]);
    setOpen(false); setIsEditing(false); setEditingResult(null); setMatchType('club-match');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalResult: NewResult = { ...newResult };
    let allScorers: PerformanceDetail[] = [...(finalResult.scorers || [])].filter(s => s.playerName);
    let allAssists: PerformanceDetail[] = [...(finalResult.assists || [])].filter(a => a.playerName);

    if (matchType === 'club-match') {
      allScorers = [...allScorers, ...manualOpponentScorers.map(s => ({ playerName: `${s.playerName} (${finalResult.opponent})`, count: s.count }))];
      allAssists = [...allAssists, ...manualOpponentAssists.map(a => ({ playerName: `${a.playerName} (${finalResult.opponent})`, count: a.count }))];
    } else {
      finalResult.opponent = `${finalResult.homeTeam} vs ${finalResult.awayTeam}`;
      allScorers = [...manualOpponentScorers.map(s => ({...s, playerName: `${s.playerName} (${finalResult.homeTeam})`})), ...manualAwayScorers.map(s => ({...s, playerName: `${s.playerName} (${finalResult.awayTeam})`}))];
      allAssists = [...manualOpponentAssists.map(a => ({...a, playerName: `${a.playerName} (${finalResult.homeTeam})`})), ...manualAwayAssists.map(a => ({...a, playerName: `${a.playerName} (${finalResult.awayTeam})`}))];
    }
    finalResult.scorers = allScorers; finalResult.assists = allAssists;
    if (isEditing && editingResult) await updateResult({ id: editingResult.id, ...finalResult });
    else await addResult(finalResult);
    resetForm();
  };

  const openEditDialog = (result: Result) => {
    setDetailsOpen(false); setIsEditing(true); setEditingResult(result);
    const resultMatchType = result.matchType || 'club-match'; setMatchType(resultMatchType);
    setNewResult({
      opponent: result.opponent, homeTeam: result.homeTeam || '', awayTeam: result.awayTeam || '', date: result.date, time: result.time || '', location: result.location || '', score: result.score, category: result.category || '', teamCategory: result.teamCategory || '', gender: result.gender || 'Masculin', scorers: result.scorers?.filter(s => !s.playerName.includes('(')) || [], assists: result.assists?.filter(a => !a.playerName.includes('(')) || [], homeOrAway: result.homeOrAway || 'home', matchType: resultMatchType,
    });
    setOpen(true);
  }

  const filteredOpponentOptions = useMemo(() => opponents.filter(op => op.gender === newResult.gender), [opponents, newResult.gender]);
  const allPossiblePlayersOptions = useMemo(() => players.filter(p => p.category === newResult.teamCategory && p.gender === newResult.gender).map(p => ({ value: p.name, label: p.name })), [players, newResult.teamCategory, newResult.gender]);

  const getMatchOutcome = (result: Result) => {
    if (result.matchType?.includes('opponent')) return 'bg-primary';
    const parts = result.score.split('-').map(s => parseInt(s.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return 'bg-gray-500';
    const usdsGoals = result.homeOrAway === 'home' ? parts[0] : parts[1];
    const opponentGoals = result.homeOrAway === 'home' ? parts[1] : parts[0];
    if (usdsGoals > opponentGoals) return 'bg-green-500';
    if (usdsGoals < opponentGoals) return 'bg-red-500';
    return 'bg-orange-500';
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2"><h2 className="text-3xl font-bold tracking-tight">Suivi des Résultats</h2><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Ajouter un résultat</Button></DialogTrigger><DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"><DialogHeader className="p-6 pb-2"><DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden"><ScrollArea className="flex-1 px-6"><div className="space-y-6 pb-6"><RadioGroup value={matchType} onValueChange={(v) => setMatchType(v as any)} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="club-match" id="club-match" /><Label htmlFor="club-match">Match de mon club</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="opponent-vs-opponent" id="opponent-match" /><Label htmlFor="opponent-match">Match entre adversaires</Label></div></RadioGroup><Separator/><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"><div className="grid gap-2"><Label>Date</Label><Input id="date" type="date" value={newResult.date} onChange={handleInputChange} required /></div><div className="grid gap-2"><Label>Heure</Label><Input id="time" type="time" value={newResult.time} onChange={handleInputChange} required /></div><div className="grid gap-2"><Label>Lieu</Label><Input id="location" value={newResult.location} onChange={handleInputChange} required /></div><div className="grid gap-2"><Label>Type</Label><Select onValueChange={(v) => handleSelectChange('category', v)} value={newResult.category} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{matchCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label>Catégorie</Label><Select onValueChange={(v) => handleSelectChange('teamCategory', v)} value={newResult.teamCategory} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label>Genre</Label><Select onValueChange={(v) => handleSelectChange('gender', v)} value={newResult.gender} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></div><div className="grid gap-2 md:col-span-3"><Label className="text-center">Score (ex: 3-1)</Label><Input id="score" value={newResult.score} onChange={handleInputChange} required className="text-center text-xl font-bold" /></div>{matchType === 'club-match' && <><div className="grid gap-2"><Label>Lieu</Label><RadioGroup value={newResult.homeOrAway} onValueChange={handleRadioChange} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="home" id="h-res" /><Label htmlFor="h-res">Domicile</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="away" id="a-res" /><Label htmlFor="a-res">Extérieur</Label></div></RadioGroup></div><div className="grid gap-2"><Label>Adversaire</Label><Select onValueChange={(v) => handleSelectChange('opponent', v)} value={newResult.opponent} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent></Select></div></>}</div></div></ScrollArea><DialogFooter className="p-6 pt-4 border-t gap-2 bg-background mt-auto"><Button type="button" variant="outline" onClick={resetForm}>Annuler</Button><Button type="submit">Enregistrer</Button></DialogFooter></form></DialogContent></Dialog></div>
    </div>
  );
}
