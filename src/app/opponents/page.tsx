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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Shield /> Adversaires</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Ajouter un adversaire</span></Button>
          <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2"><DialogTitle>{isEditing ? "Modifier" : "Ajouter"} un adversaire</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <ScrollArea className="flex-1 px-6">
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border"><AvatarImage src={newOpponent.logoUrl} /><AvatarFallback><Camera /></AvatarFallback></Avatar>
                    <div className="w-full space-y-2"><Label>URL du logo</Label><Input id="logoUrl" value={newOpponent.logoUrl} onChange={handleInputChange} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Nom de l'équipe</Label><Input id="name" value={newOpponent.name} onChange={handleInputChange} required /></div>
                  <div className="grid gap-2"><Label>Genre</Label><Select onValueChange={(v: any) => setNewOpponent(p => ({...p, gender: v}))} value={newOpponent.gender} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></div>
                </div>
              </ScrollArea>
              <DialogFooter className="p-6 pt-4 border-t gap-2 bg-background mt-auto"><Button type="button" variant="outline" onClick={resetForm}>Annuler</Button><Button type="submit">Sauvegarder</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
