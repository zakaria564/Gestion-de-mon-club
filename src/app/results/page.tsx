
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResultsContext, NewResult, Result } from "@/context/results-context";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ResultsPage() {
  const context = useResultsContext();

  if (!context) {
    throw new Error("ResultsPage must be used within a ResultsProvider");
  }

  const { results, loading, addResult, updateResult, deleteResult } = context;

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);

  const [newResult, setNewResult] = useState<NewResult>({
    opponent: '',
    date: '',
    score: '',
    scorers: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewResult(prev => ({ ...prev, [id]: value }));
  };
  
  const resetForm = () => {
    setNewResult({ opponent: '', date: '', score: '', scorers: '', notes: '' });
    setOpen(false);
    setIsEditing(false);
    setEditingResult(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing && editingResult) {
      await updateResult({ id: editingResult.id, ...newResult });
    } else {
      await addResult(newResult);
    }
    resetForm();
  };

  const openEditDialog = (result: Result) => {
    setIsEditing(true);
    setEditingResult(result);
    setNewResult({
        opponent: result.opponent,
        date: result.date,
        score: result.score,
        scorers: Array.isArray(result.scorers) ? result.scorers.join(', ') : result.scorers,
        notes: result.notes || '',
    });
    setOpen(true);
  }

  const handleDelete = async (id: string) => {
    await deleteResult(id);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Suivi des Résultats</h2>
         <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); else setOpen(true);}}>
            <DialogTrigger asChild>
                <Button onClick={() => { setIsEditing(false); setEditingResult(null); setOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un résultat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un résultat</DialogTitle>
                        <DialogDescription>Remplissez les détails du match ci-dessous.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="opponent">Adversaire</Label>
                            <Input id="opponent" value={newResult.opponent} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={newResult.date} onChange={handleInputChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="score">Score (ex: 3-1)</Label>
                                <Input id="score" value={newResult.score} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="scorers">Buteurs (séparés par une virgule)</Label>
                            <Input id="scorers" value={newResult.scorers} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={newResult.notes} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Sauvegarder</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Résultats des Matchs</CardTitle>
          <CardDescription>
            Consultez les résultats des matchs passés de votre club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {results.map((result) => (
                <AccordionItem key={result.id} value={`item-${result.id}`}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 items-center">
                      <div className="flex-1 text-left">
                        <span>
                          Club vs {result.opponent} -{" "}
                          <span className="text-muted-foreground">{result.date}</span>
                        </span>
                      </div>
                       <span className="font-bold text-primary mx-4">{result.score}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Buteurs:</strong>{" "}
                        {result.scorers && Array.isArray(result.scorers) && result.scorers.length > 0
                          ? result.scorers.join(", ")
                          : "Aucun"}
                      </p>
                      <p>
                        <strong>Notes:</strong> {result.notes || 'Aucune'}
                      </p>
                       <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(result)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement ce résultat.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(result.id)}>Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    