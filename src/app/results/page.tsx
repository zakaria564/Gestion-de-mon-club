
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResultsContext, NewResult, Result } from "@/context/results-context";
import { Edit, PlusCircle, Trash2, Calendar, MapPin, MoreHorizontal, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useClubContext } from "@/context/club-context";
import { useOpponentsContext } from "@/context/opponents-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format, parseISO } from 'date-fns';

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const matchCategories = ['Match Championnat', 'Match Coupe', 'Match Amical', 'Match Tournoi'];

export default function ResultsPage() {
  const context = useResultsContext();
  const clubContext = useClubContext();
  const opponentsContext = useOpponentsContext();

  const results = context?.results || [];
  const loading = context?.loading || false;
  const clubInfo = clubContext?.clubInfo || { name: 'Mon Club' };
  const opponents = opponentsContext?.opponents || [];

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [matchType, setMatchType] = useState<'club-match' | 'opponent-vs-opponent'>('club-match');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newResult, setNewResult] = useState<NewResult>({
    opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match',
  });
  
  useEffect(() => { if (!open) resetForm(); }, [open]);

  const resetForm = () => {
    setNewResult({ opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    setOpen(false); setIsEditing(false); setEditingResult(null); setMatchType('club-match'); setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const finalResult = { ...newResult, matchType };
      if (matchType === 'opponent-vs-opponent') finalResult.opponent = `${finalResult.homeTeam} vs ${finalResult.awayTeam}`;
      if (isEditing && editingResult) await context?.updateResult({ id: editingResult.id, ...finalResult });
      else await context?.addResult(finalResult);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (res: Result) => {
    setEditingResult(res);
    setNewResult({ ...res });
    setMatchType(res.matchType || 'club-match');
    setIsEditing(true);
    setOpen(true);
  };

  if (loading && results.length === 0) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Résultats</h2>
        <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un résultat</Button>
      </div>

      <div className="grid gap-4">
        {results.map((res) => (
          <Card key={res.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center bg-background rounded-lg border p-2 min-w-[80px]">
                    <span className="text-lg font-bold">{res.score}</span>
                    <span className="text-xs text-muted-foreground uppercase">{res.category.replace('Match ', '')}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {res.matchType === 'opponent-vs-opponent' ? res.opponent : (res.homeOrAway === 'home' ? `${clubInfo.name} vs ${res.opponent}` : `${res.opponent} vs ${clubInfo.name}`)}
                    </p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {res.date ? format(parseISO(res.date), 'dd/MM/yyyy') : 'N/A'}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {res.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{res.teamCategory}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(res)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmer</AlertDialogTitle><AlertDialogDescription>Supprimer ce résultat ?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => context?.deleteResult(res.id)}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">Aucun résultat enregistré.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <RadioGroup value={matchType} onValueChange={(v: any) => setMatchType(v)} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="club-match" id="club" /><Label htmlFor="club">Mon Club</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="opponent-vs-opponent" id="opp" /><Label htmlFor="opp">Adversaires</Label></div>
                </RadioGroup>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label htmlFor="date">Date</Label><Input id="date" type="date" value={newResult.date} onChange={handleInputChange} required /></div>
                  <div className="grid gap-2"><Label htmlFor="score">Score (ex: 2-1)</Label><Input id="score" value={newResult.score} onChange={handleInputChange} required className="text-center font-bold text-lg" /></div>
                </div>
                {matchType === 'club-match' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Lieu</Label>
                      <Select value={newResult.homeOrAway} onValueChange={(v: any) => setNewResult(p => ({...p, homeOrAway: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="home">Domicile</SelectItem><SelectItem value="away">Extérieur</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Adversaire</Label>
                      <Select value={newResult.opponent} onValueChange={(v) => setNewResult(p => ({...p, opponent: v}))}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>{opponents.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Équipe Domicile</Label>
                      <Select value={newResult.homeTeam} onValueChange={(v) => setNewResult(p => ({...p, homeTeam: v}))}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>{opponents.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Équipe Extérieur</Label>
                      <Select value={newResult.awayTeam} onValueChange={(v) => setNewResult(p => ({...p, awayTeam: v}))}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>{opponents.map(o => <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={newResult.category} onValueChange={(v) => setNewResult(p => ({...p, category: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{matchCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Catégorie</Label>
                    <Select value={newResult.teamCategory} onValueChange={(v) => setNewResult(p => ({...p, teamCategory: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2"><Label htmlFor="location">Lieu exact</Label><Input id="location" value={newResult.location} onChange={handleInputChange} required placeholder="ex: Stade Municipal" /></div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-background shrink-0 flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>Annuler</Button>
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
