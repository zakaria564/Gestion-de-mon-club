

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
import { Edit, PlusCircle, Trash2, X, FilterX, Eye, MoreHorizontal, UserPlus, Calendar, MapPin, Trophy, Star, Hash, Clock } from "lucide-react";
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
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
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
  
  const [manualOpponentScorers, setManualOpponentScorers] = useState("");
  const [manualOpponentAssists, setManualOpponentAssists] = useState("");
  const [manualScorers, setManualScorers] = useState("");
  const [manualAssists, setManualAssists] = useState("");

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
    category: '',
    teamCategory: '',
    gender: 'Masculin',
    homeOrAway: 'home',
    matchType: 'club-match',
  });
  
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  
   useEffect(() => {
    setNewResult(prev => ({ ...prev, matchType }));
  }, [matchType]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: 'category' | 'teamCategory' | 'opponent' | 'homeTeam' | 'awayTeam' | 'gender', value: string) => {
    setNewResult(prev => ({ ...prev, [field]: value as any }));
  };

  const handleRadioChange = (value: "home" | "away") => {
    setNewResult(prev => ({...prev, homeOrAway: value}));
  }
  
  const handlePerformanceChange = (
    listName: 'scorers' | 'assists',
    index: number,
    field: 'playerName' | 'count',
    value: string | number
  ) => {
      const updatedList = [...newResult[listName]];
      const item = { ...updatedList[index] };
      if (field === 'playerName') {
          item.playerName = value as string;
      } else {
          item.count = Math.max(1, Number(value)); // Ensure count is at least 1
      }
      updatedList[index] = item;
      setNewResult(prev => ({ ...prev, [listName]: updatedList }));
  };

  const addPerformanceItem = (listName: 'scorers' | 'assists') => {
      const list = [...newResult[listName], { playerName: '', count: 1 }];
      setNewResult(prev => ({ ...prev, [listName]: list }));
  };

  const removePerformanceItem = (listName: 'scorers' | 'assists', index: number) => {
      const list = newResult[listName].filter((_, i) => i !== index);
      setNewResult(prev => ({ ...prev, [listName]: list }));
  };
  
  const resetForm = () => {
    setNewResult({ opponent: '', homeTeam: '', awayTeam: '', date: '', time: '', location: '', score: '', scorers: [], assists: [], category: '', teamCategory: '', gender: 'Masculin', homeOrAway: 'home', matchType: 'club-match' });
    setManualOpponentScorers("");
    setManualOpponentAssists("");
    setManualScorers("");
    setManualAssists("");
    setOpen(false);
    setIsEditing(false);
    setEditingResult(null);
    setMatchType('club-match');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const finalResult: NewResult = { ...newResult };
  
    const processManualInput = (input: string, teamName?: string): PerformanceDetail[] => {
        if (!input.trim()) return [];
        const names = input.split('\n').map(name => name.trim()).filter(Boolean);
        return names.map(name => ({
            playerName: teamName ? `${name} (${teamName})` : name,
            count: 1
        }));
    };
  
    let allScorers: PerformanceDetail[] = [...(finalResult.scorers || [])].filter(s => s.playerName);
    let allAssists: PerformanceDetail[] = [...(finalResult.assists || [])].filter(a => a.playerName);
  
    if (matchType === 'club-match') {
        const opponentScorers = processManualInput(manualOpponentScorers, finalResult.opponent);
        const opponentAssists = processManualInput(manualOpponentAssists, finalResult.opponent);
        allScorers = [...allScorers, ...opponentScorers];
        allAssists = [...allAssists, ...opponentAssists];
    } else if (matchType === 'opponent-vs-opponent') {
        finalResult.opponent = `${finalResult.homeTeam} vs ${finalResult.awayTeam}`;
        allScorers = processManualInput(manualScorers);
        allAssists = processManualInput(manualAssists);
    }
    
    // Consolidate counts
    const consolidate = (items: PerformanceDetail[]): PerformanceDetail[] => {
      return items.reduce((acc, item) => {
        const existing = acc.find(i => i.playerName === item.playerName);
        if (existing) {
          existing.count += item.count;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as PerformanceDetail[]);
    };

    finalResult.scorers = consolidate(allScorers);
    finalResult.assists = consolidate(allAssists);

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
    setMatchType(result.matchType || 'club-match');
  
    const clubScorers = result.scorers?.filter(s => !s.playerName.includes('(')) || [];
    const clubAssists = result.assists?.filter(a => !a.playerName.includes('(')) || [];
  
    const opponentScorers = result.scorers?.filter(s => s.playerName.includes(`(${result.opponent})`))
      .map(s => s.playerName.replace(` (${result.opponent})`, '')).join('\n') || '';
    const opponentAssists = result.assists?.filter(a => a.playerName.includes(`(${result.opponent})`))
      .map(a => a.playerName.replace(` (${result.opponent})`, '')).join('\n') || '';
      
    const manualScorersText = result.scorers?.map(s => s.playerName).join('\n') || '';
    const manualAssistsText = result.assists?.map(a => a.playerName).join('\n') || '';
  
    setNewResult({
        opponent: result.opponent,
        homeTeam: result.homeTeam || '',
        awayTeam: result.awayTeam || '',
        date: result.date,
        time: result.time || '',
        location: result.location || '',
        score: result.score,
        category: result.category || '',
        teamCategory: result.teamCategory || '',
        gender: result.gender || 'Masculin',
        scorers: clubScorers,
        assists: clubAssists,
        homeOrAway: result.homeOrAway || 'home',
        matchType: result.matchType || 'club-match',
    });
  
    if(result.matchType === 'club-match') {
      setManualOpponentScorers(opponentScorers);
      setManualOpponentAssists(opponentAssists);
      setManualScorers('');
      setManualAssists('');
    } else {
      setManualScorers(manualScorersText);
      setManualAssists(manualAssistsText);
      setManualOpponentScorers('');
      setManualOpponentAssists('');
    }
  
    setOpen(true);
  }

  const handleDelete = async (id: string) => {
    await deleteResult(id);
    setDetailsOpen(false);
  }

  const handleShowDetails = (result: Result) => {
    setSelectedResult(result);
    setDetailsOpen(true);
  }
  
  const filteredOpponentOptions = useMemo(() => {
    return opponents.filter(op => op.gender === newResult.gender);
  }, [opponents, newResult.gender]);

  const opponentOptions = useMemo(() => {
    const allOpponents = results.flatMap(r => {
        if (r.matchType === 'opponent-vs-opponent') {
            return [r.homeTeam, r.awayTeam];
        }
        return [r.opponent];
    });
    return [...new Set(allOpponents.filter(Boolean))] as string[];
  }, [results]);

  const {
      maleClubResults, femaleClubResults,
      maleOpponentResults, femaleOpponentResults
  } = useMemo(() => {
    const filtered = results.filter(result => {
        const categoryMatch = categoryFilter === 'all' || result.teamCategory === categoryFilter;
        const opponentMatch = opponentFilter === 'all' || result.opponent === opponentFilter || result.homeTeam === opponentFilter || result.awayTeam === opponentFilter;
        return categoryMatch && opponentMatch;
    });

    const clubResults = filtered.filter(r => r.matchType !== 'opponent-vs-opponent' && r.matchType !== 'opponent_vs_opponent');
    const opponentResults = filtered.filter(r => r.matchType === 'opponent-vs-opponent' || r.matchType === 'opponent_vs_opponent');

    const groupLogic = (resultsToGroup: Result[]): GroupedResults => {
        const grouped: GroupedResults = {};
        resultsToGroup.forEach(result => {
            const teamCat = result.teamCategory;
            const matchCat = result.category;
            if (!grouped[teamCat]) grouped[teamCat] = {};
            if (!grouped[teamCat][matchCat]) grouped[teamCat][matchCat] = [];
            grouped[teamCat][matchCat].push(result);
        });
        
        const sortAndGroup = (grouped: GroupedResults): GroupedResults => {
            const sortedGroupedResults: GroupedResults = {};
            const sortedTeamCategories = Object.keys(grouped).sort((a, b) => playerCategories.indexOf(a as Player['category']) - playerCategories.indexOf(b as Player['category']));
            
            for (const teamCat of sortedTeamCategories) {
                sortedGroupedResults[teamCat] = {};
                const sortedMatchCategories = Object.keys(grouped[teamCat]).sort((a, b) => matchCategories.indexOf(a) - matchCategories.indexOf(b));
                for (const matchCat of sortedMatchCategories) {
                    sortedGroupedResults[teamCat][matchCat] = grouped[teamCat][matchCat].sort((a,b) => b.date.localeCompare(a.date));
                }
            }
            return sortedGroupedResults;
        };

        return sortAndGroup(grouped);
    };

    const maleClubResults = groupLogic(clubResults.filter(r => r.gender === 'Masculin'));
    const femaleClubResults = groupLogic(clubResults.filter(r => r.gender === 'Féminin'));
    const maleOpponentResults = groupLogic(opponentResults.filter(r => r.gender === 'Masculin'));
    const femaleOpponentResults = groupLogic(opponentResults.filter(r => r.gender === 'Féminin'));

    return { maleClubResults, femaleClubResults, maleOpponentResults, femaleOpponentResults };
  }, [results, categoryFilter, opponentFilter]);

  const allPossiblePlayersOptions = useMemo(() => {
    return players
      .filter(p => p.category === newResult.teamCategory && p.gender === newResult.gender)
      .map(p => ({
        value: p.name,
        label: p.name,
        group: clubInfo.name
      }));
  }, [players, newResult.teamCategory, newResult.gender, clubInfo.name]);


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
  
  const getMatchOutcome = (result: Result) => {
    if (result.matchType === 'opponent-vs-opponent') {
        return 'bg-primary'; // Blue for opponent vs opponent
    }

    const parts = result.score.split('-').map(s => parseInt(s.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        return 'bg-gray-500'; // Default for invalid score
    }
    
    const usdsGoals = result.homeOrAway === 'home' ? parts[0] : parts[1];
    const opponentGoals = result.homeOrAway === 'home' ? parts[1] : parts[0];

    if (usdsGoals > opponentGoals) return 'bg-green-500'; // Win
    if (usdsGoals < opponentGoals) return 'bg-red-500'; // Loss
    return 'bg-orange-500'; // Draw
  }

  const getResultTitle = (result: Result) => {
     if (result.matchType === 'opponent-vs-opponent' || result.matchType === 'opponent_vs_opponent') {
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

  const isLoading = loading || playersLoading || opponentsLoading;

  const renderResultsView = (groupedData: GroupedResults, gender: 'Masculin' | 'Féminin') => {
      if (isLoading) {
          return (
             <div className="space-y-8">
              {Array.from({length: 2}).map((_, groupIndex) => (
                <div key={groupIndex}>
                    <Skeleton className="h-8 w-1/4 mb-4" />
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
                                <Skeleton className="h-8 w-8 rounded-full" />
                        </CardFooter>
                        </Card>
                    ))}
                    </div>
                </div>
              ))}
            </div>
          );
      }
      
      if (Object.keys(groupedData).length === 0) {
          return (
              <div className="text-center py-10 col-span-full">
                  <p className="text-muted-foreground">Aucun résultat trouvé pour cette vue.</p>
              </div>
          );
      }

      return (
          <div className="space-y-8">
              {Object.entries(groupedData).map(([teamCategory, matchCategories]) => (
                <div key={teamCategory}>
                    <h3 className="text-2xl font-bold tracking-tight mb-4" style={{ color: categoryColors[teamCategory] }}>{teamCategory}</h3>
                    <div className="space-y-6">
                        {Object.entries(matchCategories).map(([matchCategory, categoryResults]) => (
                             <div key={matchCategory}>
                                <h4 className="text-xl font-semibold mb-3">{matchCategory}</h4>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                  {categoryResults.map((result) => (
                                    <Card key={result.id} className="flex flex-col">
                                        <CardHeader className="p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <CardTitle className="text-sm leading-tight">{getResultTitle(result)}</CardTitle>
                                                    <CardDescription className="text-xs">{result.date}</CardDescription>
                                                </div>
                                                <div className={`text-lg font-bold p-1 rounded-md text-white ${getMatchOutcome(result)}`}>
                                                    {result.score}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3 flex-grow space-y-1">
                                            <div className="flex flex-wrap gap-1">
                                              <Badge 
                                                  style={{ backgroundColor: categoryColors[result.teamCategory], color: 'white' }} 
                                                  className="border-transparent text-xs"
                                              >
                                                  {result.gender === 'Féminin' ? `${result.teamCategory} F` : result.teamCategory}
                                              </Badge>
                                              <Badge variant="outline" className="text-xs">{result.category}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground pt-1">{result.location}</p>
                                        </CardContent>
                                        <CardFooter className="p-2 justify-end">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Ouvrir le menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => handleShowDetails(result)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Détails
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => openEditDialog(result)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Modifier
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                                          <Trash2 className="mr-2 h-4 w-4" />
                                                          Supprimer
                                                      </DropdownMenuItem>
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
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </CardFooter>
                                    </Card>
                                  ))}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
              ))}
            </div>
      );
  };

  const performanceByTeam = (performance: PerformanceDetail[] | undefined) => {
    if (!performance) return {};
    return performance.reduce((acc, item) => {
      const match = item.playerName.match(/(.*) \((.*)\)/);
      const team = match ? match[2] : clubInfo.name;
      const name = match ? match[1] : item.playerName;
      
      const teamKey = team.trim();
      if (!acc[teamKey]) {
        acc[teamKey] = [];
      }
      acc[teamKey].push({ ...item, playerName: name.trim() });
      return acc;
    }, {} as Record<string, PerformanceDetail[]>);
  };
  
  const selectedScorersByTeam = performanceByTeam(selectedResult?.scorers);
  const selectedAssistsByTeam = performanceByTeam(selectedResult?.assists);

  const teamNames = useMemo(() => {
    if (!selectedResult) return ['', ''];
    if (selectedResult.matchType === 'opponent-vs-opponent' || selectedResult.matchType === 'opponent_vs_opponent') {
        return [selectedResult.homeTeam || '', selectedResult.awayTeam || ''];
    }
    const teamA = selectedResult.homeOrAway === 'home' ? clubInfo.name : selectedResult.opponent;
    const teamB = selectedResult.homeOrAway === 'home' ? selectedResult.opponent : clubInfo.name;
    return [teamA, teamB];
  }, [selectedResult, clubInfo.name]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Suivi des Résultats</h2>
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Ajouter un résultat</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle>
                    <DialogDescription>Remplissez les détails du match ci-dessous.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <ScrollArea className="h-[70vh] p-4">
                        <div className="space-y-6">
                            <RadioGroup value={matchType} onValueChange={(v) => setMatchType(v as any)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="club-match" id="club-match" />
                                    <Label htmlFor="club-match">Match de mon club</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="opponent-vs-opponent" id="opponent-match" />
                                    <Label htmlFor="opponent-match">Match entre adversaires</Label>
                                </div>
                            </RadioGroup>
                            
                            <Separator/>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {matchType === 'club-match' ? (
                                <>
                                  <div className="grid gap-2">
                                      <Label>Domicile / Extérieur</Label>
                                      <RadioGroup value={newResult.homeOrAway} onValueChange={handleRadioChange} className="flex gap-4">
                                          <div className="flex items-center space-x-2">
                                              <RadioGroupItem value="home" id="home-res" />
                                              <Label htmlFor="home-res">Domicile</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                              <RadioGroupItem value="away" id="away-res" />
                                              <Label htmlFor="away-res">Extérieur</Label>
                                          </div>
                                      </RadioGroup>
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="opponent">Adversaire</Label>
                                      <Select onValueChange={(v) => handleSelectChange('opponent', v)} value={newResult.opponent} required>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>{filteredOpponentOptions.map(op => (<SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>))}</SelectContent>
                                      </Select>
                                  </div>
                                </>
                               ) : (
                                <>
                                  <div className="grid gap-2">
                                      <Label htmlFor="homeTeam">Équipe à Domicile</Label>
                                      <Select onValueChange={(v) => handleSelectChange('homeTeam', v)} value={newResult.homeTeam} required>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>{filteredOpponentOptions.map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                  </div>
                                  <div className="grid gap-2">
                                      <Label htmlFor="awayTeam">Équipe à l'Extérieur</Label>
                                      <Select onValueChange={(v) => handleSelectChange('awayTeam', v)} value={newResult.awayTeam} required>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>{filteredOpponentOptions.filter(op => op.name !== newResult.homeTeam).map(op => <SelectItem key={op.id} value={op.name}>{op.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                  </div>
                                </>
                               )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Type de match</Label>
                                    <Select onValueChange={(v) => handleSelectChange('category', v)} value={newResult.category} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{matchCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="teamCategory">Catégorie de l'équipe</Label>
                                    <Select onValueChange={(v) => handleSelectChange('teamCategory', v)} value={newResult.teamCategory} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Genre</Label>
                                    <Select onValueChange={(v) => handleSelectChange('gender', v)} value={newResult.gender} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input id="date" type="date" value={newResult.date} onChange={handleInputChange} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Heure</Label>
                                    <Input id="time" type="time" value={newResult.time} onChange={handleInputChange} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Lieu</Label>
                                    <Input id="location" value={newResult.location} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <Separator />
                            
                            <div className="grid gap-2 sm:col-span-2 md:col-span-3">
                                <Label htmlFor="score">Score final (ex: 3-1)</Label>
                                <Input id="score" value={newResult.score} onChange={handleInputChange} required className="text-center text-lg font-bold" />
                            </div>

                            {matchType === 'club-match' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="font-semibold mb-2 text-center">{newResult.homeOrAway === 'home' ? clubInfo.name : newResult.opponent}</div>
                                        <div className="space-y-4 p-4 border rounded-md">
                                            <div>
                                                <Label>Buteurs</Label>
                                                {newResult.scorers.map((scorer, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <Select value={scorer.playerName} onValueChange={(val) => handlePerformanceChange('scorers', index, 'playerName', val)}><SelectTrigger><SelectValue placeholder="Choisir joueur..."/></SelectTrigger><SelectContent>{allPossiblePlayersOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                                                        <Input type="number" value={scorer.count} onChange={(e) => handlePerformanceChange('scorers', index, 'count', e.target.value)} className="w-20" min="1" />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePerformanceItem('scorers', index)}><X className="h-4 w-4 text-destructive"/></Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => addPerformanceItem('scorers')} className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Ajouter un buteur</Button>
                                            </div>
                                            <div>
                                                <Label>Passeurs décisifs</Label>
                                                {newResult.assists.map((assist, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <Select value={assist.playerName} onValueChange={(val) => handlePerformanceChange('assists', index, 'playerName', val)}><SelectTrigger><SelectValue placeholder="Choisir joueur..."/></SelectTrigger><SelectContent>{allPossiblePlayersOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                                                        <Input type="number" value={assist.count} onChange={(e) => handlePerformanceChange('assists', index, 'count', e.target.value)} className="w-20" min="1" />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePerformanceItem('assists', index)}><X className="h-4 w-4 text-destructive"/></Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => addPerformanceItem('assists')} className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Ajouter un passeur</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-2 text-center">{newResult.homeOrAway === 'away' ? clubInfo.name : newResult.opponent}</div>
                                        <div className="space-y-4 p-4 border rounded-md">
                                            <div>
                                                <Label htmlFor="manualOpponentScorers">Buteurs (un par ligne)</Label>
                                                <Textarea id="manualOpponentScorers" value={manualOpponentScorers} onChange={(e) => setManualOpponentScorers(e.target.value)} rows={3} />
                                            </div>
                                            <div>
                                                <Label htmlFor="manualOpponentAssists">Passeurs (un par ligne)</Label>
                                                <Textarea id="manualOpponentAssists" value={manualOpponentAssists} onChange={(e) => setManualOpponentAssists(e.target.value)} rows={3} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="font-semibold mb-2 text-center">{newResult.homeTeam}</div>
                                        <div className="space-y-2 p-4 border rounded-md">
                                            <Label>Buteurs (un par ligne)</Label>
                                            <Textarea value={manualScorers} onChange={e => setManualScorers(e.target.value)} rows={3} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-2 text-center">{newResult.awayTeam}</div>
                                        <div className="space-y-2 p-4 border rounded-md">
                                            <Label>Passeurs (un par ligne)</Label>
                                            <Textarea value={manualAssists} onChange={e => setManualAssists(e.target.value)} rows={3} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={resetForm}>Annuler</Button>
                        <Button type="submit">Sauvegarder</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

       <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
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
                    <SelectValue />
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

        <Tabs defaultValue="club" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="club">Matchs du Club</TabsTrigger>
                <TabsTrigger value="opponents">Matchs des Adversaires</TabsTrigger>
            </TabsList>
            <TabsContent value="club" className="mt-4">
                 <Tabs defaultValue="male" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="male">Masculin</TabsTrigger>
                        <TabsTrigger value="female">Féminin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="male" className="mt-4">
                        {renderResultsView(maleClubResults, 'Masculin')}
                    </TabsContent>
                    <TabsContent value="female" className="mt-4">
                        {renderResultsView(femaleClubResults, 'Féminin')}
                    </TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="opponents" className="mt-4">
                 <Tabs defaultValue="male" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="male">Masculin</TabsTrigger>
                        <TabsTrigger value="female">Féminin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="male" className="mt-4">
                        {renderResultsView(maleOpponentResults, 'Masculin')}
                    </TabsContent>
                    <TabsContent value="female" className="mt-4">
                        {renderResultsView(femaleOpponentResults, 'Féminin')}
                    </TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
        
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
           <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              {selectedResult && (
                <>
                   <DialogTitle className="text-xl text-center mb-2">{getResultTitle(selectedResult)}</DialogTitle>
                    <DialogDescription className="text-center">Score final : <span className="font-bold text-foreground text-lg">{selectedResult.score}</span></DialogDescription>
                </>
              )}
            </DialogHeader>
            {selectedResult && (
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                    <Badge variant="secondary">{selectedResult.category}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-sm text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <strong>Catégorie</strong>
                    </div>
                    <span>{selectedResult.gender === 'Féminin' ? `${selectedResult.teamCategory} F` : selectedResult.teamCategory}</span>
                  </div>
                   <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <strong>Lieu</strong>
                    </div>
                    <span>{selectedResult.location || "Non spécifié"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <strong>Date et Heure</strong>
                     </div>
                     <div className="flex flex-col items-center">
                        <span>{format(parseISO(selectedResult.date), "dd/MM/yyyy")}</span>
                        <span className="text-muted-foreground text-xs">{selectedResult.time}</span>
                     </div>
                  </div>
                </div>
                <Separator />
                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {[teamNames[0], teamNames[1]].map((team, index) => (
                    <div key={`${team}-${index}`} className="space-y-3">
                        <h4 className="font-semibold text-center">{team}</h4>
                        <div>
                            <strong className="text-sm flex items-center gap-2 mb-1"><Trophy className="h-4 w-4 text-muted-foreground" />Buteurs</strong>
                            <p className="text-sm text-muted-foreground pl-2">{formatPerformance(selectedScorersByTeam[team])}</p>
                        </div>
                        <div>
                            <strong className="text-sm flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-muted-foreground" />Passeurs</strong>
                            <p className="text-sm text-muted-foreground pl-2">{formatPerformance(selectedAssistsByTeam[team])}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => openEditDialog(selectedResult!)}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
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
                    <AlertDialogAction onClick={() => handleDelete(selectedResult!.id)}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
