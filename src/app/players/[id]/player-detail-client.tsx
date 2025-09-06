
'use client';

import { useMemo, useState, useEffect } from 'react';
import React from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Edit, Trash2, Camera, Home, Shirt, Phone, Flag, Shield, Mail, MapPin, FileText, PlusCircle, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
  poste: z.string().min(1, "Le poste est requis."),
  jerseyNumber: z.coerce.number().min(1, "Le numéro de maillot doit être supérieur à 0."),
  photo: z.string().url("Veuillez entrer une URL valide pour la photo.").optional().or(z.literal('')),
  country: z.string().min(1, "La nationalité est requise."),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  tutorEmail: z.string().email("L'adresse email du tuteur est invalide.").optional().or(z.literal('')),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.enum(['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7']),
  entryDate: z.string().optional(),
  exitDate: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

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

const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise"];

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
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

   useEffect(() => {
    if (player && dialogOpen) {
      const birthDate = player.birthDate && isValid(parseISO(player.birthDate)) 
        ? format(parseISO(player.birthDate), 'yyyy-MM-dd') 
        : '';
      const entryDate = player.entryDate && isValid(parseISO(player.entryDate)) 
        ? format(parseISO(player.entryDate), 'yyyy-MM-dd') 
        : '';
       const exitDate = player.exitDate && isValid(parseISO(player.exitDate)) 
        ? format(parseISO(player.exitDate), 'yyyy-MM-dd') 
        : '';
      
      const documents = player.documents?.map(doc => ({
        ...doc,
        expirationDate: doc.expirationDate && isValid(parseISO(doc.expirationDate)) ? format(parseISO(doc.expirationDate), 'yyyy-MM-dd') : ''
      })) || [];


      form.reset({
        ...player,
        birthDate,
        entryDate,
        exitDate,
        documents,
        email: player.email || '',
        photo: player.photo || '',
        country: player.country || '',
        tutorName: player.tutorName || '',
        tutorPhone: player.tutorPhone || '',
        tutorEmail: player.tutorEmail || '',
      });
    } else if (!dialogOpen) {
      form.reset();
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
  const playerStatus = player.status || 'Actif';
  const playerCategory = player.category || 'Sénior';

  const photoPreview = form.watch('photo');

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
        <CardContent className="pt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                 <div className="flex items-center gap-4">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedBirthDate}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${player.phone}`} className="hover:underline">{player.phone}</a>
                </div>
                {player.email && (
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${player.email}`} className="hover:underline">{player.email}</a>
                  </div>
                )}
                <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                     <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(player.address)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {player.address}
                    </a>
                </div>
                 <div className="flex items-center gap-4">
                    <Flag className="h-5 w-5 text-muted-foreground" />
                    <span>{player.country}</span>
                </div>
            </div>
            
            {(player.tutorName || player.tutorPhone || player.tutorEmail) && (
              <div className="space-y-4">
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
                        <a href={`tel:${player.tutorPhone}`} className="hover:underline">{player.tutorPhone}</a>
                    </div>
                  )}
                  {player.tutorEmail && (
                    <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <a href={`mailto:${player.tutorEmail}`} className="hover:underline">{player.tutorEmail}</a>
                    </div>
                  )}
              </div>
            )}

            {player.documents && player.documents.length > 0 && (
                <div className="space-y-4 md:col-span-full">
                    <h3 className="font-semibold text-lg">Documents</h3>
                    <ul className="space-y-2">
                        {player.documents.map((doc, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{doc.name}</a>
                                        {doc.expirationDate && isValid(parseISO(doc.expirationDate)) && (
                                            <p className="text-xs text-muted-foreground">Expire le: {format(parseISO(doc.expirationDate), 'dd/MM/yyyy')}</p>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                </Button>
                            </li>
                        ))}
                    </ul>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier un joueur</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du joueur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="overflow-y-auto pr-6 -mr-6 max-h-[calc(90vh-180px)]">
                  <div className="space-y-6 py-4 px-1">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border">
                          <AvatarImage src={photoPreview || undefined} alt="Aperçu du joueur" data-ai-hint="player photo" />
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

    
    
