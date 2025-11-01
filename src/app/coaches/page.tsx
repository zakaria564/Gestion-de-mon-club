

"use client";

import { useState, useEffect, useMemo } from "react";
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
import type { Coach } from "@/lib/data";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCoachesContext } from "@/context/coaches-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import type { Player } from "@/lib/data";

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

const documentSchema = z.object({
  name: z.string().min(1, "Le nom du document est requis."),
  url: z.string().url("Veuillez entrer une URL valide.").min(1, "L'URL est requise."),
  expirationDate: z.string().optional(),
});

const coachSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  specialization: z.string().min(1, "La spécialité est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide."),
  address: z.string().min(1, "L'adresse est requise."),
  country: z.string().min(1, "La nationalité est requise."),
  experience: z.coerce.number().min(0, "L'expérience ne peut être négative."),
  photo: z.string().url("Veuillez entrer une URL valide pour la photo.").optional().or(z.literal('')),
  cin: z.string().optional(),
  category: z.enum(playerCategories),
  documents: z.array(documentSchema).optional(),
  gender: z.enum(['Masculin', 'Féminin']),
});

type CoachFormValues = z.infer<typeof coachSchema>;

const defaultValues: Omit<CoachFormValues, 'status'> = {
    name: '',
    specialization: 'Entraîneur Principal',
    phone: '',
    email: '',
    address: '',
    country: 'Marocaine',
    experience: 0,
    photo: '',
    cin: '',
    category: 'Sénior',
    documents: [],
    gender: 'Masculin',
};

const documentOptions = [
  "Contrat",
  "Diplôme",
  "Certificat de Formation",
  "Carte d'identité",
  "Passeport",
  "Assurance",
  "Autre"
];

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

export default function CoachesPage() {
  const context = useCoachesContext();
  const { toast } = useToast();
  
  if (!context) {
    throw new Error("CoachesPage must be used within a CoachesProvider");
  }

  const { coaches, loading, addCoach, updateCoach } = context;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKey, setFilterKey] = useState("name");

  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  useEffect(() => {
    if (!dialogOpen) {
      form.reset(defaultValues);
    }
  }, [dialogOpen, form]);

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

  const handleStatusChange = async (coach: Coach, newStatus: string) => {
    if (coach.status !== newStatus) {
      const updatedCoach = { ...coach, status: newStatus as Coach['status'] };
      await updateCoach(updatedCoach);
      toast({
          title: "Statut mis à jour",
          description: `Le statut de ${coach.name} est maintenant ${newStatus}.`
      });
    }
  };

  const filteredCoaches = useMemo(() => {
    if (!searchQuery) return coaches;
    return coaches.filter(coach => {
        const value = coach[filterKey as keyof Coach] as string;
        return value?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [coaches, searchQuery, filterKey]);

  const groupedCoaches = filteredCoaches.reduce((acc, coach) => {
    const { category } = coach;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(coach);
    return acc;
  }, {} as Record<string, typeof coaches>);

  const onSubmit = async (data: CoachFormValues) => {
     const existingCoach = coaches.find(c => c.name.trim().toLowerCase() === data.name.trim().toLowerCase());
      if (existingCoach) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Un entraîneur avec le nom "${data.name}" existe déjà.`,
        });
        return;
      }
     const coachData = {
        ...data,
        status: 'Actif',
      }
    await addCoach(coachData as any);
    setDialogOpen(false);
  };

  const photoPreview = form.watch('photo');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Entraîneurs</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un entraîneur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
             <DialogHeader>
                <DialogTitle>Ajouter un entraîneur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du nouvel entraîneur ci-dessous.
                </DialogDescription>
              </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                 <div className="overflow-y-auto pr-6 -mr-6 max-h-[calc(90vh-180px)]">
                    <div className="px-1 py-4 space-y-6">
                      <div className="flex flex-col items-center gap-4">
                          <Avatar className="h-24 w-24 border">
                            <AvatarImage src={photoPreview || undefined} alt="Aperçu de l'entraîneur" data-ai-hint="coach photo"/>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl><Input placeholder="ex: Alain Prost" {...field} required /></FormControl>
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
                              <FormControl><Input placeholder="ex: A123456" {...field} /></FormControl>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spécialité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une spécialité" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="Entraîneur Principal">Entraîneur Principal</SelectItem>
                                  <SelectItem value="Entraîneur Adjoint">Entraîneur Adjoint</SelectItem>
                                  <SelectItem value="Entraîneur des Gardiens">Entraîneur des Gardiens</SelectItem>
                                  <SelectItem value="Préparateur Physique">Préparateur Physique</SelectItem>
                                  <SelectItem value="Analyste Vidéo">Analyste Vidéo</SelectItem>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} required>
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
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl><Input placeholder="ex: 0612345678" {...field} required /></FormControl>
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
                              <FormControl><Input type="email" placeholder="ex: email@exemple.com" {...field} required /></FormControl>
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
                                <FormControl><Input placeholder="ex: 123 Rue de la Paix" {...field} required /></FormControl>
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
                         <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Expérience (années)</FormLabel>
                              <FormControl><Input type="number" placeholder="ex: 5" {...field} required /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                    className="pl-10"
                />
            </div>
            <Select value={filterKey} onValueChange={setFilterKey}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrer par" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="specialization">Spécialité</SelectItem>
                    <SelectItem value="category">Catégorie</SelectItem>
                    <SelectItem value="status">Statut</SelectItem>
                </SelectContent>
            </Select>
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
        Object.entries(groupedCoaches).length > 0 ? (
          Object.entries(groupedCoaches).map(([category, coachesInCategory]) => (
            <div key={category} className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight mt-6">{category}</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {coachesInCategory.map((coach) => (
                    <Card key={coach.id} className="flex flex-col w-full hover:shadow-lg transition-shadow h-full group">
                        <Link href={`/coaches/${coach.id}`} className="flex flex-col h-full">
                            <CardHeader className="p-4">
                                <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={coach.photo ?? undefined} alt={coach.name} data-ai-hint="coach photo" />
                                    <AvatarFallback>{coach.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-base font-bold">{coach.name}</CardTitle>
                                    <CardDescription>{coach.specialization}</CardDescription>
                                </div>
                                </div>
                            </CardHeader>
                        </Link>
                        <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                            <div className="flex justify-between items-center">
                                <Badge 
                                    style={{ backgroundColor: categoryColors[coach.category], color: 'white' }}
                                    className="text-xs border-transparent"
                                >
                                    {coach.category}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                                            <Badge variant={getBadgeVariant(coach.status) as any} className="text-xs cursor-pointer">{coach.status}</Badge>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-40">
                                        <DropdownMenuRadioGroup
                                            value={coach.status}
                                            onValueChange={(newStatus) => handleStatusChange(coach, newStatus)}
                                        >
                                            <DropdownMenuRadioItem value="Actif">Actif</DropdownMenuRadioItem>
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
          ))
        ) : (
          <div className="text-center py-10">
              <p className="text-muted-foreground">Aucun entraîneur trouvé.</p>
          </div>
        )
      )}
    </div>
  );
}

    

