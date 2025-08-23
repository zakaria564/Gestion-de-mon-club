
"use client";

import { useState, useContext } from "react";
import React from 'react';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coach } from "@/lib/data";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CoachesContext } from "@/context/coaches-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";


const emptyCoach: Omit<Coach, 'id'> = {
    name: '',
    specialization: 'Entraîneur Principal',
    status: 'Actif',
    contact: '',
    category: 'Sénior',
    phone: '',
    photo: '',
};

export default function CoachesPage() {
  const context = useContext(CoachesContext);
  
  if (!context) {
    throw new Error("CoachesPage must be used within a CoachesProvider");
  }

  const { coaches, loading, addCoach } = context;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Omit<Coach, 'id'>>(emptyCoach);


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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSelectedCoach(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedCoach(prev => ({...prev, photo: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (name: keyof Omit<Coach, 'id'>, value: string) => {
    setSelectedCoach(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOpenDialog = () => {
    setSelectedCoach(emptyCoach);
    setDialogOpen(true);
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addCoach(selectedCoach);
    setDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Entraîneurs</h2>
        
        <Button onClick={handleOpenDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un entraîneur
        </Button>
        
      </div>

       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Ajouter un entraîneur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 pr-6 -mr-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input id="name" placeholder="Alain Prost" value={selectedCoach.name} onChange={handleInputChange} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Catégorie entraînée</Label>
                        <Select onValueChange={(value) => handleSelectChange('category', value)} value={selectedCoach.category} required>
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
                        <Select onValueChange={(value) => handleSelectChange('specialization', value)} value={selectedCoach.specialization} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une spécialité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entraîneur Principal">Entraîneur Principal</SelectItem>
                            <SelectItem value="Entraîneur Adjoint">Entraîneur Adjoint</SelectItem>
                            <SelectItem value="Entraîneur des Gardiens">Entraîneur des Gardiens</SelectItem>
                            <SelectItem value="Préparateur Physique">Préparateur Physique</SelectItem>
                            <SelectItem value="Entraîneur Jeunes">Entraîneur Jeunes</SelectItem>
                            <SelectItem value="Analyste Vidéo">Analyste Vidéo</SelectItem>
                            <SelectItem value="Entraîneur Féminines">Entraîneur Féminines</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Statut</Label>
                        <Select onValueChange={(value) => handleSelectChange('status', value)} value={selectedCoach.status} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Actif">Actif</SelectItem>
                            <SelectItem value="Inactif">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact">Email</Label>
                        <Input id="contact" placeholder="email@exemple.com" value={selectedCoach.contact} onChange={handleInputChange} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" placeholder="0612345678" value={selectedCoach.phone} onChange={handleInputChange} required />
                      </div>
                      <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="photo">Photo</Label>
                          <Input id="photo" type="file" onChange={handleFileChange} accept="image/*" />
                          { selectedCoach.photo && (
                            <Avatar className="h-20 w-20 mt-2">
                              <AvatarImage src={selectedCoach.photo as string} alt="Aperçu" />
                              <AvatarFallback>??</AvatarFallback>
                            </Avatar>
                          )}
                      </div>
                    </div>
                  </ScrollArea>
                <DialogFooter className="pt-4 border-t">
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
       Object.entries(groupedCoaches).map(([category, coachesInCategory]) => (
        <div key={category} className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight mt-6">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coachesInCategory.map((coach) => (
                <Link key={coach.id} href={`/coaches/${coach.id}`} className="flex flex-col h-full">
                    <Card className="flex flex-col w-full hover:shadow-lg transition-shadow h-full">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={coach.photo} alt={coach.name} data-ai-hint="coach photo" />
                                <AvatarFallback>{coach.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-base font-bold">{coach.name}</CardTitle>
                                <CardDescription>{coach.specialization}</CardDescription>
                            </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-xs">{coach.category}</Badge>
                                <Badge variant={getBadgeVariant(coach.status) as any} className="text-xs">{coach.status}</Badge>
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
