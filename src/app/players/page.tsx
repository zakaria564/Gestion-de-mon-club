
"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useToast } from "@/hooks/use-toast";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Player } from "@/lib/data";

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise", "Américaine", "Russe", "Japonaise", "Chinoise", "Indienne", "Turque", "Égyptienne", "Nigériane", "Sud-africaine", "Ghanéenne"];
const documentOptions = ["Certificat Médical", "Carte d'identité", "Passeport", "Extrait de naissance", "Photo d'identité", "Licence sportive", "Assurance", "Autre"];

const documentSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  url: z.string().url("URL invalide"),
});

const playerSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  birthDate: z.string().min(1, "La date de naissance est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide.").optional().or(z.literal('')),
  address: z.string().min(1, "L'adresse est requise."),
  country: z.string().min(1, "La nationalité est requise."),
  poste: z.string().min(1, "Le poste est requis."),
  jerseyNumber: z.coerce.number().min(1, "Le numéro de maillot doit être supérieur à 0."),
  photo: z.string().url("URL de photo invalide").optional().or(z.literal('')),
  cin: z.string().optional(),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  tutorEmail: z.string().email("L'adresse email du tuteur est invalide.").optional().or(z.literal('')),
  tutorCin: z.string().optional(),
  status: z.enum(['Actif', 'Blessé', 'Suspendu', 'Inactif']),
  category: z.string().min(1, "Catégorie requise"),
  gender: z.enum(['Masculin', 'Féminin']),
  coachName: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))', 'U23': 'hsl(var(--chart-2))', 'U20': 'hsl(340, 80%, 55%)', 'U19': 'hsl(var(--chart-3))', 'U18': 'hsl(var(--chart-4))', 'U17': 'hsl(var(--chart-5))', 'U16': 'hsl(var(--chart-6))', 'U15': 'hsl(var(--chart-7))', 'U13': 'hsl(var(--chart-8))', 'U9': 'hsl(25 60% 45%)', 'U11': 'hsl(var(--chart-10))', 'U7': 'hsl(var(--chart-11))',
};

function PlayersContent() {
  const { players, addPlayer, loading } = usePlayersContext();
  const { coaches } = useCoachesContext();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeGender = searchParams.get('gender') || 'male';
  const activeCategory = searchParams.get('category');

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: '', birthDate: '', address: '', phone: '', email: '', country: 'Marocaine', poste: '', jerseyNumber: 0, photo: '', cin: '', tutorName: '', tutorPhone: '', tutorEmail: '', tutorCin: '', status: 'Actif', category: '', gender: 'Masculin', coachName: '', documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "documents" });

  const handleTabChange = (key: 'gender' | 'category', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onSubmit = async (data: PlayerFormValues) => {
    await addPlayer(data);
    setDialogOpen(false);
    form.reset();
    toast({ title: "Joueur ajouté", description: "Le nouveau joueur a été ajouté avec succès." });
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.poste.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);

  const groupedPlayers = useMemo(() => {
    const male: Record<string, Record<string, Player[]>> = {};
    const female: Record<string, Record<string, Player[]>> = {};
    
    filteredPlayers.forEach(p => {
      const cat = p.category || 'Sénior';
      const pos = p.poste || 'Non défini';
      const target = p.gender === 'Féminin' ? female : male;
      if (!target[cat]) target[cat] = {};
      if (!target[cat][pos]) target[cat][pos] = [];
      target[cat][pos].push(p);
    });
    return { male, female };
  }, [filteredPlayers]);

  const currentGroups = activeGender === 'female' ? groupedPlayers.female : groupedPlayers.male;
  const availableCategories = Object.keys(currentGroups).sort((a,b) => playerCategories.indexOf(a) - playerCategories.indexOf(b));
  const currentCategory = activeCategory && currentGroups[activeCategory] ? activeCategory : (availableCategories[0] || '');

  if (loading) return <div className="p-8">Chargement des joueurs...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Joueurs</h2>
        <Button onClick={() => setDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur</Button>
      </div>

      <div className="relative my-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Rechercher par nom ou poste..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={activeGender} onValueChange={(v) => handleTabChange('gender', v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="male">Masculin</TabsTrigger>
          <TabsTrigger value="female">Féminin</TabsTrigger>
        </TabsList>
        <TabsContent value={activeGender} className="mt-4">
          {availableCategories.length > 0 ? (
            <Tabs value={currentCategory} onValueChange={(v) => handleTabChange('category', v)} className="w-full">
              <TabsList className="h-auto p-1 bg-muted rounded-md flex-wrap justify-start">
                {availableCategories.map(cat => (
                  <TabsTrigger key={cat} value={cat} style={{ backgroundColor: categoryColors[cat] }} className="text-white data-[state=active]:brightness-110 m-1">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              {currentCategory && currentGroups[currentCategory] && (
                <div className="mt-6 space-y-8">
                  {Object.entries(currentGroups[currentCategory]).map(([poste, playerList]) => (
                    <div key={poste}>
                      <h3 className="text-xl font-semibold mb-4 border-l-4 border-primary pl-3">{poste} ({playerList.length})</h3>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {playerList.map(p => (
                          <Card key={p.id} className="hover:shadow-lg transition-shadow">
                            <Link href={`/players/${p.id}`}>
                              <CardHeader className="p-4 flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16"><AvatarImage src={p.photo} alt={p.name} /><AvatarFallback>{p.name.substring(0, 2)}</AvatarFallback></Avatar>
                                <div className="flex-1"><CardTitle className="text-base font-bold">{p.name}</CardTitle><CardDescription>{p.poste}</CardDescription></div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0 flex justify-between items-center">
                                <Badge style={{ backgroundColor: categoryColors[p.category], color: 'white' }} className="border-none">{p.category}</Badge>
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
          ) : (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">Aucun joueur dans cette section.</div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if(!open) form.reset(); setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Nouveau Joueur</DialogTitle>
            <DialogDescription>Remplissez les informations pour inscrire un nouveau joueur.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border">
                      <AvatarImage src={form.watch('photo')} /><AvatarFallback className="bg-muted"><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <FormField control={form.control} name="photo" render={({field}) => (
                      <FormItem className="w-full max-w-sm">
                        <FormLabel>URL Photo</FormLabel>
                        <Input {...field} placeholder="https://..." />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase text-primary tracking-wider border-b pb-1">Identité & Contact</h4>
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
                      <FormField control={form.control} name="email" render={({field}) => <FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} placeholder="exemple@mail.com" /></FormItem>} />
                      <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone</FormLabel><Input {...field} required /></FormItem>} />
                      <FormField control={form.control} name="address" render={({field}) => <FormItem><FormLabel>Adresse</FormLabel><Input {...field} required /></FormItem>} />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase text-primary tracking-wider border-b pb-1">Sportif</h4>
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
                    <h4 className="font-bold text-sm uppercase text-primary tracking-wider border-b pb-1">Tuteur</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="tutorName" render={({field}) => <FormItem><FormLabel>Nom tuteur</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="tutorPhone" render={({field}) => <FormItem><FormLabel>Téléphone tuteur</FormLabel><Input {...field} /></FormItem>} />
                      <FormField control={form.control} name="tutorEmail" render={({field}) => <FormItem><FormLabel>Email tuteur</FormLabel><Input type="email" {...field} /></FormItem>} />
                      <FormField control={form.control} name="tutorCin" render={({field}) => <FormItem><FormLabel>N° CIN tuteur</FormLabel><Input {...field} /></FormItem>} />
                    </div>
                  </div>
                  <div className="space-y-4 pb-10">
                    <h4 className="font-bold text-sm uppercase text-primary tracking-wider border-b pb-1">Documents</h4>
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
                        <FormField control={form.control} name={`documents.${index}.url`} render={({field}) => <FormItem><FormLabel>Lien du document (URL)</FormLabel><Input {...field} /></FormItem>} />
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", url: "" })}><PlusCircle className="mr-2 h-4 w-4" />Ajouter un document</Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 border-t bg-background flex gap-2 shrink-0">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Enregistrer le joueur</Button>
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
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <PlayersContent />
    </Suspense>
  );
}
