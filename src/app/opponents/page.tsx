
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Shield, Camera, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOpponentsContext, NewOpponent, Opponent } from "@/context/opponents-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OpponentsPage() {
  const { opponents, loading, addOpponent, updateOpponent, deleteOpponent } = useOpponentsContext();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
  const [newOpponent, setNewOpponent] = useState<NewOpponent>({
    name: "",
    logoUrl: "",
    gender: "Masculin",
  });

  useEffect(() => { if (!open) resetForm(); }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewOpponent(prev => ({ ...prev, [id]: value }));
  };
  
  const resetForm = () => {
    setNewOpponent({ name: "", logoUrl: "", gender: "Masculin" });
    setIsEditing(false); setEditingOpponent(null); setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing && editingOpponent) {
      await updateOpponent({ id: editingOpponent.id, ...newOpponent, uid: editingOpponent.uid });
      toast({ title: "Adversaire modifié" });
    } else {
      await addOpponent(newOpponent);
      toast({ title: "Adversaire ajouté" });
    }
    resetForm();
  };

  const handleEdit = (opponent: Opponent) => {
    setEditingOpponent(opponent);
    setNewOpponent({ name: opponent.name, logoUrl: opponent.logoUrl || "", gender: opponent.gender });
    setIsEditing(true);
    setOpen(true);
  };

  if (loading) return <div className="p-8"><Skeleton className="h-[400px] w-full" /></div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Shield /> Adversaires</h2>
        <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un adversaire</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {opponents.map((opponent) => (
          <Card key={opponent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={opponent.logoUrl} alt={opponent.name} />
                <AvatarFallback>{opponent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{opponent.name}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-1">{opponent.gender}</Badge>
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(opponent)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer {opponent.name} ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteOpponent(opponent.id)}>Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
          </Card>
        ))}
        {opponents.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            Aucun adversaire enregistré.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un adversaire</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border">
                    <AvatarImage src={newOpponent.logoUrl} />
                    <AvatarFallback><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-2">
                    <Label htmlFor="logoUrl">URL du logo</Label>
                    <Input id="logoUrl" value={newOpponent.logoUrl} onChange={handleInputChange} placeholder="https://..." />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom de l'équipe</Label>
                  <Input id="name" value={newOpponent.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label>Genre</Label>
                  <Select onValueChange={(v: any) => setNewOpponent(p => ({...p, gender: v}))} value={newOpponent.gender} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculin">Masculin</SelectItem>
                      <SelectItem value="Féminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-background flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
