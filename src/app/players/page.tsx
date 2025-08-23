
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { players as initialPlayers, Player } from "@/lib/data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const emptyPlayer: Omit<Player, 'id'> = {
    name: '',
    birthDate: '',
    address: '',
    poste: '',
    status: 'Actif',
    phone: '',
    email: '',
    tutorName: '',
    tutorPhone: '',
    photo: '',
    jerseyNumber: 0,
    category: ''
};

export default function PlayersPage() {
    const [players, setPlayers] = useState(initialPlayers);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Omit<Player, 'id'> | Player>(emptyPlayer);


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
    setSelectedPlayer(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value, 10) : value }));
  };
  
  const handleSelectChange = (name: keyof Player, value: string) => {
    setSelectedPlayer(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (player?: Player) => {
    if (player) {
        setIsEditing(true);
        setSelectedPlayer(player);
    } else {
        setIsEditing(false);
        setSelectedPlayer(emptyPlayer);
    }
    setDialogOpen(true);
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing && 'id' in selectedPlayer) {
        setPlayers(players.map(p => p.id === selectedPlayer.id ? selectedPlayer as Player : p));
    } else {
        const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
        setPlayers([...players, { id: newId, ...selectedPlayer as Omit<Player, 'id'> }]);
    }
    setDialogOpen(false);
  };
  
  const handleDeletePlayer = (playerId: number) => {
    setPlayers(players.filter(p => p.id !== playerId));
  }
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Joueurs</h2>
        <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur
        </Button>
      </div>

       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-4xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un joueur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <h4 className="font-medium text-lg">Informations Personnelles</h4>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" placeholder="Jean Dupont" value={selectedPlayer.name} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="birthDate">Date de naissance</Label>
                        <Input id="birthDate" type="date" value={selectedPlayer.birthDate} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" placeholder="123 Rue de Paris" value={selectedPlayer.address} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="photo">Photo URL</Label>
                        <Input id="photo" placeholder="https://placehold.co/40x40.png" value={selectedPlayer.photo} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-lg">Informations Sportives</h4>
                    <div className="grid grid-cols-2 gap-4">
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
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                            <Label htmlFor="jerseyNumber">Numéro de maillot</Label>
                            <Input id="jerseyNumber" type="number" placeholder="10" value={selectedPlayer.jerseyNumber || ''} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-lg">Contact</h4>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" placeholder="0612345678" value={selectedPlayer.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="jean@exemple.com" value={selectedPlayer.email} onChange={handleInputChange} required />
                    </div>
                </div>
                 <div className="space-y-4">
                    <h4 className="font-medium text-lg">Tuteur Légal</h4>
                    <div className="grid gap-2">
                        <Label htmlFor="tutorName">Nom du tuteur</Label>
                        <Input id="tutorName" placeholder="Jacques Dupont" value={selectedPlayer.tutorName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tutorPhone">Téléphone du tuteur</Label>
                        <Input id="tutorPhone" placeholder="0611223344" value={selectedPlayer.tutorPhone} onChange={handleInputChange} />
                    </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      
      {Object.entries(groupedPlayers).map(([category, playersInCategory]) => (
        <div key={category} className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight mt-6">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playersInCategory.map((player) => (
                <Card key={player.id} className="flex flex-col w-full hover:shadow-lg transition-shadow">
                    <Link href={`/players/${player.id}`} className="flex flex-col h-full flex-grow">
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
                        <CardContent className="p-4 pt-0">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">{player.category}</Badge>
                                <Badge variant={getBadgeVariant(player.status) as any} className="text-xs">{player.status}</Badge>
                            </div>
                        </CardContent>
                    </Link>
                    <CardFooter className="p-4 pt-0 mt-auto border-t border-border pt-4">
                        <div className="flex w-full justify-end gap-2">
                             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(player)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Supprimer</span>
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
                                    <AlertDialogAction onClick={() => handleDeletePlayer(player.id)}>Supprimer</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardFooter>
                </Card>
            ))}
            </div>
        </div>
      ))}
    </div>
  );
}
