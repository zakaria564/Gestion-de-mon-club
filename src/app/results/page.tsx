
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
import { useResultsContext, NewResult, Result, PerformanceDetail } from "@/context/results-context";
import { Edit, PlusCircle, Trash2, X, FilterX } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePlayersContext } from "@/context/players-context";
import type { Player } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const matchCategories = ['Match Championnat', 'Match Coupe', 'Match Amical'];

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

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [opponentFilter, setOpponentFilter] = useState('all');

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

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setNewResult({ opponent: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: 'Match Championnat', teamCategory: 'Sénior' });
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
        time: result.time || '',
        location: result.location || '',
        score: result.score,
        category: result.category || 'Match Championnat',
        teamCategory: result.teamCategory || 'Sénior',
        scorers: Array.isArray(result.scorers) ? result.scorers : [],
        assists: result.assists && Array.isArray(result.assists) ? result.assists : [],
    });
    setOpen(true);
  }

  const handleDelete = async (id: string) => {
    await deleteResult(id);
  }
  
  const opponentOptions = useMemo(() => {
    const opponents = new Set(results.map(r => r.opponent));
    return Array.from(opponents);
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const categoryMatch = categoryFilter === 'all' || result.category === categoryFilter;
      const opponentMatch = opponentFilter === 'all' || result.opponent === opponentFilter;
      return categoryMatch && opponentMatch;
    });
  }, [results, categoryFilter, opponentFilter]);
  
  const filteredPlayerOptions = useMemo(() => {
    return players
      .filter(p => p.category === newResult.teamCategory)
      .map(p => ({ value: p.name, label: p.name }));
  }, [players, newResult.teamCategory]);

  const formatPerformance = (items: PerformanceDetail[] | undefined): string => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "Aucun";
    }
    return items.map(item => `${item.playerName}${item.count ? ` (${item.count})` : ''}`).join(", ");
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setOpponentFilter('all');
  }

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
            <DialogContent className="sm:max-w-2xl h-full flex flex-col md:h-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle>
                    <DialogDescription>Remplissez les détails du match ci-dessous.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 pr-6 -mr-6">
                    <div className="grid gap-4 py-4 px-1">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label htmlFor="category">Type de match</Label>
                              <Select onValueChange={(v) => handleSelectChange('category', v)} value={newResult.category} required>
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
                                <Label htmlFor="time">Heure</Label>
                                <Input id="time" type="time" value={newResult.time} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="location">Lieu</Label>
                          <Input id="location" value={newResult.location} onChange={handleInputChange} placeholder="Stade de l'équipe adverse" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="score">Score (ex: 3-1)</Label>
                            <Input id="score" value={newResult.score} onChange={handleInputChange} required />
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
                    </div>
                  </ScrollArea>
                  <DialogFooter className="pt-4 border-t">
                      <Button type="submit">Sauvegarder</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

       <div className="flex items-center gap-4 my-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {matchCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={opponentFilter} onValueChange={setOpponentFilter}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par adversaire" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les adversaires</SelectItem>
                     {opponentOptions.map(op => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground">
                <FilterX className="mr-2 h-4 w-4"/>
                Réinitialiser
            </Button>
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
                          <span className="text-muted-foreground">{result.date}{result.time ? ` à ${result.time}` : ''}</span>
                        </span>
                      </div>
                       <span className="font-bold text-primary mx-4">{result.score}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 px-4">
                      <p>
                        <strong>Lieu :</strong> {result.location || "Non spécifié"}
                      </p>
                      <p>
                        <strong>Buteurs :</strong> {formatPerformance(result.scorers)}
                      </p>
                       <p>
                        <strong>Passeurs :</strong> {formatPerformance(result.assists)}
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

    