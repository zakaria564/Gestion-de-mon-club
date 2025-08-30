
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCoachesContext } from "@/context/coaches-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const coachSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  specialization: z.string().min(1, "La spécialité est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide."),
  experience: z.coerce.number().min(0, "L'expérience ne peut être négative."),
  notes: z.string().optional(),
  photo: z.string().url("Veuillez entrer une URL valide pour la photo.").optional().or(z.literal('')),
});

type CoachFormValues = z.infer<typeof coachSchema>;

const defaultValues: CoachFormValues = {
    name: '',
    specialization: 'Entraîneur Principal',
    phone: '',
    email: '',
    experience: 0,
    notes: '',
    photo: '',
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
     const coachData = {
        ...data,
        status: 'Actif',
        category: 'Sénior'
      }
    await addCoach(coachData);
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
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expérience (années)</FormLabel>
                              <FormControl><Input type="number" placeholder="ex: 5" {...field} required /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ajouter des notes sur l'entraîneur"
                                  className="resize-y min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                <Badge variant="outline" className="text-xs">{coach.category}</Badge>
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
