
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
import { PlusCircle, Camera, Search, X } from "lucide-react";
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
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const documentSchema = z.object({
  name: z.string().min(1, "Le nom du document est requis."),
  url: z.string().url("Veuillez entrer une URL valide.").min(1, "L'URL est requise."),
  expirationDate: z.string().optional(),
});

const playerSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide.").optional().or(z.literal('')),
  address: z.string().min(1, "L'adresse est requise."),
  country: z.string().min(1, "La nationalité est requise."),
  poste: z.string().min(1, "Le poste est requis."),
  jerseyNumber: z.coerce.number().min(1, "Le numéro de maillot doit être supérieur à 0."),
  photo: z.string().url("Veuillez entrer une URL valide.").optional().or(z.literal('')),
  cin: z.string().optional(),
  gender: z.enum(['Masculin', 'Féminin']).optional(),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  tutorEmail: z.string().email("L'adresse email du tuteur est invalide.").optional().or(z.literal('')),
  tutorCin: z.string().optional(),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.enum(['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7']),
  entryDate: z.string().optional(),
  exitDate: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});


type PlayerFormValues = z.infer<typeof playerSchema>;

const defaultValues: PlayerFormValues = {
    name: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    country: 'Marocaine',
    poste: 'Milieu Central',
    jerseyNumber: 10,
    photo: '',
    cin: '',
    gender: 'Masculin',
    tutorName: '',
    tutorPhone: '',
    tutorEmail: '',
    tutorCin: '',
    status: 'Actif',
    category: 'Sénior',
    entryDate: '',
    exitDate: '',
    documents: [],
};

const documentOptions = [
  "Certificat Médical",
  "Carte d'identité",
  "Passeport",
  "Extrait de naissance",
  "Photo d'identité",
  "Autorisation Parentale",
  "Fiche de renseignements",
  "Justificatif de domicile",
  "Licence sportive",
  "Assurance",
  "Autre"
];

const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise", "Américaine", "Russe", "Japonaise", "Chinoise", "Indienne", "Turque", "Égyptienne", "Nigériane", "Sud-africaine", "Ghanéenne"];

export default function PlayersPage() {
    const context = usePlayersContext();
    const { toast } = useToast();
    const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
    
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

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "documents",
    });
    
    const onSubmit = async (data: PlayerFormValues) => {
      const existingPlayer = players.find(p => p.name.trim().toLowerCase() === data.name.trim().toLowerCase());
      if (existingPlayer) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Un joueur avec le nom "${data.name}" existe déjà.`,
        });
        return;
      }
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
    
    const getCategoryStyle = (category: string) => {
      const baseStyle = "transition-colors text-white data-[state=active]:text-white data-[state=active]:shadow-inner data-[state=active]:border-2";
      switch (category) {
        case 'Sénior': return `${baseStyle} bg-red-500/80 hover:bg-red-500 data-[state=active]:bg-red-500 data-[state=active]:border-red-700`;
        case 'U23': return `${baseStyle} bg-blue-500/80 hover:bg-blue-500 data-[state=active]:bg-blue-500 data-[state=active]:border-blue-700`;
        case 'U19': return `${baseStyle} bg-green-500/80 hover:bg-green-500 data-[state=active]:bg-green-500 data-[state=active]:border-green-700`;
        case 'U18': return `${baseStyle} bg-yellow-500/80 hover:bg-yellow-500 data-[state=active]:bg-yellow-500 data-[state=active]:border-yellow-700`;
        case 'U17': return `${baseStyle} bg-purple-500/80 hover:bg-purple-500 data-[state=active]:bg-purple-500 data-[state=active]:border-purple-700`;
        case 'U16': return `${baseStyle} bg-pink-500/80 hover:bg-pink-500 data-[state=active]:bg-pink-500 data-[state=active]:border-pink-700`;
        case 'U15': return `${baseStyle} bg-indigo-500/80 hover:bg-indigo-500 data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-700`;
        case 'U13': return `${baseStyle} bg-teal-500/80 hover:bg-teal-500 data-[state=active]:bg-teal-500 data-[state=active]:border-teal-700`;
        case 'U11': return `${baseStyle} bg-orange-500/80 hover:bg-orange-500 data-[state=active]:bg-orange-500 data-[state=active]:border-orange-700`;
        case 'U9': return `${baseStyle} bg-cyan-500/80 hover:bg-cyan-500 data-[state=active]:bg-cyan-500 data-[state=active]:border-cyan-700`;
        case 'U7': return `${baseStyle} bg-lime-500/80 hover:bg-lime-500 data-[state=active]:bg-lime-500 data-[state=active]:border-lime-700`;
        default: return `${baseStyle} bg-gray-500/80 hover:bg-gray-500 data-[state=active]:bg-gray-500 data-[state=active]:border-gray-700`;
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

    const handleCategoryChange = async (player: Player, newCategory: string) => {
        if (player.category !== newCategory) {
            const updatedPlayer = { ...player, category: newCategory as Player['category'] };
            await updatePlayer(updatedPlayer);
            toast({
                title: "Catégorie mise à jour",
                description: `La catégorie de ${player.name} est maintenant ${newCategory}.`
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
        const sortedPlayers = [...filteredPlayers].sort((a, b) => a.name.localeCompare(b.name));

        const groups = sortedPlayers.reduce((acc, player) => {
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

        // Sort categories
        const sortedCategories = Object.keys(groups).sort((a, b) => {
            const aIndex = playerCategories.indexOf(a as Player['category']);
            const bIndex = playerCategories.indexOf(b as Player['category']);
            return aIndex - bIndex;
        });

        const sortedGroups: Record<string, Record<string, Player[]>> = {};
        for(const category of sortedCategories) {
            sortedGroups[category] = groups[category];
        }

        return sortedGroups;
    }, [filteredPlayers, playerCategories]);


    const photoPreview = form.watch('photo');
    const defaultCategory = useMemo(() => {
      const categories = Object.keys(groupedPlayers);
      return categories.length > 0 ? categories[0] : 'Sénior';
    }, [groupedPlayers]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
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
                    <div className="overflow-y-auto pr-6 -mr-6 flex-1">
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
                                        name="gender"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Genre</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un genre" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Masculin">Masculin</SelectItem>
                                                    <SelectItem value="Féminin">Féminin</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                        name="cin"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>N° CIN</FormLabel>
                                            <FormControl>
                                            <Input placeholder="ex: A123456" {...field} />
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
                                            <FormLabel>Nationalité</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une nationalité" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {nationalities.map(nationality => <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
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
                                        name="tutorCin"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>N° CIN du tuteur</FormLabel>
                                            <FormControl>
                                            <Input placeholder="ex: B654321" {...field} />
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
                                <h4 className="text-lg font-medium border-b pb-2">Documents</h4>
                                {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <FormField
                                      control={form.control}
                                      name={`documents.${index}.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Nom du document</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un type de document" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {documentOptions.map(option => (
                                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`documents.${index}.url`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL du document</FormLabel>
                                            <FormControl>
                                            <Input type="url" placeholder="https://example.com/document.pdf" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`documents.${index}.expirationDate`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date d'expiration (optionnel)</FormLabel>
                                            <FormControl>
                                            <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => append({ name: "", url: "", expirationDate: ""})}
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Ajouter un document
                                </Button>
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
                                                {playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                    <DialogFooter className="pt-4 border-t">
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

        <div className="w-full">
            {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-4">
                        <Skeleton className="h-8 w-48 mt-6" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ))
            ) : Object.keys(groupedPlayers).length > 0 ? (
                <Tabs defaultValue={defaultCategory} className="w-full">
                    <TabsList className="h-auto p-1 bg-muted rounded-md text-muted-foreground justify-start items-center flex-wrap">
                         {Object.keys(groupedPlayers).map((category) => (
                            <TabsTrigger key={category} value={category} className={cn("data-[state=active]:shadow-none", getCategoryStyle(category))}>{category}</TabsTrigger>
                        ))}
                    </TabsList>
                    {Object.entries(groupedPlayers).map(([category, postes]) => (
                        <TabsContent value={category} key={category} className="mt-4">
                            <div className="space-y-6">
                                {Object.entries(postes).map(([poste, playersInPoste]) => (
                                    <div key={`${category}-${poste}`}>
                                        <h3 className="text-xl font-semibold mb-3">{poste} ({playersInPoste.length})</h3>
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
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                                                                        <Badge variant="outline" className="text-xs cursor-pointer">{player.category || 'Sénior'}</Badge>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-40">
                                                                    <DropdownMenuRadioGroup
                                                                        value={player.category}
                                                                        onValueChange={(newCategory) => handleCategoryChange(player, newCategory)}
                                                                    >
                                                                        {playerCategories.map(cat => <DropdownMenuRadioItem key={cat} value={cat}>{cat}</DropdownMenuRadioItem>)}
                                                                    </DropdownMenuRadioGroup>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                            
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
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Aucun joueur trouvé.</p>
                </div>
            )}
        </div>
    </div>
    );
}

    