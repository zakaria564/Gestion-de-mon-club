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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { PlusCircle, Search, Camera, Loader2 } from "lucide-react";

const playerCategories = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'].flatMap(c => [c, `${c} F`]);
const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Belge", "Suisse", "Canadienne"];

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

export default function CoachesPage() {
  const { coaches, addCoach, loading } = useCoachesContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: { name: '', specialization: '', phone: '', email: '', address: '', country: 'Marocaine', experience: 0, photo: '', cin: '', category: '' },
  });

  const onSubmit = async (data: CoachFormValues) => {
    setIsSubmitting(true);
    try {
      await addCoach({ ...data, gender: data.category.endsWith(' F') ? 'Féminin' : 'Masculin', status: 'Actif' } as any);
      setOpen(false);
      form.reset();
      toast({ title: "Entraîneur ajouté" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return (coaches || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [coaches, searchQuery]);

  if (loading && coaches.length === 0) return <div className="p-8 text-center text-muted-foreground">Chargement des entraîneurs...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entraîneurs</h2>
        <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="relative my-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <Link href={`/coaches/${c.id}`}>
              <CardHeader className="p-4 flex flex-row items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={c.photo || undefined} />
                  <AvatarFallback>{c.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1"><CardTitle className="text-base">{c.name}</CardTitle><CardDescription>{c.specialization}</CardDescription></div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex justify-between items-center"><Badge variant="outline">{c.category}</Badge><Badge>{c.status}</Badge></CardContent>
            </Link>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Nouvel Entraîneur</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border">
                      <AvatarImage src={form.watch('photo') || undefined} />
                      <AvatarFallback><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                    </Avatar>
                    <FormField control={form.control} name="photo" render={({field}) => <FormItem className="w-full max-w-sm"><FormLabel>URL Photo</FormLabel><Input {...field} /></FormItem>} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({field}) => <FormItem><FormLabel>Nom</FormLabel><Input {...field} required /></FormItem>} />
                    <FormField control={form.control} name="email" render={({field}) => <FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} required /></FormItem>} />
                    <FormField control={form.control} name="phone" render={({field}) => <FormItem><FormLabel>Téléphone</FormLabel><Input {...field} required /></FormItem>} />
                    <FormField control={form.control} name="cin" render={({field}) => <FormItem><FormLabel>N° CIN</FormLabel><Input {...field} /></FormItem>} />
                    <FormField control={form.control} name="specialization" render={({field}) => <FormItem><FormLabel>Spécialité</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Entraîneur Principal">Principal</SelectItem><SelectItem value="Adjoint">Adjoint</SelectItem></SelectContent></Select></FormItem>} />
                    <FormField control={form.control} name="category" render={({field}) => <FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></FormItem>} />
                    <FormField control={form.control} name="country" render={({field}) => <FormItem><FormLabel>Nationalité</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></FormItem>} />
                    <FormField control={form.control} name="experience" render={({field}) => <FormItem><FormLabel>Expérience (ans)</FormLabel><Input type="number" {...field} required /></FormItem>} />
                    <FormField control={form.control} name="address" render={({field}) => <FormItem className="md:col-span-2"><FormLabel>Adresse</FormLabel><Input {...field} required /></FormItem>} />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 border-t bg-background shrink-0 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}