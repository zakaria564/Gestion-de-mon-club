"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Phone, HeartPulse, Banknote, User, Trophy, MapPin, Scale, Ruler, Droplet, Camera, Loader2, Mail, Hash, ShieldCheck } from "lucide-react";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersContext } from '@/context/players-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const playerSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  firstName: z.string().min(1, "Prénom requis"),
  birthDate: z.string().min(1, "Date requise"),
  birthPlace: z.string().optional(),
  gender: z.enum(['Masculin', 'Féminin']),
  country: z.string().min(1, "Nationalité requise"),
  category: z.string().min(1, "Catégorie requise"),
  poste: z.string().min(1, "Poste requis"),
  strongFoot: z.enum(['Droitier', 'Gaucher', 'Ambidextre']),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  jerseyNumber: z.coerce.number().min(1),
  tutorName: z.string().min(1, "Nom du tuteur requis"),
  parentId: z.string().optional(),
  phone: z.string().min(1, "Téléphone requis"),
  emergencyPhone: z.string().optional(),
  address: z.string().min(1, "Adresse requise"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  medicalConditions: z.string().optional(),
  medicalCertificateStatus: z.enum(['Fourni', 'Non fourni']),
  photo: z.string().url("URL invalide").optional().or(z.literal('')),
  cin: z.string().optional(),
  registrationFeeStatus: z.enum(['Payé', 'Non payé']),
  subscriptionType: z.enum(['Mensuel', 'Trimestriel', 'Annuel']),
  subscriptionAmount: z.coerce.number(),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

export function PlayerDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { updatePlayer, deletePlayer, getPlayerById, loading } = usePlayersContext();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const player = useMemo(() => getPlayerById(id), [id, getPlayerById]);
  
  const form = useForm<PlayerFormValues>({ 
    resolver: zodResolver(playerSchema),
    defaultValues: {} 
  });

  useEffect(() => {
    if (player && open) {
      form.reset({
        name: player.name || '',
        firstName: player.firstName || '',
        birthDate: player.birthDate || '',
        birthPlace: player.birthPlace || '',
        gender: player.gender || 'Masculin',
        country: player.country || 'Marocaine',
        category: player.category || 'Sénior',
        poste: player.poste || '',
        strongFoot: (player.strongFoot as any) || 'Droitier',
        height: player.height || 0,
        weight: player.weight || 0,
        jerseyNumber: player.jerseyNumber || 0,
        status: (player.status as any) || 'Actif',
        tutorName: player.tutorName || '',
        parentId: player.parentId || '',
        phone: player.phone || '',
        emergencyPhone: player.emergencyPhone || '',
        address: player.address || '',
        email: player.email || '',
        bloodGroup: player.bloodGroup || 'O+',
        medicalConditions: player.medicalConditions || '',
        medicalCertificateStatus: (player.medicalCertificateStatus as any) || 'Non fourni',
        photo: player.photo || '',
        cin: player.cin || '',
        registrationFeeStatus: (player.registrationFeeStatus as any) || 'Non payé',
        subscriptionType: (player.subscriptionType as any) || 'Mensuel',
        subscriptionAmount: player.subscriptionAmount || 0
      });
    }
  }, [player, open, form]);

  const onSubmit = async (data: PlayerFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePlayer({ ...player, ...data } as any);
      setOpen(false);
      toast({ title: "Fiche joueur mise à jour" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isSubmitting) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;
  if (!player) return notFound();

  // Matricule professionnel formaté
  const playerMatricule = `MF-${player.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
      </div>
      
      <Card className="overflow-hidden border-t-4 border-t-primary">
        <CardHeader className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-muted/20 pb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={player.photo} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {player.status}
            </Badge>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <CardTitle className="text-3xl font-black uppercase tracking-tight">{player.firstName} {player.name}</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto md:mx-0 font-mono text-sm py-1 px-3 border border-primary/20 bg-primary/10 text-primary flex items-center gap-2 shadow-sm">
                <ShieldCheck className="size-4" />
                Matricule : {playerMatricule}
              </Badge>
            </div>
            <p className="text-xl font-medium text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              {player.category} <span className="text-primary/40">•</span> {player.poste} <span className="text-primary/40">•</span> #{player.jerseyNumber}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* 1. ÉTAT CIVIL */}
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 font-black text-primary border-b-2 border-primary/10 pb-2 uppercase text-xs tracking-widest"><User className="size-4" /> État Civil</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Prénom</span> <span className="font-bold">{player.firstName}</span></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Nom</span> <span className="font-bold">{player.name}</span></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Date de Naissance</span> <span className="font-bold">{player.birthDate}</span></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Genre</span> <span className="font-bold">{player.gender}</span></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">CIN / ID</span> <span className="font-bold font-mono">{player.cin || 'N/A'}</span></div>
              </div>
            </div>

            {/* 2. SPORTIF */}
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 font-black text-primary border-b-2 border-primary/10 pb-2 uppercase text-xs tracking-widest"><Trophy className="size-4" /> Performance</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Catégorie</span> <Badge className="font-bold">{player.category}</Badge></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Pied Fort</span> <span className="font-bold text-primary">{player.strongFoot}</span></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Mensurations</span> <span className="font-bold">{player.height}cm / {player.weight}kg</span></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Numéro</span> <span className="font-black text-xl text-primary">#{player.jerseyNumber}</span></div>
              </div>
            </div>

            {/* 3. MÉDICAL */}
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 font-black text-primary border-b-2 border-primary/10 pb-2 uppercase text-xs tracking-widest"><HeartPulse className="size-4" /> Médical</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Groupe Sanguin</span> <Badge variant="destructive" className="font-black">{player.bloodGroup || '?'}</Badge></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Certificat</span> <Badge variant={player.medicalCertificateStatus === 'Fourni' ? 'default' : 'destructive'} className="font-bold">{player.medicalCertificateStatus}</Badge></div>
                <div className="space-y-2 mt-2">
                  <span className="text-xs font-black uppercase text-muted-foreground">Allergies & Conditions</span>
                  <div className="p-3 bg-muted rounded-md text-xs font-medium min-h-[60px] italic">
                    {player.medicalConditions || 'Aucune condition signalée.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CONTACT */}
            <div className="space-y-5 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-black text-primary border-b-2 border-primary/10 pb-2 uppercase text-xs tracking-widest"><Phone className="size-4" /> Contact & Administration</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Tuteur</span> <span className="font-bold">{player.tutorName}</span></div>
                  <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Téléphone</span> <span className="font-bold text-primary">{player.phone}</span></div>
                  <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Urgence</span> <span className="font-bold text-destructive">{player.emergencyPhone || 'N/A'}</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-muted/30 p-2 rounded"><MapPin className="size-4 mt-1 text-primary" /> <div><span className="block text-xs text-muted-foreground font-bold uppercase">Adresse</span><span className="font-medium">{player.address}</span></div></div>
                  {player.email && <div className="flex items-start gap-3 bg-muted/30 p-2 rounded"><Mail className="size-4 mt-1 text-primary" /> <div><span className="block text-xs text-muted-foreground font-bold uppercase">Email</span><span className="font-medium">{player.email}</span></div></div>}
                </div>
              </div>
            </div>

            {/* 5. FINANCIER */}
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 font-black text-primary border-b-2 border-primary/10 pb-2 uppercase text-xs tracking-widest"><Banknote className="size-4" /> Trésorerie</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Inscription</span> <Badge variant={player.registrationFeeStatus === 'Payé' ? 'default' : 'destructive'} className="font-bold">{player.registrationFeeStatus}</Badge></div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded"><span className="text-muted-foreground font-semibold">Abonnement</span> <span className="font-bold">{player.subscriptionType}</span></div>
                <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg border border-primary/20 mt-2">
                  <span className="font-black text-primary uppercase text-xs">Mensualité</span> 
                  <span className="text-xl font-black text-primary">{player.subscriptionAmount} DH</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/10 p-6">
          <Button variant="outline" size="lg" onClick={() => setOpen(true)} className="font-bold">
            <Edit className="h-4 w-4 mr-2" /> Modifier la fiche
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="font-bold">
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce joueur ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les données liées à ce joueur seront définitivement effacées de la plateforme Maestro Foot.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={async () => { await deletePlayer(id); router.push('/players'); }}>
                  Confirmer la suppression
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      {/* FORMULAIRE DE MODIFICATION COMPLET */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Edit className="text-primary" /> Modifier le joueur - Maestro Foot
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-10">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center gap-4 bg-muted/20 p-6 rounded-xl border-2 border-dashed border-primary/20">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                      <AvatarImage src={form.watch('photo')} />
                      <AvatarFallback><Camera className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <FormField control={form.control} name="photo" render={({field}) => (
                      <FormItem className="w-full max-w-md">
                        <FormLabel className="font-bold text-center block">URL de la Photo de profil</FormLabel>
                        <Input {...field} placeholder="https://..." className="bg-background" />
                      </FormItem>
                    )} />
                  </div>

                  {/* 1. ÉTAT CIVIL */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><User className="size-4" /> 1. Identité & État Civil</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3 space-y-2">
                        <Label className="text-primary font-black uppercase text-[10px] tracking-widest">Matricule Officiel Maestro Foot</Label>
                        <Input value={playerMatricule} readOnly className="bg-muted font-mono font-bold text-primary border-primary/20 h-12 text-lg" />
                      </div>
                      <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel className="font-bold">Nom</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="firstName" render={({field}) => <FormItem><FormLabel className="font-bold">Prénom</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="gender" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Sexe</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Masculin">Garçon</SelectItem><SelectItem value="Féminin">Fille</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel className="font-bold">Date de Naissance</FormLabel><Input type="date" {...field} /></FormItem>} />
                      <FormField control={form.control} name="birthPlace" render={({field}) => <FormItem><FormLabel className="font-bold">Lieu de Naissance</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="country" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Nationalité</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* 2. SPORTIF */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><Trophy className="size-4" /> 2. Informations Sportives</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="category" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel className="font-bold">Poste</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="strongFoot" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Pied Fort</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Droitier">Droitier</SelectItem><SelectItem value="Gaucher">Gaucher</SelectItem><SelectItem value="Ambidextre">Ambidextre</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="height" render={({field}) => <FormItem><FormLabel className="font-bold">Taille (cm)</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="weight" render={({field}) => <FormItem><FormLabel className="font-bold">Poids (kg)</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel className="font-bold">N° Maillot</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="status" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Statut Actuel</FormLabel>
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

                  {/* 3. CONTACT & PARENTS */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><Phone className="size-4" /> 3. Contact & Parents</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel className="font-bold">Nom du Tuteur</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="parentId" render={({field}) => <FormItem><FormLabel className="font-bold">parentID (Lien Plateforme)</FormLabel><Input {...field} placeholder="UID Firebase du parent" /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel className="font-bold">Téléphone Principal</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="emergencyPhone" render={({field}) => <FormItem><FormLabel className="font-bold">Téléphone d'urgence</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="address" render={({field}) => <FormItem className="md:col-span-2"><FormLabel className="font-bold">Adresse Complète</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="email" render={({field}) => <FormItem className="md:col-span-2"><FormLabel className="font-bold">Email de contact</FormLabel><Input type="email" {...field} /></FormItem>} />
                    </div>
                  </div>

                  {/* 4. DOSSIER MÉDICAL */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><HeartPulse className="size-4" /> 4. Dossier Médical & Documents</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="bloodGroup" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Groupe Sanguin</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="medicalCertificateStatus" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Certificat Médical</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Fourni">Fourni</SelectItem><SelectItem value="Non fourni">Non fourni</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel className="font-bold">N° CIN / Livret Famille</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="medicalConditions" render={({field}) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="font-bold">Allergies / Traitements / Conditions particulières</FormLabel>
                          <Input {...field} placeholder="Précisez ici toute information médicale vitale..." />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* 5. FINANCIER */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><Banknote className="size-4" /> 5. Suivi Financier</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="registrationFeeStatus" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Frais d'inscription</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Payé">Payé</SelectItem><SelectItem value="Non payé">Non payé</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subscriptionType" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Type d'abonnement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Mensuel">Mensuel</SelectItem><SelectItem value="Trimestriel">Trimestriel</SelectItem><SelectItem value="Annuel">Annuel</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subscriptionAmount" render={({field}) => (
                        <FormItem>
                          <FormLabel className="font-bold">Montant de la Cotisation (DH)</FormLabel>
                          <Input type="number" {...field} />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-6 border-t bg-muted/30 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="font-bold">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold min-w-[150px]">
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...</> : "Mettre à jour la fiche"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}