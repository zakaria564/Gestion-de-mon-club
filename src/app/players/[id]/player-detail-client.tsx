
'use client';

import { useMemo, useState, useEffect } from 'react';
import React from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Edit, Trash2, Camera, Home, Shirt, Phone, Flag, Shield, Mail, MapPin, PlusCircle, X, VenetianMask, UserSquare, UserCheck } from "lucide-react";
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useCoachesContext } from '@/context/coaches-context';

const documentSchema = z.object({
  name: z.string().min(1, "Le nom du document est requis."),
  url: z.string().url("Veuillez entrer une URL valide.").min(1, "L'URL est requise."),
  expirationDate: z.string().optional(),
});

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise", "Américaine", "Russe", "Japonaise", "Chinoise", "Indienne", "Turque", "Égyptienne", "Nigériane", "Sud-africaine", "Ghanéenne"];
const documentOptions = ["Certificat Médical", "Carte d'identité", "Passeport", "Extrait de naissance", "Photo d'identité", "Autorisation Parentale", "Licence sportive", "Assurance", "Autre"];

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
  coachName: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))', 'U23': 'hsl(var(--chart-2))', 'U20': 'hsl(340, 80%, 55%)', 'U19': 'hsl(var(--chart-3))', 'U18': 'hsl(var(--chart-4))', 'U17': 'hsl(var(--chart-5))', 'U16': 'hsl(var(--chart-6))', 'U15': 'hsl(var(--chart-7))', 'U13': 'hsl(var(--chart-8))', 'U9': 'hsl(25 60% 45%)', 'U11': 'hsl(var(--chart-10))', 'U7': 'hsl(var(--chart-11))',
};

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
  
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "documents" });

   useEffect(() => {
    if (player && dialogOpen) {
      const documents = player.documents?.map(doc => ({
        name: doc.name || '',
        url: doc.url || '',
        expirationDate: doc.expirationDate && isValid(parseISO(doc.expirationDate)) ? format(parseISO(doc.expirationDate), 'yyyy-MM-dd') : ''
      })) || [];

      form.reset({
        name: player.name || '',
        birthDate: player.birthDate && isValid(parseISO(player.birthDate)) ? format(parseISO(player.birthDate), 'yyyy-MM-dd') : '',
        phone: player.phone || '',
        email: player.email || '',
        address: player.address || '',
        poste: player.poste || '',
        jerseyNumber: player.jerseyNumber || 0,
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
        documents,
      });
    }
  }, [player, dialogOpen, form]);


  if (loading || coachesLoading) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;
  if (!player) return notFound();

  const onSubmit = async (data: PlayerFormValues) => {
    await updatePlayer({ ...player, ...data, id: player.id, uid: player.uid } as Player);
    setDialogOpen(false);
    toast({ title: "Joueur mis à jour" });
  };
  
  const handleDeletePlayer = async () => {
    router.push('/players');
    await deletePlayer(id);
    toast({ variant: "destructive", title: "Joueur supprimé" });
  };

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
      <Button variant="ghost" onClick={() => router.back()} className="flex items-center text-sm text-muted-foreground p-0 h-auto">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={player.photo || undefined} alt={player.name} />
            <AvatarFallback className="text-4xl">{player.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Identité & Contact</h3>
                 <div className="flex items-center gap-4"><VenetianMask className="h-5 w-5 text-muted-foreground" /><span>{player.gender}</span></div>
                 <div className="flex items-center gap-4"><Cake className="h-5 w-5 text-muted-foreground" /><span>{formattedBirthDate}</span></div>
                 {player.cin && <div className="flex items-center gap-4"><UserSquare className="h-5 w-5 text-muted-foreground" /><span>{player.cin}</span></div>}
                 {player.email && <div className="flex items-center gap-4"><Mail className="h-5 w-5 text-muted-foreground" /><a href={`mailto:${player.email}`} className="text-primary hover:underline">{player.email}</a></div>}
                 <div className="flex items-center gap-4"><Phone className="h-5 w-5 text-muted-foreground" /><a href={`tel:${player.phone}`} className="text-primary hover:underline">{player.phone}</a></div>
                 <div className="flex items-center gap-4"><MapPin className="h-5 w-5 text-muted-foreground" /><span>{player.address}</span></div>
                 <div className="flex items-center gap-4"><Flag className="h-5 w-5 text-muted-foreground" /><span>{player.country}</span></div>
            </div>
            
            {(player.tutorName || player.tutorPhone || player.tutorEmail) && (
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tuteur Légal</h3>
                  {player.tutorName && <div className="flex items-center gap-4"><Shield className="h-5 w-5 text-muted-foreground" /><span>{player.tutorName}</span></div>}
                  {player.tutorPhone && <div className="flex items-center gap-4"><Phone className="h-5 w-5 text-muted-foreground" /><span>{player.tutorPhone}</span></div>}
                  {player.tutorEmail && <div className="flex items-center gap-4"><Mail className="h-5 w-5 text-muted-foreground" /><span>{player.tutorEmail}</span></div>}
              </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Club</h3>
                <div className="flex items-center gap-4"><Shirt className="h-5 w-5 text-muted-foreground" /><span>{player.poste} - <Badge variant="outline">#{player.jerseyNumber}</Badge></span></div>
                <div className="flex items-center gap-4"><Home className="h-5 w-5 text-muted-foreground" /><span><Badge style={{ backgroundColor: categoryColors[player.category.replace(' F', '')], color: 'white' }}>{player.category}</Badge></span></div>
                <div className="flex items-center gap-4"><UserCheck className="h-5 w-5 text-muted-foreground" /><span>Entraîneur: {player.coachName || 'Non assigné'}</span></div>
                <div className="flex items-center gap-4"><Shirt className="h-5 w-5 text-muted-foreground" /><span>Statut : <Badge variant={getBadgeVariant(player.status) as any}>{player.status}</Badge></span></div>
            </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(true)}><Edit className="h-4 w-4 mr-2" /> Modifier</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeletePlayer}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Modifier un joueur</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-8">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24 border">
                        <AvatarImage src={form.watch('photo')} /><AvatarFallback className="bg-muted"><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                      </Avatar>
                      <FormField control={form.control} name="photo" render={({field}) => <FormItem className="w-full max-w-sm"><FormLabel>URL Photo</FormLabel><Input {...field} placeholder="https://..." /></FormItem>} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase text-primary border-b pb-1">Identité & Contact</h4>
                        <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom complet</FormLabel><Input {...field} required /></FormItem>} />
                        <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel>Date de naissance</FormLabel><Input type="date" {...field} required /></FormItem>} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="gender" render={({field}) => (
                            <FormItem><FormLabel>Genre</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="country" render={({field}) => (
                            <FormItem><FormLabel>Nationalité</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel>N° CIN</FormLabel><Input {...field} /></FormItem>} />
                        <FormField control={form.control} name="email" render={({field}) => <FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} /></FormItem>} />
                        <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone</FormLabel><Input {...field} required /></FormItem>} />
                        <FormField control={form.control} name="address" render={({field}) => <FormItem><FormLabel>Adresse</FormLabel><Input {...field} required /></FormItem>} />
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase text-primary border-b pb-1">Sportif</h4>
                        <FormField control={form.control} name="category" render={({field}) => (
                          <FormItem><FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="poste" render={({field}) => (
                          <FormItem><FormLabel>Poste</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Gardien">Gardien</SelectItem><SelectItem value="Défenseur Central">Défenseur Central</SelectItem><SelectItem value="Latéral Droit">Latéral Droit</SelectItem><SelectItem value="Latéral Gauche">Latéral Gauche</SelectItem><SelectItem value="Milieu Défensif">Milieu Défensif</SelectItem><SelectItem value="Milieu Central">Milieu Central</SelectItem><SelectItem value="Milieu Offensif">Milieu Offensif</SelectItem><SelectItem value="Ailier Droit">Ailier Droit</SelectItem><SelectItem value="Ailier Gauche">Ailier Gauche</SelectItem><SelectItem value="Avant-centre">Avant-centre</SelectItem></SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel>N° Maillot</FormLabel><Input type="number" {...field} required /></FormItem>} />
                        <FormField control={form.control} name="coachName" render={({field}) => (
                          <FormItem><FormLabel>Entraîneur</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>{coaches.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="status" render={({field}) => (
                          <FormItem><FormLabel>Statut</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Blessé">Blessé</SelectItem><SelectItem value="Suspendu">Suspendu</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase text-primary border-b pb-1">Tuteur</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel>Nom tuteur</FormLabel><Input {...field} /></FormItem>} />
                        <FormField control={form.control} name="tutorPhone" render={({field}) => <FormItem><FormLabel>Téléphone tuteur</FormLabel><Input {...field} /></FormItem>} />
                        <FormField control={form.control} name="tutorEmail" render={({field}) => <FormItem><FormLabel>Email tuteur</FormLabel><Input type="email" {...field} /></FormItem>} />
                        <FormField control={form.control} name="tutorCin" render={({field}) => <FormItem><FormLabel>N° CIN tuteur</FormLabel><Input {...field} /></FormItem>} />
                      </div>
                    </div>
                    <div className="space-y-4 pb-10">
                      <h4 className="font-bold text-sm uppercase text-primary border-b pb-1">Documents</h4>
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative bg-muted/20">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                          <FormField control={form.control} name={`documents.${index}.name`} render={({field}) => (
                            <FormItem><FormLabel>Nom du doc</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{documentOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`documents.${index}.url`} render={({field}) => <FormItem><FormLabel>Lien (URL)</FormLabel><Input {...field} /></FormItem>} />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", url: "" })}><PlusCircle className="mr-2 h-4 w-4" />Ajouter un document</Button>
                    </div>
                  </div>
                </div>
                <DialogFooter className="p-6 border-t bg-background flex gap-2 shrink-0">
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
