
"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCoachesContext } from "@/context/coaches-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const coachSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  specialization: z.string().min(1, "La spécialité est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide."),
  experience: z.coerce.number().min(0, "L'expérience ne peut être négative."),
  notes: z.string().optional(),
  photo: z.string().optional(),
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
  
  if (!context) {
    throw new Error("CoachesPage must be used within a CoachesProvider");
  }

  const { coaches, loading, addCoach } = context;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!dialogOpen) {
      form.reset(defaultValues);
      setPhotoPreview(null);
    }
  }, [dialogOpen, form]);

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
    const { category } = coach as any;
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
    await addCoach(coachData as any);
    setDialogOpen(false);
  };

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
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 pr-6 -mr-6">
                  <div className="space-y-6 py-4">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-4">
                          <FormLabel htmlFor="photo-upload-coach">
                            <Avatar className="h-24 w-24 border-2 border-dashed hover:border-primary cursor-pointer">
                              <AvatarImage src={photoPreview ?? undefined} alt="Aperçu de l'entraîneur" data-ai-hint="coach photo"/>
                              <AvatarFallback className="bg-muted">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          </FormLabel>
                          <FormControl>
                            <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo-upload-coach" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                </ScrollArea>
                <DialogFooter className="pt-4 border-t mt-auto">
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
                                <Badge variant="outline" className="text-xs">{(coach as any).category}</Badge>
                                <Badge variant={getBadgeVariant((coach as any).status) as any} className="text-xs">{(coach as any).status}</Badge>
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
