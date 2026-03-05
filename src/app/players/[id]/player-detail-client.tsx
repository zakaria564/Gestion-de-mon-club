
'use client';

import { useMemo, useState, useEffect, use } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  "Certificat Médical", "Carte d'identité", "Passeport", "Extrait de naissance", "Photo d'identité", "Autorisation Parentale", "Fiche de renseignements", "Justificatif de domicile", "Licence sportive", "Assurance", "Autre"
];

const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise", "Américaine", "Russe", "Japonaise", "Chinoise", "Indienne", "Turque", "Égyptienne", "Nigériane", "Sud-africaine", "Ghanéenne"];

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))', 'U23': 'hsl(var(--chart-2))', 'U20': 'hsl(340, 80%, 55%)', 'U19': 'hsl(var(--chart-3))', 'U18': 'hsl(var(--chart-4))', 'U17': 'hsl(var(--chart-5))', 'U16': 'hsl(var(--chart-6))', 'U15': 'hsl(var(--chart-7))', 'U13': 'hsl(var(--chart-8))', 'U9': 'hsl(25 60% 45%)', 'U11': 'hsl(var(--chart-10))', 'U7': 'hsl(var(--chart-11))',
};

export function PlayerDetailClient({ id: idParam }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const context = usePlayersContext();
  const coachesContext = useCoachesContext();

  const id = typeof idParam === 'string' ? idParam : use(idParam as unknown as Promise<{id: string}>).id;

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
    return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;
  }

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
  const playerStatus = player.status || 'Actif';
  const playerCategory = player.category || 'Sénior';

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
                <div className="flex items-center gap-4"><Home className="h-5 w-5 text-muted-foreground" /><span><Badge style={{ backgroundColor: categoryColors[playerCategory.replace(' F', '')], color: 'white' }}>{playerCategory}</Badge></span></div>
                <div className="flex items-center gap-4"><UserCheck className="h-5 w-5 text-muted-foreground" /><span>Entraîneur: {player.coachName || 'Non assigné'}</span></div>
                <div className="flex items-center gap-4"><Shirt className="h-5 w-5 text-muted-foreground" /><span>Statut : <Badge variant={getBadgeVariant(playerStatus) as any}>{playerStatus}</Badge></span></div>
            </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(true)}><Edit className="h-4 w-4 mr-2" /> Modifier</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeletePlayer}>Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Modifier un joueur</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-bold border-b">Identité & Contact</h4>
                            <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom complet</FormLabel><Input {...field} /></FormItem>} />
                            <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel>Date de naissance</FormLabel><Input type="date" {...field} /></FormItem>} />
                            <FormField control={form.control} name="email" render={({field}) => <FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone</FormLabel><Input {...field} /></FormItem>} />
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold border-b">Sportif</h4>
                            <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel>Poste</FormLabel><Input {...field} /></FormItem>} />
                            <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel>N° Maillot</FormLabel><Input type="number" {...field} /></FormItem>} />
                        </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="p-6 border-t bg-background flex gap-2">
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
