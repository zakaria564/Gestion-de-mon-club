
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
import type { Player } from "@/lib/data";
import { PlusCircle, Camera, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import React from 'react';
import { usePlayersContext } from "@/context/players-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";


const playerSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide.").optional().or(z.literal('')),
  address: z.string().min(1, "L'adresse est requise."),
  country: z.string().min(1, "Le pays est requis."),
  poste: z.string().min(1, "Le poste est requis."),
  jerseyNumber: z.coerce.number().min(1, "Le numéro de maillot doit être supérieur à 0."),
  photo: z.string().url("Veuillez entrer une URL valide.").optional().or(z.literal('')),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  tutorEmail: z.string().email("L'adresse email du tuteur est invalide.").optional().or(z.literal('')),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.enum(['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7']),
  entryDate: z.string().optional(),
  exitDate: z.string().optional(),
  medicalCertificateUrl: z.string().url("URL de certificat invalide.").optional().or(z.literal('')),
  medicalCertificateExpiration: z.string().optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const defaultValues: PlayerFormValues = {
    name: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    country: '',
    poste: 'Milieu Central',
    jerseyNumber: 10,
    photo: '',
    tutorName: '',
    tutorPhone: '',
    tutorEmail: '',
    status: 'Actif',
    category: 'Sénior',
    entryDate: '',
    exitDate: '',
    medicalCertificateUrl: '',
    medicalCertificateExpiration: '',
};

export default function PlayersPage() {
    const context = usePlayersContext();
    const { toast } = useToast();
    
    if (!context) {
      throw new Error("PlayersPage must be used within a PlayersProvider");
    }

    const { players, loading, addPlayer, updatePlayer } = context;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterKey, setFilterKey] = useState("name");

    const form = useForm<PlayerFormValues>({
      resolver: zodResolver(playerSchema),
      defaultValues,
    });
    
    const onSubmit = async (data: PlayerFormValues) => {
      await addPlayer(data);
      setDialogOpen(false);
      toast({ title: "Joueur ajouté", description: "Le nouveau joueur a été ajouté avec succès." });
    };

    useEffect(() => {
        if (!dialogOpen) {
            form.reset(defaultValues);
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
    
    const getCategoryStyle = (category: string): { color: string; borderColor: string } => {
        switch (category) {
            case 'Sénior': return { color: 'text-red-600 dark:text-red-400', borderColor: 'border-red-600 dark:border-red-400' };
            case 'U23': return { color: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-600 dark:border-blue-400' };
            case 'U19': return { color: 'text-green-600 dark:text-green-400', borderColor: 'border-green-600 dark:border-green-400' };
            case 'U18': return { color: 'text-yellow-600 dark:text-yellow-400', borderColor: 'border-yellow-600 dark:border-yellow-400' };
            case 'U17': return { color: 'text-purple-600 dark:text-purple-400', borderColor: 'border-purple-600 dark:border-purple-400' };
            case 'U16': return { color: 'text-pink-600 dark:text-pink-400', borderColor: 'border-pink-600 dark:border-pink-400' };
            case 'U15': return { color: 'text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-600 dark:border-indigo-400' };
            case 'U13': return { color: 'text-teal-600 dark:text-teal-400', borderColor: 'border-teal-600 dark:border-teal-400' };
            case 'U11': return { color: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-600 dark:border-orange-400' };
            case 'U9': return { color: 'text-cyan-600 dark:text-cyan-400', borderColor: 'border-cyan-600 dark:border-cyan-400' };
            case 'U7': return { color: 'text-lime-600 dark:text-lime-400', borderColor: 'border-lime-600 dark:border-lime-400' };
            default: return { color: 'text-gray-600 dark:text-gray-400', borderColor: 'border-gray-600 dark:border-gray-400' };
        }
    };

    const handleStatusChange = async (player: Player, newStatus: string) => {
      if (player.status !== newStatus) {
          const updatedPlayer = { ...player, status: newStatus as Player['status'] };
          await updatePlayer(updatedPlayer);
          toast({
              title: "Statut mis à jour",
              description: `Le statut de ${player.name} est maintenant ${newStatus}.`
          });
      }
    };

    const filteredPlayers = useMemo(() => {
        if (!searchQuery) return players;
        return players.filter(player => {
            const value = player[filterKey as keyof Player] as string;
            return value?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [players, searchQuery, filterKey]);


    const groupedPlayers = useMemo(() => {
        return filteredPlayers.reduce((acc, player) => {
            const category = player.category || 'Sénior';
            const poste = player.poste || 'Non défini';

            if (!acc[category]) {
                acc[category] = {};
            }
            if (!acc[category][poste]) {
                acc[category][poste] = [];
            }
            acc[category][poste].push(player);
            return acc;
        }, {} as Record<string, Record<string, Player[]>>);
    }, [filteredPlayers]);


    const photoPreview = form.watch('photo');

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
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto pr-6 -mr-6">
                        <div className="space-y-6 py-4 px-1">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={photoPreview || undefined} alt="Aperçu du joueur" data-ai-hint="player photo"/>
                                <AvatarFallback className="bg-muted">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                            <FormField
                                control={form.control}
                                name="photo"
                                render={({ field }) => (
                                <FormItem className="w-full max-w-sm">
                                    <FormLabel>URL de la photo</FormLabel>
                                    <FormControl>
                                    <Input type="text" placeholder="https://example.com/photo.jpg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-lg font-medium border-b pb-2">Informations Personnelles</h4>
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
                                    <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="ex: email@exemple.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                        <FormItem>
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

                                <div className="space-y-4">
                                    <h4 className="text-lg font-medium border-b pb-2">Tuteur Légal (si mineur)</h4>
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
                                    <FormField
                                    control={form.control}
                                    name="tutorEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Email du tuteur</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="ex: tuteur@exemple.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-lg font-medium border-b pb-2">Informations Médicales</h4>
                                <FormField
                                    control={form.control}
                                    name="medicalCertificateUrl"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL du Certificat Médical</FormLabel>
                                        <FormControl>
                                        <Input type="text" placeholder="https://example.com/certificat.pdf" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="medicalCertificateExpiration"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d'expiration du certificat</FormLabel>
                                        <FormControl>
                                        <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-lg font-medium border-b pb-2">Informations Sportives</h4>
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
                                    <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Statut</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                            <SelectItem value="Actif">Actif</SelectItem>
                                            <SelectItem value="Blessé">Blessé</SelectItem>
                                            <SelectItem value="Suspendu">Suspendu</SelectItem>
                                            <SelectItem value="Inactif">Inactif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Catégorie</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger></FormControl>
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
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="entryDate"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date d'entrée au club</FormLabel>
                                            <FormControl>
                                            <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="exitDate"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de sortie du club</FormLabel>
                                            <FormControl>
                                            <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background">
                        <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
              </Form>
            </DialogContent>
            </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
            <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder={`Rechercher par ${filterKey === 'name' ? 'nom' : filterKey}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm md:text-base"
                />
            </div>
            <Select value={filterKey} onValueChange={setFilterKey}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="poste">Poste</SelectItem>
                    <SelectItem value="category">Catégorie</SelectItem>
                    <SelectItem value="status">Statut</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-4">
                    <Skeleton className="h-8 w-48 mt-6" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ))
        ) : Object.keys(groupedPlayers).length > 0 ? (
            <Accordion type="multiple" className="w-full space-y-4">
                {Object.entries(groupedPlayers).map(([category, postes]) => (
                    <AccordionItem value={category} key={category} className="border rounded-lg">
                         <AccordionTrigger className="px-4 py-2 text-xl font-bold hover:no-underline">
                            <span className={getCategoryStyle(category).color}>{category}</span>
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                            <Accordion type="multiple" className="w-full space-y-2">
                                {Object.entries(postes).map(([poste, playersInPoste]) => (
                                    <AccordionItem value={`${category}-${poste}`} key={`${category}-${poste}`} className="border rounded-md">
                                        <AccordionTrigger className="px-4 text-base font-semibold hover:no-underline">
                                            {playersInPoste.length === 1
                                              ? `${poste}: ${playersInPoste[0].name}`
                                              : `${poste} (${playersInPoste.length} joueur${playersInPoste.length > 1 ? 's' : ''})`
                                            }
                                        </AccordionTrigger>
                                        <AccordionContent className="p-2">
                                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                {playersInPoste.map((player) => (
                                                    <Card key={player.id} className="flex flex-col w-full hover:shadow-lg transition-shadow h-full group">
                                                        <Link href={`/players/${player.id}`} className="flex flex-col h-full">
                                                            <CardHeader className="p-4">
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="h-16 w-16">
                                                                        <AvatarImage src={player.photo ?? undefined} alt={player.name} data-ai-hint="player photo" />
                                                                        <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1">
                                                                        <CardTitle className="text-base font-bold">{player.name}</CardTitle>
                                                                        <CardDescription>{player.poste}</CardDescription>
                                                                    </div>
                                                                </div>
                                                            </CardHeader>
                                                        </Link>
                                                        <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                                                            <div className="flex justify-between items-center">
                                                                <Badge variant="outline" className="text-xs">{player.category || 'Sénior'}</Badge>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                                                                            <Badge variant={getBadgeVariant(player.status || 'Actif') as any} className="text-xs cursor-pointer">{player.status || 'Actif'}</Badge>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-40">
                                                                        <DropdownMenuRadioGroup
                                                                            value={player.status}
                                                                            onValueChange={(newStatus) => handleStatusChange(player, newStatus)}
                                                                        >
                                                                            <DropdownMenuRadioItem value="Actif">Actif</DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value="Blessé">Blessé</DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value="Suspendu">Suspendu</DropdownMenuRadioItem>
                                                                            <DropdownMenuRadioItem value="Inactif">Inactif</DropdownMenuRadioItem>
                                                                        </DropdownMenuRadioGroup>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        ) : (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Aucun joueur trouvé.</p>
            </div>
        )}
    </div>
    );
}

