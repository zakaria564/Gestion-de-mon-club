
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResultsContext, NewResult, Result, PerformanceDetail } from "@/context/results-context";
import { Edit, PlusCircle, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePlayersContext } from "@/context/players-context";
import type { Player } from "@/lib/data";

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

export default function ResultsPage() {
  const context = useResultsContext();
  const playersContext = usePlayersContext();

  if (!context || !playersContext) {
    throw new Error("ResultsPage must be used within a ResultsProvider and PlayersProvider");
  }

  const { results, loading, addResult, updateResult, deleteResult } = context;
  const { players, loading: playersLoading } = playersContext;

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterKey, setFilterKey] = useState("opponent");

  const [newResult, setNewResult] = useState<NewResult>({
    opponent: '',
    date: '',
    score: '',
    scorers: [],
    assists: [],
    category: 'Match Championnat',
    teamCategory: 'Sénior',
    notes: '',
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: 'category' | 'teamCategory', value: string) => {
    setNewResult(prev => ({ ...prev, [field]: value }));
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
  
  const resetForm = () => {
    setNewResult({ opponent: '', date: '', score: '', scorers: [], assists: [], category: 'Match Championnat', teamCategory: 'Sénior', notes: '' });
    setOpen(false);
    setIsEditing(false);
    setEditingResult(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const finalResult = {
        ...newResult,
        scorers: newResult.scorers.filter(s => s.playerName),
        assists: newResult.assists.filter(a => a.playerName)
    };

    if (isEditing && editingResult) {
      await updateResult({ id: editingResult.id, ...finalResult });
    } else {
      await addResult(finalResult);
    }
    resetForm();
  };

  const openEditDialog = (result: Result) => {
    setIsEditing(true);
    setEditingResult(result);
    setNewResult({
        opponent: result.opponent,
        date: result.date,
        score: result.score,
        category: result.category || 'Match Championnat',
        teamCategory: result.teamCategory || 'Sénior',
        scorers: Array.isArray(result.scorers) ? result.scorers : [],
        assists: result.assists && Array.isArray(result.assists) ? result.assists : [],
        notes: result.notes || '',
    });
    setOpen(true);
  }

  const handleDelete = async (id: string) => {
    await deleteResult(id);
  }
  
  const filteredResults = useMemo(() => {
    if (!searchQuery) return results;
    return results.filter(result => {
        const value = result[filterKey as keyof Result] as string;
        return value?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [results, searchQuery, filterKey]);
  
  const filteredPlayerOptions = useMemo(() => {
    return players
      .filter(p => p.category === newResult.teamCategory)
      .map(p => ({ value: p.name, label: p.name }));
  }, [players, newResult.teamCategory]);

  const formatPerformance = (items: PerformanceDetail[] | undefined): string => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "Aucun";
    }
    return items.map(item => `${item.playerName}${item.count > 1 ? ` (${item.count})` : ''}`).join(", ");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Suivi des Résultats</h2>
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => { setIsEditing(false); setEditingResult(null); setOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un résultat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle>
                        <DialogDescription>Remplissez les détails du match ci-dessous.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label htmlFor="category">Type de match</Label>
                              <Select onValueChange={(v) => handleSelectChange('category', v)} value={newResult.category} required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Match Amical">Match Amical</SelectItem>
                                    <SelectItem value="Match Championnat">Match de Championnat</SelectItem>
                                    <SelectItem value="Match Coupe">Match de Coupe</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                           <div className="grid gap-2">
                              <Label htmlFor="teamCategory">Catégorie de l'équipe</Label>
                              <Select onValueChange={(v) => handleSelectChange('teamCategory', v)} value={newResult.teamCategory} required>
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
                            <Label htmlFor="opponent">Adversaire</Label>
                            <Input id="opponent" value={newResult.opponent} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={newResult.date} onChange={handleInputChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="score">Score (ex: 3-1)</Label>
                                <Input id="score" value={newResult.score} onChange={handleInputChange} required />
                            </div>
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
                            <Label>Passeurs</Label>
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
                        
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={newResult.notes || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Sauvegarder</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

       <div className="flex items-center gap-4 my-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder={`Rechercher par ${filterKey === 'opponent' ? 'adversaire' : 'catégorie'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={filterKey} onValueChange={setFilterKey}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="opponent">Adversaire</SelectItem>
                    <SelectItem value="category">Catégorie</SelectItem>
                </SelectContent>
            </Select>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Résultats des Matchs</CardTitle>
          <CardDescription>
            Consultez les résultats des matchs passés de votre club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || playersLoading ? (
             <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredResults.map((result) => (
                <AccordionItem key={result.id} value={`item-${result.id}`}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <div className="flex-1 text-left flex items-center gap-4">
                        <Badge variant="outline">{result.teamCategory || 'N/A'}</Badge>
                        <Badge variant="secondary">{result.category}</Badge>
                        <span>
                          Club vs {result.opponent} -{" "}
                          <span className="text-muted-foreground">{result.date}</span>
                        </span>
                      </div>
                       <span className="font-bold text-primary mx-4">{result.score}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 px-4">
                      <p>
                        <strong>Buteurs:</strong> {formatPerformance(result.scorers)}
                      </p>
                       <p>
                        <strong>Passeurs:</strong> {formatPerformance(result.assists)}
                      </p>
                      <p>
                        <strong>Notes:</strong> {result.notes || 'Aucune'}
                      </p>
                       <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(result)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement ce résultat.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(result.id)}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
                {filteredResults.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Aucun résultat trouvé.</p>
                )}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    