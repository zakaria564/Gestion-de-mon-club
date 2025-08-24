
'use client';

import { useMemo, useState, useContext, useEffect } from 'react';
import React from 'react';
import { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Mail, Phone, UserCheck, UserCircle, MapPin, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, isValid } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

export function PlayerDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const context = usePlayersContext();

  if (!context) {
    throw new Error("PlayerDetailClient must be used within a PlayersProvider");
  }

  const { loading, updatePlayer, deletePlayer, getPlayerById } = context;
  const [dialogOpen, setDialogOpen] = useState(false);
  const player = useMemo(() => getPlayerById(id), [id, getPlayerById]);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {},
  });

   useEffect(() => {
    if (player && dialogOpen) {
      const birthDate = player.birthDate && isValid(parseISO(player.birthDate)) 
        ? format(parseISO(player.birthDate), 'yyyy-MM-dd') 
        : '';
      form.reset({
        ...player,
        birthDate: birthDate,
        jerseyNumber: player.jerseyNumber || 0,
      });
    }
  }, [player, dialogOpen, form]);


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
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!player) {
    return notFound();
  }

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
    if (!player) return;
    const dataToUpdate = { 
        ...data, 
        jerseyNumber: data.jerseyNumber || 0,
        id: player.id,
        uid: player.uid
    };
    await updatePlayer(dataToUpdate);
    setDialogOpen(false);
    toast({ title: "Joueur mis à jour", description: "Les informations du joueur ont été modifiées avec succès." });
  };
  
  const handleDeletePlayer = async () => {
    router.push('/players');
    await deletePlayer(id);
    toast({ variant: "destructive", title: "Joueur supprimé", description: "Le joueur a été supprimé de la liste." });
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Actif': return 'default';
      case 'Blessé': return 'destructive';
      case 'Suspendu': return 'secondary';
      default: return 'outline';
    }
  };
  
  const formattedBirthDate = player.birthDate && isValid(parseISO(player.birthDate)) ? format(parseISO(player.birthDate), 'dd/MM/yyyy') : 'N/A';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/players" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des joueurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={player.photo || undefined} alt={player.name} data-ai-hint="player photo" />
            <AvatarFallback className="text-4xl">{player.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">{player.poste}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(player.status) as any}>{player.status}</Badge>
              <Badge variant="secondary">{player.category}</Badge>
              {player.jerseyNumber && <Badge variant="outline">Maillot n°{player.jerseyNumber}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                <div className="flex items-center gap-4">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span>{player.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedBirthDate}</span>
                </div>
                <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{player.address}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${player.email}`} className="hover:underline">{player.email}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.phone}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Tuteur Légal</h3>
                 <div className="flex items-center gap-4">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                    <span>{player.tutorName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.tutorPhone || 'N/A'}</span>
                </div>
            </div>
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
                        Cette action ne peut pas être annulée. Cela supprimera définitivement le joueur.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePlayer}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Modifier le joueur</DialogTitle>
              <DialogDescription>Mettez à jour les informations ci-dessous.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-hidden">
                <ScrollArea className="h-[65vh] pr-6 -mr-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
                      <div className="md:col-span-2">
                          <h4 className="font-medium text-lg mb-4 pb-2 border-b">Informations Personnelles</h4>
                      </div>

                      <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({ field }) => (
                          <FormItem><FormLabel>Date de naissance</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                          <FormItem className="md:col-span-2"><FormLabel>Adresse</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />

                      <div className="md:col-span-2">
                          <h4 className="font-medium text-lg mt-6 mb-4 pb-2 border-b">Informations Sportives</h4>
                      </div>

                      <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Sénior">Sénior</SelectItem><SelectItem value="U23">U23</SelectItem><SelectItem value="U19">U19</SelectItem><SelectItem value="U18">U18</SelectItem><SelectItem value="U17">U17</SelectItem><SelectItem value="U16">U16</SelectItem><SelectItem value="U15">U15</SelectItem><SelectItem value="U13">U13</SelectItem><SelectItem value="U11">U11</SelectItem><SelectItem value="U9">U9</SelectItem><SelectItem value="U7">U7</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="poste" render={({ field }) => (
                          <FormItem><FormLabel>Poste</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Gardien">Gardien</SelectItem><SelectItem value="Défenseur Central">Défenseur Central</SelectItem><SelectItem value="Latéral Droit">Latéral Droit</SelectItem><SelectItem value="Latéral Gauche">Latéral Gauche</SelectItem><SelectItem value="Milieu Défensif">Milieu Défensif</SelectItem><SelectItem value="Milieu Central">Milieu Central</SelectItem><SelectItem value="Milieu Offensif">Milieu Offensif</SelectItem><SelectItem value="Ailier Droit">Ailier Droit</SelectItem><SelectItem value="Ailier Gauche">Ailier Gauche</SelectItem><SelectItem value="Avant-centre">Avant-centre</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="status" render={({ field }) => (
                          <FormItem><FormLabel>Statut</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Blessé">Blessé</SelectItem><SelectItem value="Suspendu">Suspendu</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="jerseyNumber" render={({ field }) => (
                          <FormItem><FormLabel>Numéro de maillot</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />

                      <div className="md:col-span-2">
                          <h4 className="font-medium text-lg mt-6 mb-4 pb-2 border-b">Contact</h4>
                      </div>

                      <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />

                      <div className="md:col-span-2">
                          <h4 className="font-medium text-lg mt-6 mb-4 pb-2 border-b">Tuteur Légal (si mineur)</h4>
                      </div>

                      <FormField control={form.control} name="tutorName" render={({ field }) => (
                          <FormItem><FormLabel>Nom du tuteur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="tutorPhone" render={({ field }) => (
                          <FormItem><FormLabel>Téléphone du tuteur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />

                      <div className="md:col-span-2 pt-4 mt-6 border-t">
                          <FormLabel>Photo</FormLabel>
                          <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                          <FormMessage />
                          {(photoPreview || form.getValues('photo')) && (
                              <Avatar className="h-20 w-20 mt-2">
                                  <AvatarImage src={photoPreview || form.getValues('photo')} alt="Aperçu" />
                                  <AvatarFallback>??</AvatarFallback>
                              </Avatar>
                          )}
                      </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t -mx-6 px-6 bg-background">
                    <Button type="submit">Sauvegarder</Button>
                </DialogFooter>
              </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    