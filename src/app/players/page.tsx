
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
import { useState } from "react";
import React from 'react';
import { usePlayersContext } from "@/context/players-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const playerSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  address: z.string().min(1, "L'adresse est requise."),
  poste: z.string().min(1, "Le poste est requis."),
  status: z.string().min(1, "Le statut est requis."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("Email invalide."),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  photo: z.string().optional(),
  jerseyNumber: z.coerce.number().positive("Le numéro de maillot doit être positif.").optional().or(z.literal(0)),
  category: z.string().min(1, "La catégorie est requise."),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const defaultValues: Partial<PlayerFormValues> = {
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

    const form = useForm<PlayerFormValues>({
      resolver: zodResolver(playerSchema),
      defaultValues,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
      await addPlayer({ ...data, jerseyNumber: data.jerseyNumber || 0 });
      setDialogOpen(false);
      form.reset(defaultValues);
      setPhotoPreview(null);
      toast({ title: "Joueur ajouté", description: "Le nouveau joueur a été ajouté avec succès." });
    };

    const getBadgeVariant = (status: string) => {
      switch (status) {
        case 'Actif': return 'default';
        case 'Blessé': return 'destructive';
        case 'Suspendu': return 'secondary';
        default: return 'outline';
      }
    };

    const groupedPlayers = players.reduce((acc, player) => {
      const { category } = player;
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
            <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset(defaultValues);
                    setPhotoPreview(null);
                }
                setDialogOpen(isOpen);
            }}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Ajouter un joueur</DialogTitle>
                    <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full pr-6 -mr-6">
                            <div className="space-y-4 py-4">
                                
                                <h4 className="font-medium text-lg mb-2 pb-2 border-b">Informations Personnelles</h4>
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input placeholder="Jean Dupont" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="birthDate" render={({ field }) => (
                                    <FormItem><FormLabel>Date de naissance</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="address" render={({ field }) => (
                                    <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input placeholder="123 Rue de Paris" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />

                                <h4 className="font-medium text-lg mt-6 mb-2 pb-2 border-b">Informations Sportives</h4>
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Sénior">Sénior</SelectItem><SelectItem value="U23">U23</SelectItem><SelectItem value="U19">U19</SelectItem><SelectItem value="U18">U18</SelectItem><SelectItem value="U17">U17</SelectItem><SelectItem value="U16">U16</SelectItem><SelectItem value="U15">U15</SelectItem><SelectItem value="U13">U13</SelectItem><SelectItem value="U11">U11</SelectItem><SelectItem value="U9">U9</SelectItem><SelectItem value="U7">U7</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="poste" render={({ field }) => (
                                    <FormItem><FormLabel>Poste</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Gardien">Gardien</SelectItem><SelectItem value="Défenseur Central">Défenseur Central</SelectItem><SelectItem value="Latéral Droit">Latéral Droit</SelectItem><SelectItem value="Latéral Gauche">Latéral Gauche</SelectItem><SelectItem value="Milieu Défensif">Milieu Défensif</SelectItem><SelectItem value="Milieu Central">Milieu Central</SelectItem><SelectItem value="Milieu Offensif">Milieu Offensif</SelectItem><SelectItem value="Ailier Droit">Ailier Droit</SelectItem><SelectItem value="Ailier Gauche">Ailier Gauche</SelectItem><SelectItem value="Avant-centre">Avant-centre</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Statut</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Blessé">Blessé</SelectItem><SelectItem value="Suspendu">Suspendu</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="jerseyNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Numéro de maillot</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />

                                <h4 className="font-medium text-lg mt-6 mb-2 pb-2 border-b">Contact</h4>
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input placeholder="0612345678" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="jean@exemple.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />

                                <h4 className="font-medium text-lg mt-6 mb-2 pb-2 border-b">Tuteur Légal (si mineur)</h4>
                                <FormField control={form.control} name="tutorName" render={({ field }) => (
                                    <FormItem><FormLabel>Nom du tuteur</FormLabel><FormControl><Input placeholder="Jacques Dupont" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="tutorPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Téléphone du tuteur</FormLabel><FormControl><Input placeholder="0611223344" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />

                                <div className="pt-4 mt-4 border-t">
                                    <FormLabel>Photo</FormLabel>
                                    <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                                    <FormMessage />
                                    {photoPreview && (
                                        <Avatar className="h-20 w-20 mt-2">
                                            <AvatarImage src={photoPreview} alt="Aperçu" />
                                            <AvatarFallback>??</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-4 mt-4 border-t -mx-6 px-6 bg-background">
                            <Button type="submit">Sauvegarder</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>

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

    