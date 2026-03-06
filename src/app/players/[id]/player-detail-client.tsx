"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cake, Edit, Trash2, Home, Shirt, Phone, Flag, Mail, MapPin, PlusCircle, X, VenetianMask, UserSquare, UserCheck, ExternalLink, FileText, Camera, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useCoachesContext } from '@/context/coaches-context';

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne"];
const documentOptions = ["Certificat Médical", "Carte d'identité", "Passeport", "Extrait de naissance", "Photo d'identité", "Licence sportive", "Assurance", "Autre"];

const playerSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  birthDate: z.string().min(1, "Date requise"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  address: z.string().min(1, "Adresse requise"),
  poste: z.string().min(1, "Poste requis"),
  jerseyNumber: z.coerce.number().min(1),
  photo: z.string().url("URL invalide").optional().or(z.literal('')),
  cin: z.string().optional(),
  country: z.string().min(1, "Nationalité requise"),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.string().min(1, "Catégorie requise"),
  gender: z.enum(['Masculin', 'Féminin']),
  coachName: z.string().optional(),
  documents: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

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

export function PlayerDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const context = usePlayersContext();
  const coachesContext = useCoachesContext();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loading, updatePlayer, deletePlayer, getPlayerById } = context;
  const { coaches } = coachesContext;
  
  const player = useMemo(() => getPlayerById(id), [id, getPlayerById]);
  
  const form = useForm<PlayerFormValues>({ 
    resolver: zodResolver(playerSchema), 
    defaultValues: { 
      name: '', 
      birthDate: '', 
      phone: '', 
      email: '', 
      address: '', 
      poste: '', 
      jerseyNumber: 0, 
      photo: '', 
      country: 'Marocaine', 
      cin: '', 
      status: 'Actif', 
      category: 'Sénior', 
      gender: 'Masculin', 
      coachName: '', 
      documents: [] 
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "documents" });

  useEffect(() => {
    if (player && open) {
      form.reset({
        name: player.name || '',
        birthDate: player.birthDate || '',
        phone: player.phone || '',
        email: player.email || '',
        address: player.address || '',
        poste: player.poste || '',
        jerseyNumber: player.jerseyNumber || 0,
        photo: player.photo || '',
        country: player.country || 'Marocaine',
        cin: player.cin || '',
        status: player.status || 'Actif',
        category: player.category || 'Sénior',
        gender: player.gender || 'Masculin',
        coachName: player.coachName || '',
        documents: player.documents || [],
      });
    }
  }, [player, open, form]);

  const onSubmit = async (data: PlayerFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePlayer({ ...player, ...data } as any);
      setOpen(false);
      toast({ title: "Joueur mis à jour avec succès" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la mise à jour" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isSubmitting) {
    return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;
  }

  if (!player) return notFound();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={player.photo || undefined} />
            <AvatarFallback className="text-4xl">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Identité</h3>
            <div className="flex items-center gap-3"><VenetianMask className="h-4 w-4 text-muted-foreground" /><span>{player.gender}</span></div>
            <div className="flex items-center gap-3"><Cake className="h-4 w-4 text-muted-foreground" /><span>{player.birthDate}</span></div>
            <div className="flex items-center gap-3"><UserSquare className="h-4 w-4 text-muted-foreground" /><span>CIN: {player.cin || 'N/A'}</span></div>
            <div className="flex items-center gap-3"><Flag className="h-4 w-4 text-muted-foreground" /><span>{player.country}</span></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Contact</h3>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{player.email || 'Pas d\'email'}</span></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{player.phone}</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{player.address}</span></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Club</h3>
            <div className="flex items-center gap-3"><Shirt className="h-4 w-4 text-muted-foreground" /><span>{player.poste} (# {player.jerseyNumber})</span></div>
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-muted-foreground" />
              <Badge style={{ backgroundColor: categoryColors[player.category] || 'hsl(var(--primary))', color: 'white' }}>{player.category}</Badge>
            </div>
            <div className="flex items-center gap-3"><UserCheck className="h-4 w-4 text-muted-foreground" /><span>{player.coachName || 'Sans coach'}</span></div>
            <Badge variant="outline">{player.status}</Badge>
          </div>
          {player.documents && player.documents.length > 0 && (
            <div className="md:col-span-3 mt-4 space-y-4">
              <h3 className="text-lg font-semibold border-b pb-1">Documents</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {player.documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{d.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={d.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-6">
          <Button variant="outline" onClick={() => setOpen(true)}><Edit className="h-4 w-4 mr-2" /> Modifier</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={async () => { await deletePlayer(id); router.push('/players'); }}>Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le joueur</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <SelectContent>
                          <SelectItem value="Actif">Actif</SelectItem>
                          <SelectItem value="Blessé">Blessé</SelectItem>
                          <SelectItem value="Suspendu">Suspendu</SelectItem>
                          <SelectItem value="Inactif">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase text-primary border-b pb-1">Documents</h4>
                {fields.map((f, i) => (
                  <div key={f.id} className="p-4 border rounded-md relative bg-muted/20 space-y-4">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <FormField control={form.control} name={`documents.${i}.name`} render={({field}) => (
                      <FormItem><FormLabel>Nom du document</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>{documentOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`documents.${i}.url`} render={({field}) => (
                      <FormItem><FormLabel>Lien URL</FormLabel><Input {...field} /></FormItem>
                    )} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", url: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un document
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...</> : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}