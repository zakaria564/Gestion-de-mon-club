
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Shield, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOpponentsContext, NewOpponent, Opponent } from "@/context/opponents-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function OpponentsPage() {
  const { opponents, loading, addOpponent, updateOpponent, deleteOpponent } = useOpponentsContext();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
  const [newOpponent, setNewOpponent] = useState<NewOpponent>({
    name: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewOpponent(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setNewOpponent({ name: "", logoUrl: "" });
    setIsEditing(false);
    setEditingOpponent(null);
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing && editingOpponent) {
      await updateOpponent({ id: editingOpponent.id, ...newOpponent, uid: editingOpponent.uid });
      toast({ title: "Adversaire modifié", description: "Les informations de l'équipe adverse ont été mises à jour." });
    } else {
      await addOpponent(newOpponent);
      toast({ title: "Adversaire ajouté", description: "La nouvelle équipe adverse a été ajoutée." });
    }
    resetForm();
  };

  const openEditDialog = (opponent: Opponent) => {
    setIsEditing(true);
    setEditingOpponent(opponent);
    setNewOpponent({
      name: opponent.name,
      logoUrl: opponent.logoUrl || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteOpponent(id);
    toast({ variant: "destructive", title: "Adversaire supprimé", description: "L'équipe adverse a été supprimée." });
  };
  
  const photoPreview = newOpponent.logoUrl;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield /> Gestion des Adversaires
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un adversaire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un adversaire</DialogTitle>
                <DialogDescription>
                  Remplissez les informations de l'équipe adverse.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border">
                        <AvatarImage src={photoPreview || undefined} alt="Aperçu du logo" data-ai-hint="team logo" />
                        <AvatarFallback className="bg-muted">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                     <div className="w-full max-w-sm space-y-2">
                        <Label htmlFor="logoUrl">URL du logo</Label>
                        <Input id="logoUrl" type="text" placeholder="https://example.com/logo.png" value={newOpponent.logoUrl} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom de l'équipe</Label>
                  <Input id="name" placeholder="ex: FC Barcelone" value={newOpponent.name} onChange={handleInputChange} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={resetForm}>Annuler</Button>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardFooter className="justify-end gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : opponents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {opponents.map((opponent) => (
            <Card key={opponent.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opponent.logoUrl || undefined} alt={opponent.name} data-ai-hint="team logo" />
                  <AvatarFallback>{opponent.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">{opponent.name}</CardTitle>
              </CardHeader>
              <CardFooter className="mt-auto justify-end gap-2">
                 <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => openEditDialog(opponent)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-9 w-9">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Voulez-vous vraiment supprimer cet adversaire ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(opponent.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Aucun adversaire trouvé. Commencez par en ajouter un.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
