
'use client';

import { useMemo, useState, useEffect } from 'react';
import React from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Edit, Trash2, Camera, Home, Shirt, Phone, Flag, Shield, Mail, MapPin, FileText, PlusCircle, X, ExternalLink, VenetianMask, UserSquare, Calendar, LogIn, LogOut, UserCheck } from "lucide-react";
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
import { useCoachesContext } from '@/context/coaches-context';

const documentSchema = z.object({
  name: z.string().min(1, "Le nom du document est requis."),
  url: z.string().url("Veuillez entrer une URL valide.").min(1, "L'URL est requise."),
  expirationDate: z.string().optional(),
});

const playerCategories: ('Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7')[] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];

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

Object.keys(categoryColors).forEach(key => {
    categoryColors[`${key} F`] = categoryColors[key];
});

export function PlayerDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const context = usePlayersContext();
  const coachesContext = useCoachesContext();


  if (!context || !coachesContext) {
    throw new Error("PlayerDetailClient must be used within a PlayersProvider and CoachesProvider");
  }

  const { loading, updatePlayer, deletePlayer, getPlayerById } = context;
  const { coaches, loading: coachesLoading } = coachesContext;
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
      const documents = player.documents?.map(doc => ({
        name: doc.name || '',
        url: doc.url || '',
        expirationDate: doc.expirationDate && isValid(parseISO(doc.expirationDate)) ? format(parseISO(doc.expirationDate), 'yyyy-MM-dd') : ''
      })) || [];

      form.reset({
        ...player,
        name: player.name || '',
        birthDate: player.birthDate && isValid(parseISO(player.birthDate)) ? format(parseISO(player.birthDate), 'yyyy-MM-dd') : '',
        phone: player.phone || '',
        email: player.email || '',
        address: player.address || '',
        poste: player.poste || '',
        jerseyNumber: player.jerseyNumber || ('' as unknown as number),
        photo: player.photo || '',
        country: player.country || 'Marocaine',
        cin: player.cin || '',
        tutorName: player.tutorName || '',
        tutorPhone: player.tutorPhone || '',
        tutorEmail: player.tutorEmail || '',
        tutorCin: player.tutorCin || '',
        status: player.status || 'Actif',
        category: player.category || 'Sénior',
        gender: player.gender || 'Masculin',
        coachName: player.coachName || '',
        entryDate: player.entryDate && isValid(parseISO(player.entryDate)) ? format(parseISO(player.entryDate), 'yyyy-MM-dd') : '',
        exitDate: player.exitDate && isValid(parseISO(player.exitDate)) ? format(parseISO(player.exitDate), 'yyyy-MM-dd') : '',
        documents,
      });
    } else if (!dialogOpen) {
      form.reset();
    }
  }, [player, dialogOpen, form]);


  if (loading || coachesLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader className="flex flex-row items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
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
  const formattedEntryDate = player.entryDate && isValid(parseISO(player.entryDate)) ? format(parseISO(player.entryDate), 'dd/MM/yyyy') : 'N/A';
  const formattedExitDate = player.exitDate && isValid(parseISO(player.exitDate)) ? format(parseISO(player.exitDate), 'dd/MM/yyyy') : 'N/A';
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
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={player.photo || undefined} alt={player.name} data-ai-hint="player photo" />
            <AvatarFallback className="text-4xl">{player.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                 <div className="flex items-center gap-4">
                    <VenetianMask className="h-5 w-5 text-muted-foreground" />
                    <span>{player.gender || 'Non spécifié'}</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedBirthDate}</span>
                </div>
                 {player.cin && (
                  <div className="flex items-center gap-4">
                    <UserSquare className="h-5 w-5 text-muted-foreground" />
                    <span>{player.cin}</span>
                  </div>
                 )}
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${player.phone}`} className="text-primary hover:underline">{player.phone}</a>
                </div>
                {player.email && (
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${player.email}`} className="text-primary hover:underline">{player.email}</a>
                  </div>
                )}
                <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                     <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(player.address)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
                  {player.tutorCin && (
                     <div className="flex items-center gap-4">
                        <UserSquare className="h-5 w-5 text-muted-foreground" />
                        <span>{player.tutorCin}</span>
                    </div>
                  )}
                  {player.tutorPhone && (
                    <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <a href={`tel:${player.tutorPhone}`} className="text-primary hover:underline">{player.tutorPhone}</a>
                    </div>
                  )}
                  {player.tutorEmail && (
                    <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <a href={`mailto:${player.tutorEmail}`} className="text-primary hover:underline">{player.tutorEmail}</a>
                    </div>
                  )}
              </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Club</h3>
                <div className="flex items-center gap-4">
                  <Shirt className="h-5 w-5 text-muted-foreground" />
                  <span>{player.poste} - <Badge variant="outline">#{player.jerseyNumber}</Badge></span>
                </div>
                 <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <span>Catégorie : <Badge style={{ backgroundColor: categoryColors[playerCategory.replace(' F', '')], color: 'white' }} className="border-transparent">{playerCategory}</Badge></span>
                </div>
                 {player.coachName && (
                    <div className="flex items-center gap-4">
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                        <span>Entraîneur: {player.coachName}</span>
                    </div>
                 )}
                <div className="flex items-center gap-4">
                    <Shirt className="h-5 w-5 text-muted-foreground" />
                    <span>Statut : <Badge variant={getBadgeVariant(playerStatus) as any}>{playerStatus}</Badge></span>
                </div>
                 <div className="flex items-center gap-4">
                    <LogIn className="h-5 w-5 text-muted-foreground" />
                    <span>Entrée : {formattedEntryDate}</span>
                </div>
                {player.exitDate && (
                  <div className="flex items-center gap-4">
                      <LogOut className="h-5 w-5 text-muted-foreground" />
                      <span>Sortie : {formattedExitDate}</span>
                  </div>
                )}
            </div>

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
                                <Input type="text" {...field} />
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
                                    <Input {...field} required />
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
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Genre</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} required>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
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
                                name="cin"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>N° CIN</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
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
                                      <Input {...field} required />
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
                                      <Input type="email" {...field} />
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
                                      <Input {...field} required />
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
                                     <Select onValueChange={field.onChange} value={field.value} required>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
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
                          <h4 className="text-lg font-medium border-b pb-2">Informations Sportives</h4>
                            <FormField
                              control={form.control}
                              name="poste"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Poste</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} required>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
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
                                    <Input type="number" {...field} required />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField
                                control={form.control}
                                name="coachName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entraîneur</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {coaches.map((coach) => (
                                        <SelectItem key={coach.id} value={coach.name}>{coach.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
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
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                          {playerCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                          ))}
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
                     <div className="space-y-4">
                          <h4 className="text-lg font-medium border-b pb-2">Tuteur Légal (si mineur)</h4>
                          <FormField
                            control={form.control}
                            name="tutorName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom du tuteur</FormLabel>
                                <FormControl>
                                  <Input {...field} />
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
                                  <Input {...field} />
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
                                  <Input {...field} />
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
                                    <Input type="email" {...field} />
                                  </FormControl>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
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
                                    <Input type="url" {...field} />
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
                  <Button type="submit">Mettre à jour</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
