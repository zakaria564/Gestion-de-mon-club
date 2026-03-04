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
import { ScrollArea } from "@/components/area";
import { Separator } from "@/components/ui/separator";

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const matchCategories = ['Match Championnat', 'Match Coupe', 'Match Amical', 'Match Tournoi'];

export default function ResultsPage() {
  const context = useResultsContext();
  const playersContext = usePlayersContext();
  const clubContext = useClubContext();
  const opponentsContext = useOpponentsContext();

  if (!context || !playersContext || !clubContext || !opponentsContext) {
    throw new Error("ResultsPage must be used within all required providers");
  }

  const { results, loading, addResult, updateResult, deleteResult } = context;
  const { players } = playersContext;
  const { clubInfo } = clubContext;
  const { opponents } = opponentsContext;

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [matchType, setMatchType] = useState<'club-match' | 'opponent-vs-opponent'>('club-match');
  
  const [newResult, setNewResult] = useState<NewResult>({
    opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match',
  });
  
  useEffect(() => { if (!open) resetForm(); }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: any, value: string) => { setNewResult(prev => ({ ...prev, [field]: value as any })); };
  const handleRadioChange = (value: "home" | "away") => { setNewResult(prev => ({...prev, homeOrAway: value})); }
  
  const resetForm = () => {
    setNewResult({ opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    setOpen(false); setIsEditing(false); setEditingResult(null); setMatchType('club-match');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalResult: NewResult = { ...newResult, matchType };
    if (matchType === 'opponent-vs-opponent') {
        finalResult.opponent = `${finalResult.homeTeam} vs ${finalResult.awayTeam}`;
    }
    if (isEditing && editingResult) await updateResult({ id: editingResult.id, ...finalResult });
    else await addResult(finalResult);
    resetForm();
  };

  const filteredOpponentOptions = useMemo(() => opponents.filter(op => op.gender === newResult.gender), [opponents, newResult.gender]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Suivi des Résultats</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Ajouter un résultat</Button></DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2"><DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pb-6">
                  <div className="mt-2">
                    <Label className="mb-2 block">Type de confrontation</Label>
                    <RadioGroup value={matchType} onValueChange={(v) => setMatchType(v as any)} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="club-match" id="club-match" /><Label htmlFor="club-match">Match de mon club</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="opponent-vs-opponent" id="opponent-match" /><Label htmlFor="opponent-match">Match entre adversaires</Label></div>
                    </RadioGroup>
                  </div>
                  <Separator/>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="grid gap-2"><Label>Date</Label><Input id="date" type="date" value={newResult.date} onChange={handleInputChange} required /></div>
                    <div className="grid gap-2"><Label>Heure</Label><Input id="time" type="time" value={newResult.time} onChange={handleInputChange} required /></div>
                    <div className="grid gap-2"><Label>Lieu</Label><Input id="location" value={newResult.location} onChange={handleInputChange} required /></div>
                    <div className="grid gap-2"><Label>Type</Label><Select onValueChange={(v) => handleSelectChange('category', v)} value={newResult.category} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{matchCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Catégorie</Label><Select onValueChange={(v) => handleSelectChange('teamCategory', v)} value={newResult.teamCategory} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Genre</Label><Select onValueChange={(v) => handleSelectChange('gender', v)} value={newResult.gender} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2 md:col-span-3"><Label className="text-center">Score (ex: 3-1)</Label><Input id="score" value={newResult.score} onChange={handleInputChange} required className="text-center text-xl font-bold" /></div>
                    {matchType === 'club-match' ? (
                      <>
                        <div className="grid gap-2"><Label>Lieu</Label><RadioGroup value={newResult.homeOrAway} onValueChange={handleRadioChange} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="home" id="h-res" /><Label htmlFor="h-res">Domicile</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="away" id="a-res" /><Label htmlFor="a-res">Extérieur</Label></div></RadioGroup></div>
                        <div className="grid gap-2"><Label>Adversaire</Label><Select onValueChange={(v) => handleSelectChange('opponent', v)} value={newResult.opponent} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent></Select></div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-2"><Label>Équipe Domicile</Label><Select onValueChange={(v) => handleSelectChange('homeTeam', v)} value={newResult.homeTeam || ''} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="grid gap-2"><Label>Équipe Extérieur</Label><Select onValueChange={(v) => handleSelectChange('awayTeam', v)} value={newResult.awayTeam || ''} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent></Select></div>
                      </>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="p-6 pt-4 border-t gap-2 bg-background mt-auto">
                <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
