"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { Player } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Phone, HeartPulse, Banknote, User, Trophy, MapPin, Scale, Ruler, Droplet, Camera, Loader2, Mail, Hash } from "lucide-react";
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border"><AvatarImage src={player.photo} /><AvatarFallback className="text-4xl">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-3xl font-bold">{player.firstName} {player.name}</CardTitle>
              <Badge variant="outline" className="font-mono text-xs"><Hash className="size-3 mr-1" />{player.id.substring(0, 8).toUpperCase()}</Badge>
            </div>
            <p className="text-muted-foreground">{player.category} - {player.poste} #{player.jerseyNumber}</p>
          </div>
          <Badge variant={player.status === 'Actif' ? 'default' : 'secondary'} className="text-lg px-4">{player.status}</Badge>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-primary border-b pb-1 uppercase text-sm"><User className="size-4" /> Identité</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Matricule :</span> <span className="font-mono font-bold text-primary">{player.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Prénom :</span> <span className="font-medium">{player.firstName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Nom :</span> <span className="font-medium">{player.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Né le :</span> <span className="font-medium">{player.birthDate} {player.birthPlace ? `à ${player.birthPlace}` : ''}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sexe :</span> <span className="font-medium">{player.gender === 'Masculin' ? 'Garçon' : 'Fille'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CIN/ID :</span> <span className="font-medium">{player.cin || 'N/A'}</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-primary border-b pb-1 uppercase text-sm"><Trophy className="size-4" /> Performance</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between items-center"><span className="text-muted-foreground"><Scale className="size-3 inline mr-1" /> Poids :</span> <span className="font-medium">{player.weight ? `${player.weight} kg` : 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground"><Ruler className="size-3 inline mr-1" /> Taille :</span> <span className="font-medium">{player.height ? `${player.height} cm` : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pied Fort :</span> <Badge variant="outline">{player.strongFoot || 'Droitier'}</Badge></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-primary border-b pb-1 uppercase text-sm"><HeartPulse className="size-4" /> Médical</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between items-center"><span className="text-muted-foreground"><Droplet className="size-3 inline mr-1 text-destructive" /> Groupe Sanguin :</span> <Badge variant="destructive">{player.bloodGroup || '?'}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Certificat :</span> <Badge variant={player.medicalCertificateStatus === 'Fourni' ? 'default' : 'destructive'}>{player.medicalCertificateStatus}</Badge></div>
                <div className="space-y-1 mt-2">
                  <span className="text-muted-foreground">Conditions / Allergies :</span>
                  <p className="p-2 bg-muted rounded text-xs">{player.medicalConditions || 'Aucune condition signalée.'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-primary border-b pb-1 uppercase text-sm"><Phone className="size-4" /> Contact</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tuteur :</span> <span className="font-medium">{player.tutorName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tél. Principal :</span> <span className="font-medium">{player.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Urgence :</span> <span className="font-medium">{player.emergencyPhone || 'N/A'}</span></div>
                <div className="flex items-start gap-2 mt-1"><MapPin className="size-3 mt-1 shrink-0" /><span className="text-xs">{player.address}</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-primary border-b pb-1 uppercase text-sm"><Banknote className="size-4" /> Trésorerie</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Inscription :</span> <Badge variant={player.registrationFeeStatus === 'Payé' ? 'default' : 'destructive'}>{player.registrationFeeStatus}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Abonnement :</span> <span className="font-medium">{player.subscriptionType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mensualité :</span> <span className="font-bold text-primary">{player.subscriptionAmount} DH</span></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-6">
          <Button variant="outline" onClick={() => setOpen(true)}><Edit className="h-4 w-4 mr-2" /> Modifier</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Supprimer ce joueur ?</AlertDialogTitle><AlertDialogDescription>Cette action effacera toutes les données de Maestro Foot liées à ce joueur.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={async () => { await deletePlayer(id); router.push('/players'); }}>Supprimer</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Modifier le joueur - Maestro Foot</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border">
                      <AvatarImage src={form.watch('photo')} /><AvatarFallback><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <FormField control={form.control} name="photo" render={({field}) => <FormItem className="w-full max-w-sm"><FormLabel>URL Photo</FormLabel><Input {...field} /></FormItem>} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><User className="size-4" /> 1. ÉTAT CIVIL</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <Label>Matricule (ID unique)</Label>
                        <Input value={player.id} readOnly className="bg-muted font-mono" />
                      </div>
                      <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="firstName" render={({field}) => <FormItem><FormLabel>Prénom</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="gender" render={({field}) => <FormItem><FormLabel>Sexe</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Masculin">Garçon</SelectItem><SelectItem value="Féminin">Fille</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel>Date de Naissance</FormLabel><Input type="date" {...field} /></FormItem>} />
                      <FormField control={form.control} name="birthPlace" render={({field}) => <FormItem><FormLabel>Lieu de Naissance</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="country" render={({field}) => <FormItem><FormLabel>Nationalité</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><Trophy className="size-4" /> 2. INFORMATIONS SPORTIVES</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="category" render={({field}) => <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel>Poste</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="strongFoot" render={({field}) => <FormItem><FormLabel>Pied Fort</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Droitier">Droitier</SelectItem><SelectItem value="Gaucher">Gaucher</SelectItem><SelectItem value="Ambidextre">Ambidextre</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="height" render={({field}) => <FormItem><FormLabel>Taille (cm)</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="weight" render={({field}) => <FormItem><FormLabel>Poids (kg)</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel>N° Maillot</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="status" render={({field}) => <FormItem><FormLabel>Statut</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Blessé">Blessé</SelectItem><SelectItem value="Suspendu">Suspendu</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent></Select></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><Phone className="size-4" /> 3. CONTACT & PARENTS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel>Nom du Tuteur</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="parentId" render={({field}) => <FormItem><FormLabel>parentID (Lien Plateforme)</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone Principal</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="emergencyPhone" render={({field}) => <FormItem><FormLabel>Téléphone d'urgence</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="address" render={({field}) => <FormItem className="md:col-span-2"><FormLabel>Adresse</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="email" render={({field}) => <FormItem className="md:col-span-2"><FormLabel>Email</FormLabel><Input type="email" {...field} /></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><HeartPulse className="size-4" /> 4. DOSSIER MÉDICAL & DOCUMENTS</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="bloodGroup" render={({field}) => <FormItem><FormLabel>Groupe Sanguin</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="medicalCertificateStatus" render={({field}) => <FormItem><FormLabel>Certificat Médical</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fourni">Fourni</SelectItem><SelectItem value="Non fourni">Non fourni</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel>N° CIN / Livret Famille</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="medicalConditions" render={({field}) => <FormItem className="md:col-span-3"><FormLabel>Allergies / Traitements</FormLabel><Input {...field} /></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><Banknote className="size-4" /> 5. SUIVI FINANCIER</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="registrationFeeStatus" render={({field}) => <FormItem><FormLabel>Frais d'inscription</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Payé">Payé</SelectItem><SelectItem value="Non payé">Non payé</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="subscriptionType" render={({field}) => <FormItem><FormLabel>Type d'abonnement</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Mensuel">Mensuel</SelectItem><SelectItem value="Trimestriel">Trimestriel</SelectItem><SelectItem value="Annuel">Annuel</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="subscriptionAmount" render={({field}) => <FormItem><FormLabel>Montant Cotisation (DH)</FormLabel><Input type="number" {...field} /></FormItem>} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 border-t bg-background shrink-0 flex gap-2">
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
