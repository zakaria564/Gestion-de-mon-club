
'use client';

import { useMemo, useState, useContext, useEffect } from 'react';
import React from 'react';
import { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Edit, Trash2, Camera, Home, Shirt, Phone, Flag, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
        notes: player.notes || '',
        photo: player.photo || '',
        country: player.country || '',
        tutorName: player.tutorName || '',
        tutorPhone: player.tutorPhone || '',
      });
      setPhotoPreview(player.photo || null);
    } else if (!dialogOpen) {
      form.reset();
      setPhotoPreview(null);
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations</h3>
                <Skeleton className="h-5 w-3/4" />
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
        ...player,
        ...data, 
        id: player.id,
        uid: player.uid
    };
    await updatePlayer(dataToUpdate as Player);
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
  const playerStatus = (player as any).status || 'Actif';
  const playerCategory = (player as any).category || 'Sénior';

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
            <CardDescription className="text-lg text-muted-foreground mt-1 flex items-center">
              {player.poste}
              <Badge variant="outline" className="ml-2 text-lg">#{player.jerseyNumber}</Badge>
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(playerStatus) as any}>{playerStatus}</Badge>
              <Badge variant="secondary">{playerCategory}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                 <div className="flex items-center gap-4">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedBirthDate}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <span>{player.address}</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Flag className="h-5 w-5 text-muted-foreground" />
                    <span>{player.country}</span>
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.phone}</span>
                </div>
            </div>
             {(player.tutorName || player.tutorPhone) && (
              <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-lg">Tuteur Légal</h3>
                  {player.tutorName && (
                    <div className="flex items-center gap-4">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <span>{player.tutorName}</span>
                    </div>
                  )}
                  {player.tutorPhone && (
                    <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{player.tutorPhone}</span>
                    </div>
                  )}
              </div>
            )}
            {player.notes && (
              <div className="space-y-4 mt-6 md:col-span-2">
                  <h3 className="font-semibold text-lg">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{player.notes}</p>
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
        <DialogContent className="sm:max-w-4xl h-full flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier un joueur</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du joueur ci-dessous.
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
                              <AvatarImage src={photoPreview ?? field.value} alt="Aperçu du joueur" data-ai-hint="player photo" />
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
                        <h4 className="text-lg font-medium border-b pb-2">Informations Personnelles</h4>
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
                        </div>
                     </div>
                      <div className="space-y-4">
                            <h4 className="text-lg font-medium border-b pb-2">Contact</h4>
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
                            <h4 className="text-lg font-medium border-b pb-2">Tuteur Légal (si mineur)</h4>
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
                  <Button type="submit">Mettre à jour</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    