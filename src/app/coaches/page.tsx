
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCoachesContext } from "@/context/coaches-context";
import { useToast } from "@/hooks/use-toast";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Camera, Search } from "lucide-react";

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'].flatMap(c => [c, `${c} F`]);

const coachSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  specialization: z.string().min(1, "Spécialité requise"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  address: z.string().min(1, "Adresse requise"),
  country: z.string().min(1, "Nationalité requise"),
  experience: z.coerce.number().min(0),
  photo: z.string().url("URL invalide").optional().or(z.literal('')),
  cin: z.string().optional(),
  category: z.string().min(1, "Catégorie requise"),
});

type CoachFormValues = z.infer<typeof coachSchema>;

const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne"];

export default function CoachesPage() {
  const { coaches, addCoach, loading } = useCoachesContext();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: { name: '', specialization: '', phone: '', email: '', address: '', country: 'Marocaine', experience: 0, photo: '', cin: '', category: '' },
  });

  const onSubmit = async (data: CoachFormValues) => {
    await addCoach({ ...data, gender: data.category.endsWith(' F') ? 'Féminin' : 'Masculin', status: 'Actif' });
    setDialogOpen(false);
    form.reset();
    toast({ title: "Entraîneur ajouté" });
  };

  const filtered = useMemo(() => {
    return coaches.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [coaches, searchQuery]);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entraîneurs</h2>
        <Button onClick={() => setDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="relative my-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <Link href={`/coaches/${c.id}`} className="block h-full">
              <CardHeader className="p-4 flex flex-row items-center gap-4">
                <Avatar className="size-16"><AvatarImage src={c.photo} /><AvatarFallback>{c.name.substring(0, 2)}</AvatarFallback></Avatar>
                <div className="flex-1"><CardTitle className="text-base">{c.name}</CardTitle><CardDescription>{c.specialization}</CardDescription></div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex justify-between items-center"><Badge variant="outline">{c.category}</Badge><Badge>{c.status}</Badge></CardContent>
            </Link>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Nouvel Entraîneur</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom</FormLabel><Input {...field} required /></FormItem>} />
                    <FormField control={form.control} name="email" render={({field}) => <FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} required /></FormItem>} />
                    <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone</FormLabel><Input {...field} required /></FormItem>} />
                    <FormField control={form.control} name="specialization" render={({field}) => (
                      <FormItem><FormLabel>Spécialité</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Entraîneur Principal">Principal</SelectItem><SelectItem value="Adjoint">Adjoint</SelectItem></SelectContent></Select>
                      </FormItem>
                    )} />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="p-6 border-t bg-background flex gap-2 shrink-0">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
