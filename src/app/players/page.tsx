
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
import { PlusCircle, Camera } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import React from 'react';
import { usePlayersContext } from "@/context/players-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";


const playerSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  address: z.string().min(1, "L'adresse est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  poste: z.string().min(1, "Le poste est requis."),
  jerseyNumber: z.coerce.number().min(1, "Le numéro de maillot doit être supérieur à 0."),
  notes: z.string().optional(),
  photo: z.string().optional(),
  country: z.string().min(1, "Le pays est requis."),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.enum(['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7']),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const defaultValues: PlayerFormValues = {
    name: '',
    birthDate: '',
    address: '',
    phone: '',
    country: '',
    poste: 'Milieu Central',
    jerseyNumber: 10,
    notes: '',
    photo: '',
    tutorName: '',
    tutorPhone: '',
    status: 'Actif',
    category: 'Sénior',
};

export default function PlayersPage() {
    const context = usePlayersContext();
    const { toast } = useToast();
    
    if (!context) {
      throw new Error("PlayersPage must be used within a PlayersProvider");
    }

    const { players, loading, addPlayer } = context;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<PlayerFormValues>({
      resolver: zodResolver(playerSchema),
      defaultValues,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          form.setValue('photo', result);
          setPhotoPreview(result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    const onSubmit = async (data: PlayerFormValues) => {
      await addPlayer(data as any);
      setDialogOpen(false);
      toast({ title: "Joueur ajouté", description: "Le nouveau joueur a été ajouté avec succès." });
    };

    useEffect(() => {
        if (!dialogOpen) {
            form.reset(defaultValues);
            setPhotoPreview(null);
        }
    }, [dialogOpen, form]);

    const getBadgeVariant = (status: string) => {
      switch (status) {
        case 'Actif': return 'default';
        case 'Blessé': return 'destructive';
        case 'Suspendu': return 'secondary';
        default: return 'outline';
      }
    };

    const groupedPlayers = players.reduce((acc, player) => {
      const category = (player as any).category || 'Sénior';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(player);
      return acc;
    }, {} as Record<string, Player[]>);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Joueurs</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                  <DialogTitle>Ajouter un joueur</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du nouveau joueur ci-dessous.
                  </DialogDescription>
              </DialogHeader>
               <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 pr-6 -mr-6">
                    <div className="space-y-6 py-4 px-1">
                       <FormField
                          control={form.control}
                          name="photo"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center gap-4">
                              <FormLabel htmlFor="photo-upload">
                                <Avatar className="h-24 w-24 border-2 border-dashed hover:border-primary cursor-pointer">
                                  <AvatarImage src={photoPreview ?? undefined} alt="Aperçu du joueur" data-ai-hint="player photo"/>
                                  <AvatarFallback className="bg-muted">
                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                              </FormLabel>
                              <FormControl>
                                <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <div className="space-y-4">
                            <h4 className="text-lg font-medium">Informations Personnelles</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nom complet</FormLabel>
                                      <FormControl>
                                        <Input placeholder="ex: Jean Dupont" {...field} required />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="birthDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Date de naissance</FormLabel>
                                      <FormControl>
                                        <Input type="date" {...field} required />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                      <FormItem className="md:col-span-2">
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl>
                                          <Input placeholder="ex: 123 Rue de la Victoire" {...field} required />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pays</FormLabel>
                                        <FormControl>
                                        <Input placeholder="ex: France" {...field} required />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-lg font-medium">Informations Sportives</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="poste"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Poste</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un poste" />
                                          </SelectTrigger>
                                        </FormControl>
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
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="jerseyNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Numéro de maillot</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="ex: 10" {...field} required />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-lg font-medium">Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Téléphone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="ex: 0612345678" {...field} required />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium">Tuteur Légal (si mineur)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField
                                  control={form.control}
                                  name="tutorName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nom du tuteur</FormLabel>
                                      <FormControl>
                                        <Input placeholder="ex: Marie Dupont" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="tutorPhone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Téléphone du tuteur</FormLabel>
                                      <FormControl>
                                        <Input placeholder="ex: 0712345678" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ajouter des notes sur le joueur (style de jeu, comportement, etc.)"
                                  className="resize-y min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                  </ScrollArea>
                  <DialogFooter className="pt-4 border-t">
                      <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Annuler</Button>
                      <Button type="submit">Enregistrer</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
            </Dialog>
        </div>

        {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight mt-6">
                    <Skeleton className="h-8 w-32" />
                </h3>
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
                                    <Badge variant="outline" className="text-xs">{(player as any).category || 'Sénior'}</Badge>
                                    <Badge variant={getBadgeVariant((player as any).status || 'Actif') as any} className="text-xs">{(player as any).status || 'Actif'}</Badge>
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
