
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayersContext } from "@/context/players-context";
import { useAuth } from "@/context/auth-context";
import { Stethoscope, Search, PlusCircle, Activity, History, HeartPulse, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MedicalPage() {
  const { players, updatePlayer, loading } = usePlayersContext();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [injuryType, setInjuryType] = useState("");
  const [recoveryDate, setInjuryDate] = useState("");

  const injuredPlayers = useMemo(() => players.filter(p => p.status === 'Blessé'), [players]);
  const healthyPlayers = useMemo(() => players.filter(p => p.status !== 'Blessé'), [players]);

  const filteredInjured = injuredPlayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDeclareInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    setIsSubmitting(true);
    try {
      const player = players.find(p => p.id === selectedPlayerId);
      if (player) {
        await updatePlayer({ ...player, status: 'Blessé' });
        setOpen(false);
        setSelectedPlayerId("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToPlay = async (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      await updatePlayer({ ...player, status: 'Actif' });
    }
  };

  if (loading && players.length === 0) return <div className="p-8">Chargement du module médical...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Stethoscope className="text-primary" /> Suivi Médical</h2>
        {(profile?.role === 'admin' || profile?.role === 'medical') && (
          <Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Déclarer une blessure</Button>
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="relative">
            Blessures Actives
            {injuredPlayers.length > 0 && (
              <span className="ml-2 bg-destructive text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {injuredPlayers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Historique & Certificats</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un joueur..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInjured.map(p => (
              <Card key={p.id} className="border-destructive/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <CardDescription>{p.category} - {p.poste}</CardDescription>
                    </div>
                    <Badge variant="destructive" className="animate-pulse">Indisponible</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Type:</span> Traumatisme cheville
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Depuis le:</span> 12/05/2024
                    </div>
                  </div>
                  {(profile?.role === 'admin' || profile?.role === 'medical') && (
                    <Button variant="outline" className="w-full" onClick={() => handleReturnToPlay(p.id)}>
                      <HeartPulse className="mr-2 h-4 w-4 text-green-600" /> Autoriser la reprise
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredInjured.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                Aucun joueur blessé à afficher.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Archive Médicale</CardTitle><CardDescription>Dernières visites et validité des certificats.</CardDescription></CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground italic">L'historique complet sera disponible prochainement.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Déclarer une blessure</DialogTitle></DialogHeader>
          <form onSubmit={handleDeclareInjury} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid gap-2">
                <Label>Joueur concerné</Label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un joueur..." /></SelectTrigger>
                  <SelectContent>
                    {healthyPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.category})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nature de la blessure</Label>
                <Input placeholder="Ex: Entorse, Douleur musculaire..." />
              </div>
              <div className="grid gap-2">
                <Label>Date de l'incident</Label>
                <Input type="date" />
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-background shrink-0 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting || !selectedPlayerId} className="bg-destructive text-white hover:bg-destructive/90">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : "Déclarer Indisponible"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
