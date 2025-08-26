
"use client"

import { useMemo, useState, useEffect } from 'react';
import type { Coach } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Award, Users, Edit, Trash2, Camera } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoachesContext } from '@/context/coaches-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

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


export function CoachDetailClient({ id }: { id: string }) {
  const router = useRouter();
  
  const context = useCoachesContext();
  
  if (!context) {
    throw new Error("CoachDetailClient must be used within a CoachesProvider");
  }

  const { loading, updateCoach, deleteCoach, getCoachById } = context;

  const [dialogOpen, setDialogOpen] = useState(false);

  const coach = useMemo(() => getCoachById(id), [id, getCoachById]);
  
  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (coach && dialogOpen) {
      form.reset({
        ...coach,
        photo: coach.photo || '',
      });
    } else if (!dialogOpen) {
        form.reset();
    }
  }, [coach, dialogOpen, form]);


  if (loading) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <div className="flex flex-wrap gap-2 mt-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informations</h3>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact</h3>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!coach) {
    return notFound();
  }

  const onSubmit = async (data: CoachFormValues) => {
    if (!coach) return;
    const dataToUpdate = { 
        ...coach, // keep existing fields
        ...data,
        id: coach.id,
        uid: coach.uid
    };
    await updateCoach(dataToUpdate);
    setDialogOpen(false);
  };
  
  const handleDeleteCoach = async () => {
    if (typeof id === 'string') {
        router.push('/coaches');
        await deleteCoach(id);
    }
  }

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

  const photoPreview = form.watch('photo');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/coaches" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des entraîneurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={coach.photo ?? undefined} alt={coach.name} data-ai-hint="coach photo"/>
            <AvatarFallback className="text-4xl">{coach.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{coach.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">{coach.specialization}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(coach.status) as any}>{coach.status}</Badge>
              <Badge variant="secondary">{coach.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations</h3>
                <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.specialization}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.experience} ans d'expérience</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact</h3>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${coach.email}`} className="hover:underline">{coach.email}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.phone}</span>
                </div>
            </div>
            {coach.notes && (
              <div className="space-y-4 mt-6 md:col-span-2">
                  <h3 className="font-semibold text-lg">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{coach.notes}</p>
              </div>
            )}
        </CardContent>
         <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera définitivement l'entraîneur.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCoach}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
      
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-full flex flex-col">
            <DialogHeader>
              <DialogTitle>Modifier un entraîneur</DialogTitle>
              <DialogDescription>
                Mettez à jour les informations de l'entraîneur ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="px-6 py-4 space-y-6">
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
                </ScrollArea>
                <DialogFooter className="px-6 py-4 border-t">
                  <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">Mettre à jour</Button>
                </DialogFooter>
              </form>
            </Form>
        </DialogContent>
        </Dialog>
    </div>
  );
}
