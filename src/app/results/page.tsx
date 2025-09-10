
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
import { Edit, PlusCircle, Trash2, X, FilterX, Eye } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePlayersContext } from "@/context/players-context";
import type { Player } from "@/lib/data";

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);


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
    setDetailsOpen(false); // Close details modal if open
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

  const handleShowDetails = (result: Result) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  }
  
  const opponentOptions = useMemo(() => {
    const opponents = new Set(results.map(r => r.opponent));
    return Array.from(opponents);
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const categoryMatch = categoryFilter === 'all' || result.teamCategory === categoryFilter;
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
    return items.map(item => `${item.playerName}${item.count > 1 ? ` (${item.count})` : ''}`).join(", ");
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setOpponentFilter('all');
  }
  
  const getMatchOutcome = (score: string) => {
    const parts = score.split('-').map(s => parseInt(s.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return 'bg-gray-500';
    if (parts[0] > parts[1]) return 'bg-green-500'; // Victoire
    if (parts[0] < parts[1]) return 'bg-red-500'; // Défaite
    return 'bg-yellow-500'; // Nul
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle>
                    <DialogDescription>Remplissez les détails du match ci-dessous.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                   <div className="overflow-y-auto pr-6 -mr-6 flex-1">
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
                    </div>
                  <DialogFooter className="pt-4 border-t">
                      <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
                      <Button type="submit">Sauvegarder</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

       <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {playerCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={opponentFilter} onValueChange={setOpponentFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par adversaire" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les adversaires</SelectItem>
                     {opponentOptions.map(op => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {(categoryFilter !== 'all' || opponentFilter !== 'all') && (
                <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground">
                    <FilterX className="mr-2 h-4 w-4"/>
                    Réinitialiser
                </Button>
            )}
        </div>

        {loading || playersLoading ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({length: 4}).map((_, cardIndex) => (
                <Card key={cardIndex}>
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <Skeleton className="h-6 w-3/5" />
                          <Skeleton className="h-8 w-1/4 rounded-md" />
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                  </CardContent>
                   <CardFooter className="justify-end gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredResults.map((result) => {
                const isPast = new Date(result.date) < new Date();
                return (
                <Card key={result.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-lg">vs {result.opponent}</CardTitle>
                                <CardDescription>{result.date}</CardDescription>
                            </div>
                            <div className={`text-2xl font-bold p-2 rounded-md text-white ${getMatchOutcome(result.score)}`}>
                                {result.score}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <Badge variant="secondary">{result.teamCategory}</Badge>
                        <Badge variant="outline">{result.category}</Badge>
                        <p className="text-sm text-muted-foreground pt-2">{result.location}</p>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => handleShowDetails(result)}>
                            <Eye className="mr-2 h-4 w-4" /> Détails
                        </Button>
                        {!isPast && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(result)}>
                                <Edit className="mr-2 h-4 w-4" /> Modifier
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon" className="h-9 w-9">
                                      <Trash2 className="h-4 w-4" />
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
                          </>
                        )}
                    </CardFooter>
                </Card>
              )})}
            </div>
             ) : (
                <div className="text-center py-10 col-span-full">
                    <p className="text-muted-foreground">Aucun résultat trouvé pour les filtres sélectionnés.</p>
                </div>
            )}
        
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détails du match vs {selectedResult?.opponent}</DialogTitle>
                     <DialogDescription>
                        {selectedResult?.date} - Score final : {selectedResult?.score}
                    </DialogDescription>
                </DialogHeader>
                {selectedResult && (
                    <div className="space-y-4 py-4">
                      <p>
                        <strong>Lieu :</strong> {selectedResult.location || "Non spécifié"}
                      </p>
                      <p>
                        <strong>Buteurs :</strong> {formatPerformance(selectedResult.scorers)}
                      </p>
                       <p>
                        <strong>Passeurs :</strong> {formatPerformance(selectedResult.assists)}
                      </p>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => setDetailsOpen(false)}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
