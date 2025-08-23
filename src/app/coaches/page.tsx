
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { coaches as initialCoaches } from "@/lib/data";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function CoachesPage() {
  const [coaches, setCoaches] = useState(initialCoaches);
  const [open, setOpen] = useState(false);

    const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'default';
      case 'Inactif':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const groupedCoaches = coaches.reduce((acc, coach) => {
    const { category } = coach;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(coach);
    return acc;
  }, {} as Record<string, typeof coaches>);

  const handleAddCoach = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logique pour ajouter un entraîneur
    console.log("Nouvel entraîneur ajouté");
    setOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Entraîneurs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un entraîneur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleAddCoach}>
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel entraîneur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" placeholder="Alain Prost" />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie entraînée</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
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
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">Entraîneur Principal</SelectItem>
                      <SelectItem value="adjoint">Entraîneur Adjoint</SelectItem>
                      <SelectItem value="gardiens">Entraîneur des Gardiens</SelectItem>
                      <SelectItem value="physique">Préparateur Physique</SelectItem>
                      <SelectItem value="jeunes">Entraîneur Jeunes</SelectItem>
                      <SelectItem value="analyste">Analyste Vidéo</SelectItem>
                      <SelectItem value="feminines">Entraîneur Féminines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Email</Label>
                  <Input id="contact" placeholder="email@exemple.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="0612345678" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

       {Object.entries(groupedCoaches).map(([category, coachesInCategory]) => (
        <div key={category} className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight mt-6">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coachesInCategory.map((coach) => (
                <Card key={coach.id} className="flex flex-col w-full hover:shadow-lg transition-shadow">
                    <Link href={`/coaches/${coach.id}`} className="flex flex-col h-full flex-grow">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://placehold.co/80x80.png`} alt={coach.name} data-ai-hint="coach photo" />
                                <AvatarFallback>{coach.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-base font-bold">{coach.name}</CardTitle>
                                <CardDescription>{coach.specialization}</CardDescription>
                            </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">{coach.category}</Badge>
                                <Badge variant={getBadgeVariant(coach.status) as any} className="text-xs">{coach.status}</Badge>
                            </div>
                        </CardContent>
                    </Link>
                    <CardFooter className="p-4 pt-0 mt-auto border-t border-border pt-4">
                        <div className="flex w-full justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                            </Button>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                            </Button>
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
