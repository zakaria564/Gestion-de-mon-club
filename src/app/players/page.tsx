
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
import { players as initialPlayers } from "@/lib/data";
import { PlusCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";


export default function PlayersPage() {
    const [players, setPlayers] = useState(initialPlayers);
    const [open, setOpen] = useState(false);

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
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Joueurs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau joueur</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter un nouveau joueur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input id="name" placeholder="Jean Dupont" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthDate" className="text-right">
                  Date de naissance
                </Label>
                <Input id="birthDate" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Adresse
                </Label>
                <Input id="address" placeholder="123 Rue de Paris" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Téléphone
                </Label>
                <Input id="phone" placeholder="0612345678" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="jean@exemple.com" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="poste" className="text-right">
                  Poste
                </Label>
                 <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un poste" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gardien">Gardien</SelectItem>
                        <SelectItem value="defenseur">Défenseur</SelectItem>
                        <SelectItem value="milieu">Milieu</SelectItem>
                        <SelectItem value="attaquant">Attaquant</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Statut
                </Label>
                 <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="blesse">Blessé</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Catégorie
                </Label>
                 <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sénior">Sénior</SelectItem>
                        <SelectItem value="U23">U23</SelectItem>
                        <SelectItem value="U19">U19</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jerseyNumber" className="text-right">
                  Numéro de maillot
                </Label>
                <Input id="jerseyNumber" type="number" placeholder="10" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo" className="text-right">
                  Photo
                </Label>
                <Input id="photo" type="file" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tutorName" className="text-right">
                  Nom du tuteur
                </Label>
                <Input id="tutorName" placeholder="Jacques Dupont" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tutorPhone" className="text-right">
                  Téléphone du tuteur
                </Label>
                <Input id="tutorPhone" placeholder="0611223344" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {Object.entries(groupedPlayers).map(([category, playersInCategory]) => (
        <div key={category} className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight mt-6">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playersInCategory.map((player) => (
              <Link href={`/players/${player.id}`} key={player.id}>
                <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
                      <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold">{player.name}</CardTitle>
                      <CardDescription>{player.poste}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-sm">{player.category}</Badge>
                          <Badge variant={getBadgeVariant(player.status) as any} className="text-sm">{player.status}</Badge>
                      </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            </div>
        </div>
      ))}
    </div>
  );
}
