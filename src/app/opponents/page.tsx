"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Shield, Camera, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOpponentsContext, Opponent } from "@/context/opponents-context";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function OpponentsPage() {
  const { opponents, loading, addOpponent, deleteOpponent } = useOpponentsContext();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    isMasculin: true,
    isFeminin: false,
  });

  const displayOpponents = useMemo(() => {
    const groups: Record<string, { name: string, logoUrl?: string, genders: string[], originalItems: Opponent[] }> = {};
    (opponents || []).forEach(op => {
      if (!groups[op.name]) {
        groups[op.name] = { name: op.name, logoUrl: op.logoUrl, genders: [], originalItems: [] };
      }
      if (!groups[op.name].genders.includes(op.gender)) {
        groups[op.name].genders.push(op.gender);
      }
      groups[op.name].originalItems.push(op);
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [opponents]);

  const resetForm = () => {
    setFormData({ name: "", logoUrl: "", isMasculin: true, isFeminin: false });
    setIsEditing(false);
    setEditingName("");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isMasculin && !formData.isFeminin) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez cocher au moins un genre." });
      return;
    }

    if (isEditing) {
      const toDelete = opponents.filter(o => o.name === editingName);
      for (const o of toDelete) await deleteOpponent(o.id);
    }

    if (formData.isMasculin) await addOpponent({ name: formData.name, logoUrl: formData.logoUrl, gender: "Masculin" });
    if (formData.isFeminin) await addOpponent({ name: formData.name, logoUrl: formData.logoUrl, gender: "Féminin" });

    toast({ title: isEditing ? "Équipe mise à jour" : "Équipe ajoutée" });
    resetForm();
  };

  const handleEdit = (group: any) => {
    setEditingName(group.name);
    setFormData({
      name: group.name,
      logoUrl: group.logoUrl || "",
      isMasculin: group.genders.includes("Masculin"),
      isFeminin: group.genders.includes("Féminin"),
    });
    setIsEditing(true);
    setOpen(true);
  };

  const handleDeleteGroup = async (group: any) => {
    for (const item of group.originalItems) {
      await deleteOpponent(item.id);
    }
    toast({ variant: "destructive", title: "Équipe supprimée" });
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Shield /> Adversaires</h2>
        <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayOpponents.map((group) => (
          <Card key={group.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={group.logoUrl} alt={group.name} />
                <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <div className="flex gap-1 mt-1">
                  {group.genders.map(g => (
                    <Badge key={g} variant="outline" className="text-[10px] px-1 py-0">{g}</Badge>
                  ))}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(group)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'équipe {group.name} ?</AlertDialogTitle>
                        <AlertDialogDescription>Cela supprimera les versions Masculine et Féminine enregistrées.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGroup(group)}>Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
          </Card>
        ))}
        {displayOpponents.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            Aucun adversaire enregistré.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{isEditing ? "Modifier" : "Ajouter"} une équipe</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border">
                    <AvatarImage src={formData.logoUrl} />
                    <AvatarFallback><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-2">
                    <Label htmlFor="logoUrl">URL du logo</Label>
                    <Input id="logoUrl" value={formData.logoUrl} onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://..." />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom de l'équipe</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-3">
                  <Label>Genres disponibles</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="masc" checked={formData.isMasculin} onCheckedChange={(v) => setFormData({...formData, isMasculin: !!v})} />
                      <Label htmlFor="masc" className="font-normal">Masculin</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fem" checked={formData.isFeminin} onCheckedChange={(v) => setFormData({...formData, isFeminin: !!v})} />
                      <Label htmlFor="fem" className="font-normal">Féminin</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-background shrink-0 flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}