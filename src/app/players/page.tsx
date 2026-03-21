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
import { PlusCircle, Camera, Search, Loader2, User, Trophy, Phone, HeartPulse, Banknote, ShieldCheck } from "lucide-react";
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

  if (loading && !isSubmitting && players.length === 0) return <div className="p-8 text-center text-muted-foreground">Chargement des joueurs...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight uppercase">Base Joueurs</h2>
        {profile?.role === 'admin' && (
          <Button onClick={() => setOpen(true)} className="font-bold"><PlusCircle className="mr-2 h-4 w-4" /> Inscrire un joueur</Button>
        )}
      </div>

      <div className="relative my-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Rechercher par nom, poste ou matricule..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={activeGender} onValueChange={(v) => handleTabChange('gender', v)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="male" className="font-bold uppercase tracking-widest">Masculin</TabsTrigger>
          <TabsTrigger value="female" className="font-bold uppercase tracking-widest">Féminin</TabsTrigger>
        </TabsList>
        <TabsContent value={activeGender} className="mt-4">
          {cats.length > 0 ? (
            <Tabs value={currentCat} onValueChange={(v) => handleTabChange('category', v)}>
              <TabsList className="h-auto p-1 bg-muted rounded-md flex-wrap justify-start border border-muted-foreground/10">
                {cats.map(c => <TabsTrigger key={c} value={c} style={{ backgroundColor: categoryColors[c] || 'hsl(var(--primary))' }} className="text-white font-bold m-1 shadow-sm px-4">{c}</TabsTrigger>)}
              </TabsList>
              {currentCat && currentGroups[currentCat] && (
                <div className="mt-6 space-y-10">
                  {Object.entries(currentGroups[currentCat]).map(([poste, list]: any) => (
                    <div key={poste}>
                      <h3 className="text-xl font-black mb-6 border-l-4 border-primary pl-4 uppercase tracking-tighter">{poste} <span className="text-muted-foreground font-medium ml-2">({list.length})</span></h3>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {list.map((p: any) => (
                          <Card key={p.id} className="group hover:shadow-2xl transition-all duration-300 border-none shadow-lg overflow-hidden">
                            <Link href={`/players/${p.id}`}>
                              <CardHeader className="p-4 flex flex-row items-center gap-4 bg-muted/20 group-hover:bg-primary/5 transition-colors">
                                <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                  <AvatarImage src={p.photo} />
                                  <AvatarFallback className="bg-primary text-primary-foreground font-black">{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base font-black truncate uppercase">{p.firstName} {p.name}</CardTitle>
                                  <CardDescription className="font-medium text-primary">#{p.jerseyNumber} — {p.poste}</CardDescription>
                                  <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-muted-foreground bg-white/50 w-fit px-1.5 py-0.5 rounded border border-muted-foreground/10">
                                    <ShieldCheck className="size-3" />
                                    MF-{p.id.substring(0, 8).toUpperCase()}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-3 flex justify-between items-center bg-white">
                                <Badge style={{ backgroundColor: categoryColors[p.category] || 'hsl(var(--primary))', color: 'white' }} className="font-bold tracking-tighter">{p.category}</Badge>
                                <Badge variant={p.status === 'Actif' ? 'default' : 'secondary'} className="font-bold text-[10px] uppercase">{p.status}</Badge>
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
          ) : <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5">Aucun joueur enregistré pour cette sélection.</div>}
        </TabsContent>
      </Tabs>

      {/* FORMULAIRE D'AJOUT COMPLET */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <PlusCircle className="text-primary" /> Inscription Nouveau Joueur - Maestro Foot
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
                        <FormLabel className="font-bold text-center block">Lien de la Photo Officielle</FormLabel>
                        <Input {...field} placeholder="https://..." className="bg-background" />
                      </FormItem>
                    )} />
                  </div>

                  {/* 1. ÉTAT CIVIL */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><User className="size-4" /> 1. État Civil (L'Identité)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3 space-y-2">
                        <Label className="text-primary font-black uppercase text-[10px] tracking-widest">Matricule Officiel Maestro Foot</Label>
                        <Input value="Sera généré automatiquement lors de l'enregistrement" readOnly className="bg-muted italic text-xs font-mono border-dashed" />
                      </div>
                      <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel className="font-bold">Nom</FormLabel><Input {...field} placeholder="Nom de famille" /></FormItem>} />
                      <FormField control={form.control} name="firstName" render={({field}) => <FormItem><FormLabel className="font-bold">Prénom</FormLabel><Input {...field} placeholder="Prénom du joueur" /></FormItem>} />
                      <FormField control={form.control} name="gender" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Sexe</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Masculin">Garçon</SelectItem><SelectItem value="Féminin">Fille</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel className="font-bold">Date de Naissance</FormLabel><Input type="date" {...field} /></FormItem>} />
                      <FormField control={form.control} name="birthPlace" render={({field}) => <FormItem><FormLabel className="font-bold">Lieu de Naissance</FormLabel><Input {...field} placeholder="Ville" /></FormItem>} />
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
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><Trophy className="size-4" /> 2. Informations Sportives (Le Terrain)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="category" render={({field}) => (
                        <FormItem><FormLabel className="font-bold">Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{playerCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="poste" render={({field}) => <FormItem><FormLabel className="font-bold">Poste de prédilection</FormLabel><Input {...field} placeholder="Ex: Gardien, Milieu..." /></FormItem>} />
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
                    </div>
                  </div>

                  {/* 3. CONTACT & PARENTS */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><Phone className="size-4" /> 3. Contact & Parents (L'Administration)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel className="font-bold">Nom du Tuteur Légal</FormLabel><Input {...field} placeholder="Père, Mère ou tuteur" /></FormItem>} />
                      <FormField control={form.control} name="parentId" render={({field}) => <FormItem><FormLabel className="font-bold">parentID (Lien Plateforme)</FormLabel><Input {...field} placeholder="UID Firebase du parent (si connu)" /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel className="font-bold">Téléphone Principal (WhatsApp)</FormLabel><Input {...field} placeholder="06..." /></FormItem>} />
                      <FormField control={form.control} name="emergencyPhone" render={({field}) => <FormItem><FormLabel className="font-bold">Téléphone d'Urgence</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="address" render={({field}) => <FormItem className="md:col-span-2"><FormLabel className="font-bold">Adresse de résidence</FormLabel><Input {...field} placeholder="Quartier, Ville" /></FormItem>} />
                    </div>
                  </div>

                  {/* 4. DOSSIER MÉDICAL */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><HeartPulse className="size-4" /> 4. Dossier Médical & Documents (Les Fichiers)</div>
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
                        <FormItem><FormLabel className="font-bold">Statut Certificat Médical</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Fourni">Fourni</SelectItem><SelectItem value="Non fourni">Non fourni</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel className="font-bold">Scan CIN / Livret Famille (N°)</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="medicalConditions" render={({field}) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="font-bold">Allergies / Traitements en cours</FormLabel>
                          <Input {...field} placeholder="À préciser pour le staff médical" />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* 5. SUIVI FINANCIER */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black border-b-2 pb-2 uppercase text-xs tracking-tighter"><Banknote className="size-4" /> 5. Suivi Financier (La Trésorerie)</div>
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
                          <FormLabel className="font-bold">Montant de la cotisation (DH)</FormLabel>
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
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Enregistrer le joueur"}
                </Button>
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
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground font-bold animate-pulse">Chargement de la base Maestro Foot...</div>}>
      <PlayersContent />
    </Suspense>
  );
}