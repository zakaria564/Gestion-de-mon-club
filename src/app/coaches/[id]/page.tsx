
"use client"

import { useMemo, useState, useContext, useEffect } from 'react';
import { Coach } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, UserCircle, Award, Users, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CoachesContext } from '@/context/coaches-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  
  const context = useContext(CoachesContext);
  
  if (!context) {
    throw new Error("CoachDetailPage must be used within a CoachesProvider");
  }

  const { coaches, loading, updateCoach, deleteCoach } = context;

  const [dialogOpen, setDialogOpen] = useState(false);

  const coach = useMemo(() => {
    return coaches.find((c) => c.id === id);
  }, [id, coaches]);
  
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  useEffect(() => {
    if (coach) {
      setSelectedCoach(coach);
    }
  }, [coach]);


  if (loading) {
    return (
       <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <div className="flex flex-wrap gap-2 mt-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSelectedCoach(prev => prev ? ({ ...prev, [id]: value }) : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedCoach(prev => prev ? ({...prev, photo: reader.result as string}) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (name: keyof Coach, value: string) => {
    setSelectedCoach(prev => prev ? ({ ...prev, [name]: value }) : null);
  };
  
  const handleOpenDialog = () => {
      setSelectedCoach(coach);
      setDialogOpen(true);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedCoach) {
        await updateCoach(selectedCoach);
    }
    setDialogOpen(false);
  };
  
  const handleDeleteCoach = async () => {
    await deleteCoach(coach.id);
    router.push('/coaches');
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/coaches" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des entraîneurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={coach.photo} alt={coach.name} data-ai-hint="coach photo"/>
            <AvatarFallback className="text-4xl">{coach.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{coach.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">{coach.specialization}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(coach.status) as any}>{coach.status}</Badge>
              <Badge variant="secondary">{coach.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations</h3>
                <div className="flex items-center gap-4">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.specialization}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.category}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${coach.contact}`} className="hover:underline">{coach.contact}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.phone}</span>
                </div>
            </div>
        </CardContent>
         <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={handleOpenDialog}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Modifier un entraîneur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              {selectedCoach && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" placeholder="Alain Prost" value={selectedCoach.name} onChange={handleInputChange} required />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie entraînée</Label>
                  <Select onValueChange={(value) => handleSelectChange('category', value)} value={selectedCoach.category} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sénior">Sénior</SelectItem>
                      <SelectItem value="U23">U23</SelectItem>
                      <SelectItem value="U19">U19</SelectItem>
                      <SelectItem value="U18">U18</SelectItem>
                      <SelectItem value="U17">U17</SelectItem>
                      <SelectItem value="U16">U16</SelectItem>
                      <SelectItem value="U15">U15</SelectItem>
                      <SelectItem value="U13">U13</SelectItem>
                      <SelectItem value="U11">U11</SelectItem>
                      <SelectItem value="U9">U9</SelectItem>
                      <SelectItem value="U7">U7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Select onValueChange={(value) => handleSelectChange('specialization', value)} value={selectedCoach.specialization} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entraîneur Principal">Entraîneur Principal</SelectItem>
                      <SelectItem value="Entraîneur Adjoint">Entraîneur Adjoint</SelectItem>
                      <SelectItem value="Entraîneur des Gardiens">Entraîneur des Gardiens</SelectItem>
                      <SelectItem value="Préparateur Physique">Préparateur Physique</SelectItem>
                      <SelectItem value="Entraîneur Jeunes">Entraîneur Jeunes</SelectItem>
                      <SelectItem value="Analyste Vidéo">Analyste Vidéo</SelectItem>
                      <SelectItem value="Entraîneur Féminines">Entraîneur Féminines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select onValueChange={(value) => handleSelectChange('status', value)} value={selectedCoach.status} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Email</Label>
                  <Input id="contact" placeholder="email@exemple.com" value={selectedCoach.contact} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="0612345678" value={selectedCoach.phone} onChange={handleInputChange} required />
                </div>
                 <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="photo">Photo</Label>
                    <Input id="photo" type="file" onChange={handleFileChange} accept="image/*" />
                    { selectedCoach.photo && (
                      <Avatar className="h-20 w-20 mt-2">
                        <AvatarImage src={selectedCoach.photo as string} alt="Aperçu" />
                        <AvatarFallback>??</AvatarFallback>
                      </Avatar>
                    )}
                </div>
              </div>
              )}
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
