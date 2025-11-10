
"use client"

import { useMemo, useState, useEffect } from 'react';
import type { Coach } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Award, Users, Edit, Trash2, Camera, FileText, ExternalLink, PlusCircle, X, MapPin, Flag, UserSquare, Home, VenetianMask } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoachesContext } from '@/context/coaches-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format, isValid, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const baseCategories: ('Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7')[] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const playerCategories: string[] = baseCategories.flatMap(cat => [cat, `${cat} F`]);

const categoryColors: Record<string, string> = {
  'Sénior': 'hsl(var(--chart-1))',
  'U23': 'hsl(var(--chart-2))',
  'U20': 'hsl(340, 80%, 55%)',
  'U19': 'hsl(var(--chart-3))',
  'U18': 'hsl(var(--chart-4))',
  'U17': 'hsl(var(--chart-5))',
  'U16': 'hsl(var(--chart-6))',
  'U15': 'hsl(var(--chart-7))',
  'U13': 'hsl(var(--chart-8))',
  'U9': 'hsl(25 60% 45%)',
  'U11': 'hsl(var(--chart-10))',
  'U7': 'hsl(var(--chart-11))',
};

// Add colors for female categories
Object.keys(categoryColors).forEach(key => {
    categoryColors[`${key} F`] = categoryColors[key];
});

const documentSchema = z.object({
  name: z.string().min(1, "Le nom du document est requis."),
  url: z.string().url("Veuillez entrer une URL valide.").min(1, "L'URL est requise."),
  expirationDate: z.string().optional(),
});

const coachSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  specialization: z.string().min(1, "La spécialité est requise."),
  phone: z.string().min(1, "Le téléphone est requis."),
  email: z.string().email("L'adresse email est invalide."),
  address: z.string().min(1, "L'adresse est requise."),
  country: z.string().min(1, "La nationalité est requise."),
  experience: z.coerce.number().min(0, "L'expérience ne peut être négative."),
  photo: z.string().url("Veuillez entrer une URL valide pour la photo.").optional().or(z.literal('')),
  cin: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise."),
  documents: z.array(documentSchema).optional(),
});

type CoachFormValues = z.infer<typeof coachSchema>;

const documentOptions = [
  "Contrat",
  "Diplôme",
  "Certificat de Formation",
  "Carte d'identité",
  "Passeport",
  "Assurance",
  "Autre"
];

const nationalities = ["Marocaine", "Française", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Belge", "Suisse", "Canadienne", "Brésilienne", "Argentine", "Espagnole", "Portugaise", "Allemande", "Italienne", "Néerlandaise", "Anglaise", "Américaine", "Russe", "Japonaise", "Chinoise", "Indienne", "Turque", "Égyptienne", "Nigériane", "Sud-africaine", "Ghanéenne"];

export function CoachDetailClient({ id }: { id: string }) {
  const router = useRouter();
  
  const context = useCoachesContext();
  
  if (!context) {
    throw new Error("CoachDetailClient must be used within a CoachesProvider");
  }

  const { loading, updateCoach, deleteCoach, getCoachById } = context;

  const [dialogOpen, setDialogOpen] = useState(false);

  const coach = useMemo(() => getCoachById(id), [id, getCoachById]);
  
  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: {},
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  useEffect(() => {
    if (coach && dialogOpen) {
      const documents = coach.documents?.map(doc => ({
        name: doc.name || '',
        url: doc.url || '',
        expirationDate: doc.expirationDate && isValid(parseISO(doc.expirationDate)) ? format(parseISO(doc.expirationDate), 'yyyy-MM-dd') : ''
      })) || [];

      form.reset({
        name: coach.name || '',
        specialization: coach.specialization || '',
        phone: coach.phone || '',
        email: coach.email || '',
        address: coach.address || '',
        country: coach.country || 'Marocaine',
        experience: coach.experience || 0,
        photo: coach.photo || '',
        cin: coach.cin || '',
        category: coach.category || 'Sénior',
        documents,
      });
    } else if (!dialogOpen) {
        form.reset();
    }
  }, [coach, dialogOpen, form]);


  if (loading) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader className="flex flex-row items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informations</h3>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact</h3>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!coach) {
    return notFound();
  }

  const onSubmit = async (data: CoachFormValues) => {
    if (!coach) return;
    
    const gender = data.category.endsWith(' F') ? 'Féminin' : 'Masculin';
    
    const dataToUpdate = { 
        ...coach, // keep existing fields
        ...data,
        gender,
        id: coach.id,
        uid: coach.uid
    };
    await updateCoach(dataToUpdate);
    setDialogOpen(false);
  };
  
  const handleDeleteCoach = async () => {
    if (typeof id === 'string') {
        router.push('/coaches');
        await deleteCoach(id);
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'default';
      case 'Inactif':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const photoPreview = form.watch('photo');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/coaches" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des entraîneurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={coach.photo ?? undefined} alt={coach.name} data-ai-hint="coach photo"/>
            <AvatarFallback className="text-4xl">{coach.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{coach.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 pt-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations Personnelles</h3>
                 {coach.cin && (
                  <div className="flex items-center gap-4">
                    <UserSquare className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.cin}</span>
                  </div>
                 )}
                 <div className="flex items-center gap-4">
                    <VenetianMask className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.gender || 'Non spécifié'}</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${coach.email}`} className="text-primary hover:underline">{coach.email}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${coach.phone}`} className="text-primary hover:underline">{coach.phone}</a>
                </div>
                 <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coach.address)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {coach.address}
                    </a>
                </div>
                 <div className="flex items-center gap-4">
                    <Flag className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.country}</span>
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations Sportives</h3>
                <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.specialization}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.experience} ans d'expérience</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <span><Badge style={{ backgroundColor: categoryColors[coach.category.replace(' F', '')], color: 'white' }} className="border-transparent">{coach.category}</Badge></span>
                </div>
                <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span><Badge variant={getBadgeVariant(coach.status) as any}>{coach.status}</Badge></span>
                </div>
            </div>
            {coach.documents && coach.documents.length > 0 && (
                <div className="space-y-4 mt-6 md:col-span-2 lg:col-span-3">
                    <h3 className="font-semibold text-lg">Documents</h3>
                    <ul className="space-y-2">
                        {coach.documents.map((doc, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{doc.name}</a>
                                        {doc.expirationDate && isValid(parseISO(doc.expirationDate)) && (
                                            <p className="text-xs text-muted-foreground">Expire le: {format(parseISO(doc.expirationDate), 'dd/MM/yyyy')}</p>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </CardContent>
         <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera définitivement l'entraîneur.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCoach}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
      
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Modifier un entraîneur</DialogTitle>
              <DialogDescription>
                Mettez à jour les informations de l'entraîneur ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
                <ScrollArea className="flex-grow">
                    <div className="px-6 py-4 space-y-6">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border">
                          <AvatarImage src={photoPreview || undefined} alt="Aperçu de l'entraîneur" data-ai-hint="coach photo"/>
                          <AvatarFallback className="bg-muted">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <FormField
                          control={form.control}
                          name="photo"
                          render={({ field }) => (
                            <FormItem className="w-full max-w-sm">
                              <FormLabel>URL de la photo</FormLabel>
                              <FormControl>
                                <Input type="text" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl><Input {...field} required /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>N° CIN</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spécialité</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} required>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="Entraîneur Principal">Entraîneur Principal</SelectItem>
                                  <SelectItem value="Entraîneur Adjoint">Entraîneur Adjoint</SelectItem>
                                  <SelectItem value="Entraîneur des Gardiens">Entraîneur des Gardiens</SelectItem>
                                  <SelectItem value="Préparateur Physique">Préparateur Physique</SelectItem>
                                  <SelectItem value="Analyste Vidéo">Analyste Vidéo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} required>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {playerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl><Input {...field} required /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl><Input type="email" {...field} required /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse</FormLabel>
                                <FormControl><Input {...field} required /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nationalité</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} required>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {nationalities.map(nationality => <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Expérience (années)</FormLabel>
                              <FormControl><Input type="number" {...field} required /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                       <div className="space-y-4">
                        <h4 className="text-lg font-medium border-b pb-2">Documents</h4>
                          {fields.map((field, index) => (
                           <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                             <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                               <X className="h-4 w-4" />
                             </Button>
                              <FormField
                                control={form.control}
                                name={`documents.${index}.name`}
                                render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nom du document</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {documentOptions.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                  <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`documents.${index}.url`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL du document</FormLabel>
                                    <FormControl>
                                    <Input type="url" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`documents.${index}.expirationDate`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date d'expiration (optionnel)</FormLabel>
                                    <FormControl>
                                    <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                           </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ name: "", url: "", expirationDate: ""})}
                        >
                           <PlusCircle className="mr-2 h-4 w-4" />
                          Ajouter un document
                        </Button>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
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

    
