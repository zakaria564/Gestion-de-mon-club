"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { usePlayersContext } from "@/context/players-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Search, Loader2, User, Trophy, Phone, HeartPulse, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  strongFoot: z.enum(['Droitier', 'Gaucher', 'Ambidextre']).default('Droitier'),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  jerseyNumber: z.coerce.number().min(1),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']).default('Actif'),
  tutorName: z.string().min(1, "Nom du tuteur requis"),
  parentId: z.string().optional(), 
  phone: z.string().min(1, "Téléphone requis"),
  emergencyPhone: z.string().optional(),
  address: z.string().min(1, "Adresse requise"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  medicalConditions: z.string().optional(),
  medicalCertificateStatus: z.enum(['Fourni', 'Non fourni']).default('Non fourni'),
  photo: z.string().url("URL invalide").optional().or(z.literal('')),
  cin: z.string().optional(),
  registrationFeeStatus: z.enum(['Payé', 'Non payé']).default('Non payé'),
  subscriptionType: z.enum(['Mensuel', 'Trimestriel', 'Annuel']).default('Mensuel'),
  subscriptionAmount: z.coerce.number().default(0),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))', 'U23': 'hsl(var(--chart-2))', 'U20': 'hsl(340, 80%, 55%)', 'U19': 'hsl(var(--chart-3))', 'U18': 'hsl(var(--chart-4))', 'U17': 'hsl(var(--chart-5))', 'U16': 'hsl(var(--chart-6))', 'U15': 'hsl(var(--chart-7))', 'U13': 'hsl(var(--chart-8))', 'U9': 'hsl(25 60% 45%)', 'U11': 'hsl(var(--chart-10))', 'U7': 'hsl(var(--chart-11))',
};

function PlayersContent() {
  const { players, addPlayer, loading } = usePlayersContext();
  const { profile } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeGender = searchParams.get('gender') || 'male';
  const activeCategory = searchParams.get('category');

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: '', firstName: '', birthDate: '', birthPlace: '', gender: 'Masculin', country: 'Marocaine',
      category: 'Sénior', poste: '', strongFoot: 'Droitier', height: 0, weight: 0, jerseyNumber: 0, status: 'Actif',
      tutorName: '', parentId: '', phone: '', emergencyPhone: '', address: '', email: '',
      bloodGroup: 'O+', medicalConditions: '', medicalCertificateStatus: 'Non fourni', photo: '', cin: '',
      registrationFeeStatus: 'Non payé', subscriptionType: 'Mensuel', subscriptionAmount: 0
    },
  });

  const handleTabChange = (key: 'gender' | 'category', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onSubmit = async (data: PlayerFormValues) => {
    setIsSubmitting(true);
    try {
      await addPlayer(data as any);
      setOpen(false);
      form.reset();
      toast({ title: "Joueur ajouté avec succès" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de l'ajout" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (players || []).filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.firstName || "").toLowerCase().includes(q) ||
      p.poste.toLowerCase().includes(q)
    );
  }, [players, searchQuery]);

  const grouped = useMemo(() => {
    const res: any = { male: {}, female: {} };
    filtered.forEach(p => {
      const target = p.gender === 'Féminin' ? res.female : res.male;
      if (!target[p.category]) target[p.category] = {};
      if (!target[p.category][p.poste]) target[p.category][p.poste] = [];
      target[p.category][p.poste].push(p);
    });
    return res;
  }, [filtered]);

  const currentGroups = activeGender === 'female' ? grouped.female : grouped.male;
  const cats = Object.keys(currentGroups).sort((a, b) => playerCategories.indexOf(a) - playerCategories.indexOf(b));
  const currentCat = activeCategory && currentGroups[activeCategory] ? activeCategory : (cats[0] || '');

  if (loading && !isSubmitting && players.length === 0) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Joueurs</h2>
        {profile?.role === 'admin' && (
          <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur</Button>
        )}
      </div>

      <div className="relative my-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={activeGender} onValueChange={(v) => handleTabChange('gender', v)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="male">Masculin</TabsTrigger>
          <TabsTrigger value="female">Féminin</TabsTrigger>
        </TabsList>
        <TabsContent value={activeGender} className="mt-4">
          {cats.length > 0 ? (
            <Tabs value={currentCat} onValueChange={(v) => handleTabChange('category', v)}>
              <TabsList className="h-auto p-1 bg-muted rounded-md flex-wrap justify-start">
                {cats.map(c => <TabsTrigger key={c} value={c} style={{ backgroundColor: categoryColors[c] }} className="text-white m-1">{c}</TabsTrigger>)}
              </TabsList>
              {currentCat && currentGroups[currentCat] && (
                <div className="mt-6 space-y-8">
                  {Object.entries(currentGroups[currentCat]).map(([poste, list]: any) => (
                    <div key={poste}>
                      <h3 className="text-xl font-semibold mb-4 border-l-4 border-primary pl-3">{poste} ({list.length})</h3>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {list.map((p: any) => (
                          <Card key={p.id} className="hover:shadow-lg transition-shadow">
                            <Link href={`/players/${p.id}`}>
                              <CardHeader className="p-4 flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={p.photo} />
                                  <AvatarFallback>{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <CardTitle className="text-base font-bold">{p.firstName} {p.name}</CardTitle>
                                  <CardDescription>{p.poste} - #{p.jerseyNumber}</CardDescription>
                                  <p className="text-[10px] font-mono text-muted-foreground mt-1">ID: {p.id.substring(0, 8).toUpperCase()}</p>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0 flex justify-between items-center">
                                <Badge style={{ backgroundColor: categoryColors[p.category], color: 'white' }}>{p.category}</Badge>
                                <Badge variant={p.status === 'Actif' ? 'default' : 'secondary'}>{p.status}</Badge>
                              </CardContent>
                            </Link>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tabs>
          ) : <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">Aucun joueur pour cette sélection.</div>}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Nouveau Joueur - Maestro Foot</DialogTitle></DialogHeader>
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
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><User className="size-4" /> 1. ÉTAT CIVIL (L'IDENTITÉ)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <Label>ID Joueur (Matricule)</Label>
                        <Input value="Généré automatiquement à l'enregistrement" readOnly className="bg-muted italic text-xs" />
                      </div>
                      <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom</FormLabel><Input {...field} placeholder="Nom de famille" /></FormItem>} />
                      <FormField control={form.control} name="firstName" render={({field}) => <FormItem><FormLabel>Prénom</FormLabel><Input {...field} placeholder="Prénom du joueur" /></FormItem>} />
                      <FormField control={form.control} name="gender" render={({field}) => <FormItem><FormLabel>Sexe</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Masculin">Garçon</SelectItem><SelectItem value="Féminin">Fille</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel>Date de Naissance</FormLabel><Input type="date" {...field} /></FormItem>} />
                      <FormField control={form.control} name="birthPlace" render={({field}) => <FormItem><FormLabel>Lieu de Naissance</FormLabel><Input {...field} placeholder="Ville" /></FormItem>} />
                      <FormField control={form.control} name="country" render={({field}) => <FormItem><FormLabel>Nationalité</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><Trophy className="size-4" /> 2. INFORMATIONS SPORTIVES (LE TERRAIN)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="category" render={({field}) => <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel>Poste</FormLabel><Input {...field} placeholder="Gardien, Défenseur..." /></FormItem>} />
                      <FormField control={form.control} name="strongFoot" render={({field}) => <FormItem><FormLabel>Pied Fort</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Droitier">Droitier</SelectItem><SelectItem value="Gaucher">Gaucher</SelectItem><SelectItem value="Ambidextre">Ambidextre</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="height" render={({field}) => <FormItem><FormLabel>Taille (cm)</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="weight" render={({field}) => <FormItem><FormLabel>Poids (kg)</FormLabel><Input type="number" {...field} /></FormItem>} />
                      <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel>N° Maillot</FormLabel><Input type="number" {...field} /></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><Phone className="size-4" /> 3. CONTACT & PARENTS (L'ADMINISTRATION)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel>Nom du Tuteur</FormLabel><Input {...field} placeholder="Père, Mère ou tuteur" /></FormItem>} />
                      <FormField control={form.control} name="parentId" render={({field}) => <FormItem><FormLabel>parentID (Lien Plateforme)</FormLabel><Input {...field} placeholder="UID Firebase du parent (optionnel)" /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone Principal (WhatsApp)</FormLabel><Input {...field} placeholder="+212..." /></FormItem>} />
                      <FormField control={form.control} name="emergencyPhone" render={({field}) => <FormItem><FormLabel>Téléphone d'urgence</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="address" render={({field}) => <FormItem className="md:col-span-2"><FormLabel>Adresse</FormLabel><Input {...field} placeholder="Quartier / Ville" /></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><HeartPulse className="size-4" /> 4. DOSSIER MÉDICAL & DOCUMENTS (LES FICHIERS)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="bloodGroup" render={({field}) => <FormItem><FormLabel>Groupe Sanguin</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="medicalCertificateStatus" render={({field}) => <FormItem><FormLabel>Certificat Médical</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Fourni">Fourni</SelectItem><SelectItem value="Non fourni">Non fourni</SelectItem></SelectContent></Select></FormItem>} />
                      <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel>N° CIN / Livret Famille</FormLabel><Input {...field} placeholder="Identifiant légal" /></FormItem>} />
                      <FormField control={form.control} name="medicalConditions" render={({field}) => <FormItem className="md:col-span-3"><FormLabel>Allergies / Traitements</FormLabel><Input {...field} placeholder="Ex: Asthme, Allergie pollen..." /></FormItem>} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold border-b pb-1"><Banknote className="size-4" /> 5. SUIVI FINANCIER (LA TRÉSORERIE)</div>
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
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Enregistrer"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement...</div>}>
      <PlayersContent />
    </Suspense>
  );
}
