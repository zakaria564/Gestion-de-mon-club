
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Swords, MoreHorizontal, Users, Shield, Tag, Grip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Player } from "@/lib/data";
import { useOpponentsContext } from "@/context/opponents-context";
import { useTournamentsContext, NewTournament, Tournament } from "@/context/tournaments-context";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { useClubContext } from "@/context/club-context";

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const teamCountOptions = [4, 8, 16, 32];
const tournamentTypes = ['Tournoi', 'Coupe'];

export default function TournamentsPage() {
  const { tournaments, loading, addTournament, deleteTournament } = useTournamentsContext();
  const { opponents, loading: opponentsLoading } = useOpponentsContext();
  const { clubInfo } = useClubContext();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [newTournament, setNewTournament] = useState<NewTournament>({
    name: "",
    type: 'Tournoi',
    teamCategory: 'Sénior',
    gender: 'Masculin',
    numberOfTeams: 8,
    teams: [],
  });

  const handleInputChange = (id: 'name', value: string) => {
    setNewTournament(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (field: 'type' | 'teamCategory' | 'gender' | 'numberOfTeams', value: string | number) => {
    setNewTournament(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamsChange = (values: string[]) => {
    if (values.length > newTournament.numberOfTeams) {
        toast({
            variant: "destructive",
            title: "Trop d'équipes",
            description: `Vous ne pouvez sélectionner que ${newTournament.numberOfTeams} équipes pour ce tournoi.`,
        });
        return;
    }
    setNewTournament(prev => ({ ...prev, teams: values }));
  };

  const resetForm = () => {
    setNewTournament({ name: "", type: 'Tournoi', teamCategory: 'Sénior', gender: 'Masculin', numberOfTeams: 8, teams: [] });
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTournament.teams.length !== newTournament.numberOfTeams) {
        toast({
            variant: "destructive",
            title: "Nombre d'équipes incorrect",
            description: `Veuillez sélectionner exactement ${newTournament.numberOfTeams} équipes.`,
        });
        return;
    }
    await addTournament(newTournament);
    toast({ title: "Tournoi créé", description: "Le nouveau tournoi a été ajouté." });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteTournament(id);
    toast({ variant: "destructive", title: "Tournoi supprimé", description: "Le tournoi a été supprimé." });
  };
  
  const opponentOptions = useMemo((): MultiSelectOption[] => {
    const filtered = opponents.filter(o => o.gender === newTournament.gender);
    return [
      { value: clubInfo.name, label: clubInfo.name },
      ...filtered.map(o => ({ value: o.name, label: o.name }))
    ];
  }, [opponents, newTournament.gender, clubInfo.name]);

  const isLoading = loading || opponentsLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Swords /> Gestion des Tournois
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Button>
              <PlusCircle className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Créer un tournoi</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Créer un nouveau tournoi</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour organiser un nouveau tournoi ou une coupe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom du tournoi/coupe</Label>
                  <Input id="name" placeholder="ex: Coupe d'été U19" value={newTournament.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select onValueChange={(v) => handleSelectChange('type', v)} value={newTournament.type} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {tournamentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="numberOfTeams">Nombre d'équipes</Label>
                        <Select onValueChange={(v) => handleSelectChange('numberOfTeams', parseInt(v))} value={newTournament.numberOfTeams.toString()} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {teamCountOptions.map(num => <SelectItem key={num} value={num.toString()}>{num}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="teamCategory">Catégorie</Label>
                        <Select onValueChange={(v) => handleSelectChange('teamCategory', v)} value={newTournament.teamCategory} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Genre</Label>
                        <Select onValueChange={(v) => handleSelectChange('gender', v as 'Masculin' | 'Féminin')} value={newTournament.gender} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Masculin">Masculin</SelectItem>
                                <SelectItem value="Féminin">Féminin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="teams">Équipes ({newTournament.teams.length}/{newTournament.numberOfTeams})</Label>
                    <MultiSelect
                        options={opponentOptions}
                        value={newTournament.teams}
                        onChange={handleTeamsChange}
                        placeholder="Sélectionner les équipes..."
                    />
                 </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={resetForm}>Annuler</Button>
                <Button type="submit">Créer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
              <CardFooter className="justify-end">
                <Skeleton className="h-8 w-8" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Swords className="h-5 w-5" />{tournament.name}</CardTitle>
                <CardDescription>{tournament.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Grip className="h-4 w-4" />
                    <span>{tournament.gender === 'Féminin' ? `${tournament.teamCategory} F` : tournament.teamCategory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{tournament.numberOfTeams} équipes</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                        {tournament.teams.map(team => <Badge key={team} variant="secondary" className="text-xs">{team}</Badge>)}
                    </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
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
                            Cette action est irréversible. Voulez-vous vraiment supprimer ce tournoi ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(tournament.id)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Aucun tournoi créé pour le moment. Cliquez sur "Créer un tournoi" pour commencer.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
