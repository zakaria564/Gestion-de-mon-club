
'use client';

import { useMemo, useState, useContext, useEffect } from 'react';
import React from 'react';
import { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Mail, Phone, UserCheck, UserCircle, MapPin, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

export function PlayerDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const context = usePlayersContext();

  if (!context) {
    throw new Error("PlayerDetailClient must be used within a PlayersProvider");
  }

  const { loading, updatePlayer, deletePlayer, getPlayerById } = context;

  const [dialogOpen, setDialogOpen] = useState(false);

  const player = useMemo(() => getPlayerById(id), [id, getPlayerById]);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (player) {
      setSelectedPlayer({
        ...player,
        birthDate: player.birthDate ? format(parseISO(player.birthDate), 'yyyy-MM-dd') : ''
      });
    }
  }, [player]);

  if (loading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <div className="flex flex-wrap gap-2 mt-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!player) {
    return notFound();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setSelectedPlayer(prev => prev ? ({ ...prev, [id]: type === 'number' ? parseInt(value, 10) || 0 : value }) : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPlayer(prev => prev ? ({...prev, photo: reader.result as string}) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (name: keyof Player, value: string) => {
    setSelectedPlayer(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleOpenDialog = () => {
    if (player) {
        setSelectedPlayer({
            ...player,
            birthDate: player.birthDate ? format(parseISO(player.birthDate), 'yyyy-MM-dd') : ''
        });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlayer) return;

    const jerseyNumberValue = (event.target as any).jerseyNumber.value;
    const jerseyNumber = jerseyNumberValue ? parseInt(jerseyNumberValue, 10) : 0;
    
    if (jerseyNumberValue && (isNaN(jerseyNumber) || jerseyNumber <= 0)) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Veuillez entrer un numéro de maillot valide (nombre positif) ou laisser le champ vide.",
      });
      return;
    }
    
    const { id, ...dataToUpdate } = { ...selectedPlayer, jerseyNumber };
    await updatePlayer({ id, ...dataToUpdate } as Player);
    setDialogOpen(false);
  };

  const handleDeletePlayer = async () => {
    if (typeof id === 'string') {
        router.push('/players');
        await deletePlayer(id);
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'default';
      case 'Blessé':
        return 'destructive';
      case 'Suspendu':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const formattedBirthDate = player.birthDate ? format(parseISO(player.birthDate), 'dd/MM/yyyy') : 'N/A';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/players" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des joueurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={player.photo || undefined} alt={player.name} data-ai-hint="player photo" />
            <AvatarFallback className="text-4xl">{player.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">{player.poste}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(player.status) as any}>{player.status}</Badge>
              <Badge variant="secondary">{player.category}</Badge>
              {player.jerseyNumber && <Badge variant="outline">Maillot n°{player.jerseyNumber}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                <div className="flex items-center gap-4">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span>{player.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedBirthDate}</span>
                </div>
                <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{player.address}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${player.email}`} className="hover:underline">{player.email}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.phone}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Tuteur Légal</h3>
                 <div className="flex items-center gap-4">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                    <span>{player.tutorName}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.tutorPhone}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={handleOpenDialog}>
                <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera définitivement le joueur.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePlayer}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Modifier un joueur</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto -mr-6 pr-6">
                {selectedPlayer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
                    <div className="md:col-span-2">
                        <h4 className="font-medium text-lg mb-4 pt-4 border-b pb-2">Informations Personnelles</h4>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" placeholder="Jean Dupont" value={selectedPlayer.name} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="birthDate">Date de naissance</Label>
                        <Input id="birthDate" type="date" value={selectedPlayer.birthDate} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" placeholder="123 Rue de Paris" value={selectedPlayer.address} onChange={handleInputChange} required />
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-medium text-lg mb-4 pt-4 border-b pb-2">Informations Sportives</h4>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Select onValueChange={(value) => handleSelectChange('category', value)} value={selectedPlayer.category} required>
                          <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Sénior">Sénior</SelectItem>
                              <SelectItem value="U23">U23</SelectItem>
                              <SelectItem value="U19">U19</SelectItem>
                              <SelectItem value="U18">U18</SelectItem>
                              <SelectItem value="U17">U17</SelectItem>
                              <SelectItem value="U16">U16</SelectItem>
                              <SelectItem value="U15">U15</SelectItem>
                              <SelectItem value="U13">U13</SelectItem>
                              <SelectItem value="U11">U11</SelectItem>
                              <SelectItem value="U9">U9</SelectItem>
                              <SelectItem value="U7">U7</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="poste">Poste</Label>
                      <Select onValueChange={(value) => handleSelectChange('poste', value)} value={selectedPlayer.poste} required>
                          <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Gardien">Gardien</SelectItem>
                              <SelectItem value="Défenseur Central">Défenseur Central</SelectItem>
                              <SelectItem value="Latéral Droit">Latéral Droit</SelectItem>
                              <SelectItem value="Latéral Gauche">Latéral Gauche</SelectItem>
                              <SelectItem value="Milieu Défensif">Milieu Défensif</SelectItem>
                              <SelectItem value="Milieu Central">Milieu Central</SelectItem>
                              <SelectItem value="Milieu Offensif">Milieu Offensif</SelectItem>
                              <SelectItem value="Ailier Droit">Ailier Droit</SelectItem>
                              <SelectItem value="Ailier Gauche">Ailier Gauche</SelectItem>
                              <SelectItem value="Avant-centre">Avant-centre</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Statut</Label>
                      <Select onValueChange={(value) => handleSelectChange('status', value)} value={selectedPlayer.status} required>
                          <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Actif">Actif</SelectItem>
                              <SelectItem value="Blessé">Blessé</SelectItem>
                              <SelectItem value="Suspendu">Suspendu</SelectItem>
                              <SelectItem value="Inactif">Inactif</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="jerseyNumber">Numéro de maillot</Label>
                      <Input id="jerseyNumber" type="number" placeholder="10" value={selectedPlayer.jerseyNumber || ''} onChange={handleInputChange} />
                    </div>

                     <div className="md:col-span-2">
                        <h4 className="font-medium text-lg mb-4 pt-4 border-b pb-2">Contact</h4>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" placeholder="0612345678" value={selectedPlayer.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="jean@exemple.com" value={selectedPlayer.email} onChange={handleInputChange} required />
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="font-medium text-lg mb-4 pt-4 border-b pb-2">Tuteur Légal (si mineur)</h4>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tutorName">Nom du tuteur</Label>
                        <Input id="tutorName" placeholder="Jacques Dupont" value={selectedPlayer.tutorName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tutorPhone">Téléphone du tuteur</Label>                            
                        <Input id="tutorPhone" placeholder="0611223344" value={selectedPlayer.tutorPhone} onChange={handleInputChange} />
                    </div>
                    
                    <div className="grid gap-2 md:col-span-2 pt-4 border-t mt-4">
                        <Label htmlFor="photo">Photo</Label>
                        <Input id="photo" type="file" onChange={handleFileChange} accept="image/*" />
                        { selectedPlayer.photo && (
                        <Avatar className="h-20 w-20 mt-2">
                            <AvatarImage src={selectedPlayer.photo as string} alt="Aperçu" />
                            <AvatarFallback>??</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                  </div>
                )}
              <DialogFooter className="pt-4 border-t -mx-6 px-6 bg-background sticky bottom-0">
                  <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}

    