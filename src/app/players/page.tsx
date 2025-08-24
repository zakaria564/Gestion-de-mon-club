
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import React from 'react';
import { usePlayersContext } from "@/context/players-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const emptyPlayer: Omit<Player, 'id' | 'uid'> = {
    name: '',
    birthDate: '',
    address: '',
    poste: 'Milieu Central',
    status: 'Actif',
    phone: '',
    email: '',
    tutorName: '',
    tutorPhone: '',
    photo: '',
    jerseyNumber: 0,
    category: 'Sénior'
};

export default function PlayersPage() {
    const context = usePlayersContext();
    const { toast } = useToast();
    
    if (!context) {
      throw new Error("PlayersPage must be used within a PlayersProvider");
    }

    const { players, loading, addPlayer } = context;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Omit<Player, 'id' | 'uid'>>(emptyPlayer);


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

  const groupedPlayers = players.reduce((acc, player) => {
    const { category } = player;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(player);
    return acc;
  }, {} as Record<string, typeof players>);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setSelectedPlayer(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value, 10) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPlayer(prev => ({...prev, photo: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSelectChange = (name: keyof Omit<Player, 'id' | 'uid'>, value: string) => {
    setSelectedPlayer(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = () => {
    setSelectedPlayer(emptyPlayer);
    setDialogOpen(true);
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    
    await addPlayer({ ...selectedPlayer, jerseyNumber });
    setDialogOpen(false);
  };
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Joueurs</h2>
        <Button onClick={handleOpenDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur
        </Button>
      </div>

       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Ajouter un joueur</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto -mr-6 pr-6">
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
              <DialogFooter className="pt-4 border-t -mx-6 px-6 bg-background sticky bottom-0">
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      
      {loading ? (
        Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-8 w-32 mt-6" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <Card key={cardIndex}>
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-5 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
      Object.entries(groupedPlayers).map(([category, playersInCategory]) => (
        <div key={category} className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight mt-6">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playersInCategory.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="flex flex-col h-full">
                    <Card className="flex flex-col w-full hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
                                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-base font-bold">{player.name}</CardTitle>
                                <CardDescription>{player.poste}</CardDescription>
                            </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">{player.category}</Badge>
                                <Badge variant={getBadgeVariant(player.status) as any} className="text-xs">{player.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            </div>
        </div>
      )))}
    </div>
  );
}

    