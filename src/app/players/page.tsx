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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Search, Loader2, User, Trophy, Phone, HeartPulse, Banknote, ShieldCheck, Hash } from "lucide-react";
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
  codeMassar: z.string().optional(),
  licenceNumber: z.string().optional(),
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
      codeMassar: '', licenceNumber: '',
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
      toast({ title: "Joueur inscrit avec succès" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de l'inscription" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (players || []).filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.firstName || "").toLowerCase().includes(q) ||
      (p.professionalId || "").toLowerCase().includes(q)
    );
  }, [players, searchQuery]);

  const grouped = useMemo(() => {
    const res: any = { male: {}, female: {} };
    filtered.forEach(p => {
      const target = p.gender === 'Féminin' ? res.female : res.male;
      if (!target[p.category]) target[p.category] = [];
      target[p.category].push(p);
    });
    return res;
  }, [filtered]);

  const currentGroups = activeGender === 'female' ? grouped.female : grouped.male;
  const cats = Object.keys(currentGroups).sort((a, b) => playerCategories.indexOf(a) - playerCategories.indexOf(b));
  const currentCat = activeCategory && currentGroups[activeCategory] ? activeCategory : (cats[0] || '');

  if (loading && !isSubmitting && players.length === 0) return <div className="p-8 text-center text-muted-foreground font-black animate-pulse">CHARGEMENT MAESTRO FOOT...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full bg-background">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase text-primary italic">Effectifs Maestro</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Base de données officielle</p>
        </div>
        {profile?.role === 'admin' && (
          <Button onClick={() => setOpen(true)} className="font-black h-12 px-8 rounded-full shadow-lg"><PlusCircle className="mr-2 h-5 w-5" /> NOUVELLE INSCRIPTION</Button>
        )}
      </div>

      <div className="relative my-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
        <Input placeholder="Rechercher par Matricule ou Nom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 rounded-2xl shadow-sm text-lg font-medium" />
      </div>

      <Tabs value={activeGender} onValueChange={(v) => handleTabChange('gender', v)}>
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 border rounded-xl overflow-hidden p-1">
          <TabsTrigger value="male" className="font-black uppercase tracking-tighter">Masculin</TabsTrigger>
          <TabsTrigger value="female" className="font-black uppercase tracking-tighter">Féminin</TabsTrigger>
        </TabsList>
        <TabsContent value={activeGender} className="mt-6">
          {cats.length > 0 ? (
            <Tabs value={currentCat} onValueChange={(v) => handleTabChange('category', v)}>
              <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
                <TabsList className="bg-transparent h-auto p-0 flex gap-2">
                  {cats.map(c => (
                    <TabsTrigger key={c} value={c} style={{ backgroundColor: categoryColors[c] || 'hsl(var(--primary))' }} className="text-white font-black px-6 py-3 rounded-full shadow-md whitespace-nowrap data-[state=active]:ring-2 data-[state=active]:ring-primary data-[state=active]:ring-offset-2">{c}</TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {currentCat && currentGroups[currentCat] && (
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentGroups[currentCat].map((p: any) => (
                    <Card key={p.id} className="group hover:shadow-2xl transition-all border shadow-lg overflow-hidden rounded-3xl bg-card">
                      <Link href={`/players/${p.id}`}>
                        <div className="relative h-48">
                          <img src={p.photo || "https://picsum.photos/seed/player/400/400"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <Badge className="absolute top-4 left-4 z-20 bg-primary/90 text-white font-black border-none px-3 py-1 rounded-lg">#{p.jerseyNumber}</Badge>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <CardTitle className="text-xl font-black uppercase truncate">{p.firstName} {p.name}</CardTitle>
                            <div className="flex items-center gap-2 text-white/80 text-[10px] font-mono font-black mt-1">
                              <ShieldCheck className="size-3 text-primary" />
                              {p.professionalId}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-5 flex justify-between items-center bg-card border-t">
                          <Badge style={{ backgroundColor: categoryColors[p.category] || 'hsl(var(--primary))', color: 'white' }} className="font-black">{p.category}</Badge>
                          <Badge variant={p.status === 'Actif' ? 'default' : 'secondary'} className="font-black text-[10px] uppercase">{p.status}</Badge>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </Tabs>
          ) : (
            <div className="text-center py-32 bg-card rounded-[40px] border-2 border-dashed">
              <User className="size-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-black text-muted-foreground uppercase tracking-widest">Aucun licencié</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-[32px] border-none bg-background">
          <DialogHeader className="p-8 border-b bg-primary/5 text-center">
            <DialogTitle className="text-3xl font-black flex items-center justify-center gap-3 uppercase tracking-tighter text-primary italic">
              <PlusCircle className="h-8 w-8" /> Inscription Maestro Pro
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-10 py-8">
                <div className="space-y-12">
                  <div className="flex flex-col items-center gap-6 bg-primary/5 p-8 rounded-[32px] border-2 border-dashed border-primary/20">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                      <AvatarImage src={form.watch('photo')} />
                      <AvatarFallback><Camera className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <FormField control={form.control} name="photo" render={({field}) => (
                      <FormItem className="w-full max-w-md">
                        <FormLabel className="font-black text-center block text-primary uppercase text-xs">Lien de la photo</FormLabel>
                        <Input {...field} className="bg-background rounded-xl h-12" />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-primary font-black border-b-2 border-primary/10 pb-3 uppercase text-sm italic"><Hash className="size-5" /> 1. Identité</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Nom</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="firstName" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Prénom</FormLabel><Input {...field} className="h-12 rounded-xl" /></FormItem>} />
                      <FormField control={form.control} name="gender" render={({field}) => (
                        <FormItem><FormLabel className="font-black uppercase text-xs">Genre</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Date de Naissance</FormLabel><Input type="date" {...field} className="h-12 rounded-xl" /></FormItem>} />
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
                    <div className="flex items-center gap-3 text-primary font-black border-b-2 border-primary/10 pb-3 uppercase text-sm italic"><Trophy className="size-5" /> 2. Sportif</div>
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
                      <FormField control={form.control} name="jerseyNumber" render={({field}) => <FormItem><FormLabel className="font-black uppercase text-xs">Numéro</FormLabel><Input type="number" {...field} className="h-12 rounded-xl" /></FormItem>} />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-8 border-t bg-muted/10 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="h-14 px-8 rounded-2xl font-black uppercase text-xs">Abandonner</Button>
                <Button type="submit" disabled={isSubmitting} className="h-14 flex-1 rounded-2xl font-black uppercase text-sm shadow-xl text-white bg-primary hover:bg-primary/90">
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "VALIDER L'INSCRIPTION"}
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
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground font-black animate-pulse">Initialisation...</div>}>
      <PlayersContent />
    </Suspense>
  );
}
