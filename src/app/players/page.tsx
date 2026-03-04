
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
import { useState, useEffect, useMemo, Suspense } from "react";
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
import { useCoachesContext } from "@/context/coaches-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const playerCategories: ('Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7')[] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

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
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  tutorEmail: z.string().email("L'adresse email du tuteur est invalide.").optional().or(z.literal('')),
  tutorCin: z.string().optional(),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.string().min(1, "La catégorie est requise."),
  gender: z.enum(['Masculin', 'Féminin']),
  entryDate: z.string().optional(),
  exitDate: z.string().optional(),
  coachName: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const defaultValues: PlayerFormValues = {
    name: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    country: '',
    poste: '',
    jerseyNumber: '' as unknown as number,
    photo: '',
    cin: '',
    tutorName: '',
    tutorPhone: '',
    tutorEmail: '',
    tutorCin: '',
    status: 'Actif',
    category: '',
    gender: 'Masculin',
    entryDate: '',
    exitDate: '',
    coachName: '',
    documents: [],
};

const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise", "Américaine", "Russe", "Japonaise", "Chinoise", "Indienne", "Turque", "Égyptienne", "Nigériane", "Sud-africaine", "Ghanéenne"];

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))',
  'U23': 'hsl(var(--chart-2))',
  'U20': 'hsl(340, 80%, 55%)',
  'U19': 'hsl(var(--chart-3))',
  'U18': 'hsl(var(--chart-4))',
  'U17': 'hsl(var(--chart-5))',
  'U16': 'hsl(var(--chart-6))',
  'U15': 'hsl(var(--chart-7))',
  'U13': 'hsl(var(--chart-8))',
  'U9': 'hsl(25 60% 45%)',
  'U11': 'hsl(var(--chart-10))',
  'U7': 'hsl(var(--chart-11))',
};

function PlayersContent() {
    const context = usePlayersContext();
    const coachesContext = useCoachesContext();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    
    if (!context || !coachesContext) {
      throw new Error("PlayersPage must be used within a PlayersProvider and CoachesProvider");
    }

    const { players, loading, addPlayer, updatePlayer } = context;
    const { coaches, loading: coachesLoading } = coachesContext;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterKey, setFilterKey] = useState("name");

    const activeGender = searchParams.get('gender') || 'male';
    const activeCategory = searchParams.get('category');

    const handleTabChange = (key: 'gender' | 'category', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const form = useForm<PlayerFormValues>({
      resolver: zodResolver(playerSchema),
      defaultValues,
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "documents" });
    
    const onSubmit = async (data: PlayerFormValues) => {
      if (players.find(p => p.name.trim().toLowerCase() === data.name.trim().toLowerCase())) {
        toast({ variant: "destructive", title: "Erreur", description: `Un joueur avec le nom "${data.name}" existe déjà.` });
        return;
      }
      await addPlayer(data);
      setDialogOpen(false);
      toast({ title: "Joueur ajouté", description: "Le nouveau joueur a été ajouté avec succès." });
    };

    useEffect(() => {
        if (!dialogOpen) form.reset(defaultValues);
    }, [dialogOpen, form]);

    const getBadgeVariant = (status: string) => {
      switch (status) {
        case 'Actif': return 'default';
        case 'Blessé': return 'destructive';
        case 'Suspendu': return 'secondary';
        default: return 'outline';
      }
    };
    
    const handleStatusChange = async (player: Player, newStatus: string) => {
      if (player.status !== newStatus) {
          await updatePlayer({ ...player, status: newStatus as Player['status'] });
          toast({ title: "Statut mis à jour", description: `Le statut de ${player.name} est maintenant ${newStatus}.` });
      }
    };

    const handleCategoryChange = async (player: Player, newCategory: string) => {
        if (player.category !== newCategory) {
            await updatePlayer({ ...player, category: newCategory as Player['category'] });
            toast({ title: "Catégorie mise à jour", description: `La catégorie de ${player.name} est maintenant ${newCategory}.` });
        }
    };

    const filteredPlayers = useMemo(() => {
        if (!searchQuery) return players;
        return players.filter(player => {
            const value = player[filterKey as keyof Player] as string;
            return value?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [players, searchQuery, filterKey]);

    const { maleGroups, femaleGroups } = useMemo(() => {
        const maleGroups: Record<string, Record<string, Player[]>> = {};
        const femaleGroups: Record<string, Record<string, Player[]>> = {};
        [...filteredPlayers].sort((a,b) => a.name.localeCompare(b.name)).forEach(player => {
            const category = player.category || 'Sénior';
            const poste = player.poste || 'Non défini';
            const targetGroup = player.gender === 'Féminin' ? femaleGroups : maleGroups;
            if (!targetGroup[category]) targetGroup[category] = {};
            if (!targetGroup[category][poste]) targetGroup[category][poste] = [];
            targetGroup[category][poste].push(player);
        });
        return { maleGroups, femaleGroups };
    }, [filteredPlayers]);

    const renderCategoryTabs = (groupedData: Record<string, Record<string, Player[]>>, gender: 'male' | 'female') => {
        const categories = Object.keys(groupedData).sort((a,b) => playerCategories.indexOf(a as any) - playerCategories.indexOf(b as any));
        if (categories.length === 0) return <div className="text-center py-10"><p className="text-muted-foreground">Aucun joueur trouvé.</p></div>;
        const currentCategory = activeCategory && groupedData[activeCategory] ? activeCategory : categories[0];

        return (
            <Tabs value={currentCategory} onValueChange={(val) => handleTabChange('category', val)} className="w-full mt-4">
                <TabsList className="h-auto p-1 bg-muted rounded-md flex-wrap justify-start">
                    {categories.map(cat => (
                        <TabsTrigger key={cat} value={cat} style={{ backgroundColor: categoryColors[cat.replace(' F', '')] }} className="text-white data-[state=active]:brightness-110">
                            {cat}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {Object.entries(groupedData).map(([category, postes]) => (
                    <TabsContent value={category} key={category} className="mt-4 space-y-6">
                        {Object.entries(postes).map(([poste, playersInPoste]) => (
                            <div key={poste}>
                                <h3 className="text-xl font-semibold mb-3">{poste} ({playersInPoste.length})</h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {playersInPoste.map(player => (
                                        <Card key={player.id} className="flex flex-col hover:shadow-lg transition-shadow group">
                                            <Link href={`/players/${player.id}`} className="flex flex-col h-full">
                                                <CardHeader className="p-4 flex flex-row items-center gap-4">
                                                    <Avatar className="h-16 w-16"><AvatarImage src={player.photo} /><AvatarFallback>{player.name.substring(0,2)}</AvatarFallback></Avatar>
                                                    <div className="flex-1"><CardTitle className="text-base font-bold">{player.name}</CardTitle><CardDescription>{player.poste}</CardDescription></div>
                                                </CardHeader>
                                            </Link>
                                            <CardContent className="p-4 pt-0 flex justify-between items-center">
                                                <Badge style={{ backgroundColor: categoryColors[player.category.replace(' F', '')], color: 'white' }}>{player.category}</Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-auto p-0"><Badge variant={getBadgeVariant(player.status) as any}>{player.status}</Badge></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent><DropdownMenuRadioGroup value={player.status} onValueChange={(s) => handleStatusChange(player, s)}><DropdownMenuRadioItem value="Actif">Actif</DropdownMenuRadioItem><DropdownMenuRadioItem value="Blessé">Blessé</DropdownMenuRadioItem><DropdownMenuRadioItem value="Suspendu">Suspendu</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                ))}
            </Tabs>
        );
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Joueurs</h2>
                <Button onClick={() => setDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur</Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
                <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
                <Select value={filterKey} onValueChange={setFilterKey}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Nom</SelectItem><SelectItem value="poste">Poste</SelectItem></SelectContent></Select>
            </div>

            <Tabs value={activeGender} onValueChange={(val) => handleTabChange('gender', val)} className="w-full">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="male">Masculin</TabsTrigger><TabsTrigger value="female">Féminin</TabsTrigger></TabsList>
                <TabsContent value="male">{renderCategoryTabs(maleGroups, 'male')}</TabsContent>
                <TabsContent value="female">{renderCategoryTabs(femaleGroups, 'female')}</TabsContent>
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh]">
                    <DialogHeader><DialogTitle>Nouveau Joueur</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}><ScrollArea className="h-[70vh] p-4"><div className="space-y-6">
                            <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="gender" render={({field}) => <FormItem><FormLabel>Genre</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></FormItem>} />
                                <FormField control={form.control} name="category" render={({field}) => <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel>Poste</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                                <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel>Numéro</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>} />
                            </div>
                            <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                            <FormField control={form.control} name="address" render={({field}) => <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                            <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel>Date de naissance</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>} />
                        </div></ScrollArea><DialogFooter className="mt-4"><Button type="submit">Enregistrer</Button></DialogFooter></form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function PlayersPage() {
    return <Suspense fallback={<div>Chargement...</div>}><PlayersContent /></Suspense>;
}
