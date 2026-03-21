"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Phone, HeartPulse, Banknote, User, Trophy, MapPin, Scale, Ruler, Droplet, Camera, Loader2, Mail, Hash, ShieldCheck, QrCode } from "lucide-react";
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
  
  codeMassar: z.string().optional(),
  licenceNumber: z.string().optional(),

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
        codeMassar: player.codeMassar || '',
        licenceNumber: player.licenceNumber || '',
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
      toast({ title: "Fiche officielle mise à jour" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isSubmitting) return <div className="p-8 text-center animate-pulse"><Skeleton className="h-[600px] w-full rounded-[40px]" /></div>;
  if (!player) return notFound();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-muted/5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-full hover:bg-primary/10 text-primary font-black uppercase text-xs italic tracking-tighter">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au vestiaire
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full shadow-sm"><QrCode className="mr-2 h-4 w-4" /> Carte Digitale</Button>
        </div>
      </div>
      
      <Card className="overflow-hidden border-none shadow-2xl rounded-[40px] bg-card">
        <CardHeader className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10">
          <div className="relative">
            <Avatar className="h-48 w-48 border-8 border-background shadow-2xl rounded-3xl">
              <AvatarImage src={player.photo} className="object-cover" />
              <AvatarFallback className="text-6xl bg-primary text-white font-black">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 text-sm font-black uppercase tracking-[0.2em] shadow-xl border-4 border-background">
              {player.status}
            </Badge>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4 pt-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <CardTitle className="text-5xl font-black uppercase tracking-tighter italic text-primary">{player.firstName} {player.name}</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto md:mx-0 font-mono text-lg py-2 px-6 border-2 border-primary/20 bg-background text-primary flex items-center gap-3 shadow-lg rounded-2xl">
                <ShieldCheck className="size-6" />
                {player.professionalId || `MAE-${new Date().getFullYear().toString().slice(-2)}-${player.category}-000`}
              </Badge>
            </div>
            <p className="text-2xl font-black text-muted-foreground flex items-center justify-center md:justify-start gap-4 uppercase tracking-tighter">
              {player.category} <span className="text-primary">•</span> {player.poste} <span className="text-primary">•</span> <span className="text-primary text-4xl italic">#{player.jerseyNumber}</span>
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            <div className="space-y-6">
              <h3 className="flex items-center gap-3 font-black text-primary border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><User className="size-5" /> Identité Officielle</h3>
              <div className="grid gap-4">
                <div className="bg-muted/30 p-4 rounded-2xl border-l-4 border-primary shadow-sm">
                  <span className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Matricule Maestro Pro</span>
                  <span className="text-lg font-black font-mono text-primary tracking-tighter">{player.professionalId || 'Génération en cours...'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/20 p-3 rounded-xl border border-muted/30">
                    <span className="block text-[10px] font-black uppercase text-muted-foreground">Code MASSAR</span>
                    <span className="font-black text-sm">{player.codeMassar || 'N/A'}</span>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-xl border border-muted/30">
                    <span className="block text-[10px] font-black uppercase text-muted-foreground">Licence FRMF</span>
                    <span className="font-black text-sm">{player.licenceNumber || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl"><span className="text-muted-foreground text-xs font-bold uppercase">Né le</span> <span className="font-black">{player.birthDate}</span></div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl"><span className="text-muted-foreground text-xs font-bold uppercase">À</span> <span className="font-black truncate max-w-[120px]">{player.birthPlace || 'N/A'}</span></div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl"><span className="text-muted-foreground text-xs font-bold uppercase">Nationalité</span> <span className="font-black">{player.country}</span></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-3 font-black text-primary border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><Trophy className="size-5" /> Profil Terrain</h3>
              <div className="grid gap-4">
                <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border-2 border-primary/10">
                  <span className="font-black text-primary uppercase text-xs">Pied Fort</span> 
                  <span className="font-black text-xl text-primary italic uppercase">{player.strongFoot}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center bg-muted/10 p-4 rounded-2xl">
                    <Ruler className="size-5 text-primary mb-2" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Taille</span>
                    <span className="text-lg font-black">{player.height} cm</span>
                  </div>
                  <div className="flex flex-col items-center bg-muted/10 p-4 rounded-2xl">
                    <Scale className="size-5 text-primary mb-2" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Poids</span>
                    <span className="text-lg font-black">{player.weight} kg</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl"><span className="text-muted-foreground text-xs font-bold uppercase">Poste</span> <Badge className="font-black uppercase tracking-tighter">{player.poste}</Badge></div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl"><span className="text-muted-foreground text-xs font-bold uppercase">Maillot</span> <span className="font-black text-2xl italic">#{player.jerseyNumber}</span></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-3 font-black text-primary border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><HeartPulse className="size-5" /> Suivi Santé</h3>
              <div className="grid gap-4 text-sm">
                <div className="flex justify-between items-center bg-destructive/5 p-4 rounded-2xl border-2 border-destructive/10">
                  <span className="font-black text-destructive uppercase text-xs">Groupe Sanguin</span> 
                  <Badge variant="destructive" className="font-black text-lg px-4">{player.bloodGroup || '?'}</Badge>
                </div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl">
                  <span className="text-muted-foreground text-xs font-bold uppercase">Certificat</span> 
                  <Badge variant={player.medicalCertificateStatus === 'Fourni' ? 'default' : 'destructive'} className="font-black uppercase text-[10px]">{player.medicalCertificateStatus}</Badge>
                </div>
                <div className="space-y-3 mt-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Observations & Allergies</span>
                  <div className="p-4 bg-muted/20 rounded-2xl text-xs font-bold italic border border-muted/30 min-h-[100px] leading-relaxed">
                    {player.medicalConditions || 'RAS - Aucune condition signalée.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <h3 className="flex items-center gap-3 font-black text-primary border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><Phone className="size-5" /> Dossier Administratif & Tuteur</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-muted/10 p-4 rounded-2xl">
                    <span className="block text-[10px] font-black uppercase text-muted-foreground mb-1">Nom du Tuteur</span>
                    <span className="text-lg font-black uppercase italic">{player.tutorName}</span>
                  </div>
                  <div className="flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <Phone className="size-4 text-primary" />
                    <span className="font-black text-primary">{player.phone}</span>
                  </div>
                  <div className="flex justify-between items-center bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                    <span className="text-[10px] font-black uppercase text-destructive tracking-tighter">Urgence</span>
                    <span className="font-black text-destructive">{player.emergencyPhone || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/10 p-4 rounded-2xl flex gap-4">
                    <MapPin className="size-6 text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] font-black uppercase text-muted-foreground mb-1">Résidence</span>
                      <span className="text-sm font-bold leading-tight">{player.address}</span>
                    </div>
                  </div>
                  {player.email && (
                    <div className="bg-muted/10 p-4 rounded-2xl flex gap-4">
                      <Mail className="size-6 text-primary shrink-0" />
                      <div>
                        <span className="block text-[10px] font-black uppercase text-muted-foreground mb-1">Email de contact</span>
                        <span className="text-sm font-bold truncate block max-w-[200px]">{player.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-3 font-black text-primary border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><Banknote className="size-5" /> Trésorerie</h3>
              <div className="grid gap-4">
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl">
                  <span className="text-muted-foreground text-xs font-bold uppercase">Adhésion</span> 
                  <Badge variant={player.registrationFeeStatus === 'Payé' ? 'default' : 'destructive'} className="font-black uppercase text-[10px]">{player.registrationFeeStatus}</Badge>
                </div>
                <div className="flex justify-between items-center bg-muted/10 p-3 rounded-xl">
                  <span className="text-muted-foreground text-xs font-bold uppercase">Contrat</span> 
                  <span className="font-black uppercase tracking-tighter">{player.subscriptionType}</span>
                </div>
                <div className="flex flex-col items-center bg-primary p-6 rounded-[32px] text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <span className="font-black uppercase text-[10px] tracking-[0.3em] mb-2 opacity-80">Mensualité</span> 
                  <span className="text-4xl font-black italic">{player.subscriptionAmount} <small className="text-base uppercase not-italic">DH</small></span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-4 border-t border-muted/30 bg-muted/5 p-8">
          <Button variant="outline" size="lg" onClick={() => setOpen(true)} className="rounded-2xl px-8 font-black uppercase text-xs tracking-widest border-2 h-14">
            <Edit className="h-4 w-4 mr-2" /> RECTIFIER LA FICHE
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="rounded-2xl px-8 font-black uppercase text-xs tracking-widest h-14 shadow-lg shadow-destructive/20">
                <Trash2 className="h-4 w-4 mr-2" /> RADIATION DU JOUEUR
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[32px] border-none shadow-2xl bg-background">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-destructive">Radiation de l'effectif ?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold text-sm leading-relaxed text-muted-foreground">
                  Cette opération est irréversible. Le matricule <span className="text-primary">{player.professionalId}</span> sera désactivé et toutes les archives Maestro Foot liées à ce licencié seront supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl font-black uppercase text-xs tracking-widest border-none bg-muted/50">Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={async () => { await deletePlayer(id); router.push('/players'); }} className="rounded-xl font-black uppercase text-xs tracking-widest bg-destructive hover:bg-destructive/90 text-white">
                  Confirmer la Radiation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-[32px] border-none bg-background">
          <DialogHeader className="p-8 border-b bg-primary/5">
            <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter text-primary italic">
              <Edit className="text-primary h-7 w-7" /> Rectifier la Licence Maestro
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-10 py-8">
                <div className="space-y-12">
                  
                  <div className="flex flex-col items-center gap-6 bg-primary/5 p-8 rounded-[32px] border-2 border-dashed border-primary/20">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                      <AvatarImage src={form.watch('photo')} />
                      <AvatarFallback><Camera className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <FormField control={form.control} name="photo" render={({field}) => (
                      <FormItem className="w-full max-w-md">
                        <FormLabel className="font-black text-center block text-primary uppercase text-[10px] tracking-widest">URL de la Photo de profil</FormLabel>
                        <Input {...field} placeholder="https://..." className="bg-background rounded-xl h-12 border-none shadow-sm" />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-primary font-black border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic">
                      <Hash className="size-5" /> 1. Identité & Officiel
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-3 bg-muted/30 p-4 rounded-2xl border-l-4 border-primary">
                        <Label className="text-primary font-black uppercase text-[10px] tracking-widest mb-2 block">Matricule Officiel Maestro Foot</Label>
                        <Input value={player.professionalId || `MAE-${new Date().getFullYear().toString().slice(-2)}-${player.category}-000`} readOnly className="bg-transparent border-none font-mono font-black text-primary text-xl p-0 h-auto cursor-default focus-visible:ring-0" />
                      </div>
                      <FormField control={form.control} name="codeMassar" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-[10px] text-muted-foreground">Code MASSAR</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="licenceNumber" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-[10px] text-muted-foreground">Licence FRMF</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <div className="hidden md:block"></div>
                      <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Nom</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="firstName" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Prénom</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="gender" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Genre</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Masculin">Garçon</SelectItem><SelectItem value="Féminin">Fille</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Date de Naissance</FormLabel><Input type="date" {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="birthPlace" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Lieu de Naissance</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="country" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Nationalité</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-primary font-black border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><Trophy className="size-5" /> 2. Informations Sportives</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormField control={form.control} name="category" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Poste</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="strongFoot" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Pied Fort</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Droitier">Droitier</SelectItem><SelectItem value="Gaucher">Gaucher</SelectItem><SelectItem value="Ambidextre">Ambidextre</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="height" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Taille (cm)</FormLabel><Input type="number" {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="weight" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Poids (kg)</FormLabel><Input type="number" {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">N° Maillot</FormLabel><Input type="number" {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="status" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Statut Actuel</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
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

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-primary font-black border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><Phone className="size-5" /> 3. Contact & Parents</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Nom du Tuteur</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="parentId" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">parentID (UID)</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Téléphone Principal</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="emergencyPhone" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Téléphone d'urgence</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="address" render={({field}) => <FormItem className="md:col-span-2"><FormLabel className="font-black uppercase text-xs">Adresse Complète</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="email" render={({field}) => <FormItem className="md:col-span-2"><FormLabel className="font-black uppercase text-xs">Email de contact</FormLabel><Input type="email" {...field} className="h-12 rounded-xl" /></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-primary font-black border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><HeartPulse className="size-5" /> 4. Dossier Médical</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormField control={form.control} name="bloodGroup" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Groupe Sanguin</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="medicalCertificateStatus" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Certificat Médical</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Fourni">Fourni</SelectItem><SelectItem value="Non fourni">Non fourni</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">N° CIN / Livret</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="medicalConditions" render={({field}) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="font-black uppercase text-xs text-destructive">Allergies / Traitements</FormLabel>
                          <Input {...field} placeholder="Précisez ici toute information vitale..." className="h-12 rounded-xl bg-destructive/5" />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-primary font-black border-b-4 border-primary/10 pb-3 uppercase text-xs tracking-widest italic"><Banknote className="size-5" /> 5. Suivi Financier</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormField control={form.control} name="registrationFeeStatus" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Frais d'inscription</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Payé">Payé</SelectItem><SelectItem value="Non payé">Non payé</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subscriptionType" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Type d'abonnement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Mensuel">Mensuel</SelectItem><SelectItem value="Trimestriel">Trimestriel</SelectItem><SelectItem value="Annuel">Annuel</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subscriptionAmount" render={({field}) => (
                        <FormItem>
                          <FormLabel className="font-black uppercase text-xs">Montant Cotisation (DH)</FormLabel>
                          <Input type="number" {...field} className="h-12 rounded-xl bg-primary/5 font-black text-primary" />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-8 border-t bg-muted/10 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-14 flex-1 rounded-2xl font-black uppercase text-sm tracking-tighter shadow-2xl">
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Mise à jour...</> : "Mettre à jour la fiche officielle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}