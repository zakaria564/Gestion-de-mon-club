"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from 'date-fns';
import { useFinancialContext } from "@/context/financial-context";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useToast } from "@/hooks/use-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Search } from "lucide-react";
import type { Payment } from "@/lib/financial-data";

type MemberStatus = 'À jour' | 'En attente' | 'Partiel';

export default function FinancesPage() {
  const financialContext = useFinancialContext();
  const playersContext = usePlayersContext();
  const coachesContext = useCoachesContext();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'player' | 'coach'>('player');
  const [searchQuery, setSearchQuery] = useState("");
  const [newPaymentData, setNewPaymentData] = useState({
    member: '', totalAmount: '', initialPaidAmount: '', dueDate: format(new Date(), 'yyyy-MM'),
  });

  if (!financialContext || !playersContext || !coachesContext) return null;

  const { playerPayments, coachSalaries, addPlayerPayment, addCoachSalary, playerPaymentsOverview, coachSalariesOverview } = financialContext;
  const { players } = playersContext;
  const { coaches } = coachesContext;

  const aggregatePayments = (payments: Payment[], allMembers: { id: string; name: string }[]) => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    const paymentsByMember = payments.reduce((acc, p) => {
      if (!acc[p.member]) acc[p.member] = [];
      acc[p.member].push(p);
      return acc;
    }, {} as Record<string, Payment[]>);

    return allMembers.map(member => {
      const memberPayments = paymentsByMember[member.name] || [];
      const currentMonthPayment = memberPayments.find(p => p.dueDate === currentMonthStr);
      const hasPastArrears = memberPayments.some(p => p.dueDate < currentMonthStr && p.status !== 'payé');
      
      let status: MemberStatus = 'En attente';
      if (currentMonthPayment) {
        if (currentMonthPayment.status === 'payé' && !hasPastArrears) status = 'À jour';
        else if (currentMonthPayment.status === 'partiel' || (currentMonthPayment.status === 'payé' && hasPastArrears)) status = 'Partiel';
      }

      return { member: member.name, totalPaid: memberPayments.reduce((s, p) => s + p.paidAmount, 0), paymentCount: memberPayments.length, status };
    }).sort((a, b) => a.member.localeCompare(b.member));
  };

  const filteredPlayerMembers = useMemo(() => aggregatePayments(playerPayments, players).filter(p => p.member.toLowerCase().includes(searchQuery.toLowerCase())), [playerPayments, players, searchQuery]);
  const filteredCoachMembers = useMemo(() => aggregatePayments(coachSalaries, coaches).filter(s => s.member.toLowerCase().includes(searchQuery.toLowerCase())), [coachSalaries, coaches, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(newPaymentData.totalAmount);
    const paid = parseFloat(newPaymentData.initialPaidAmount);
    if (paid > total) {
      toast({ variant: "destructive", title: "Erreur", description: "Le montant versé dépasse le total dû." });
      return;
    }
    if (paymentType === 'player') await addPlayerPayment({ ...newPaymentData, totalAmount: total, initialPaidAmount: paid });
    else await addCoachSalary({ ...newPaymentData, totalAmount: total, initialPaidAmount: paid });
    setOpen(false);
    setNewPaymentData({ member: '', totalAmount: '', initialPaidAmount: '', dueDate: format(new Date(), 'yyyy-MM') });
  };

  const renderTable = (data: any[], type: 'players' | 'coaches') => (
    <Card>
      <CardHeader><CardTitle>Liste des {type === 'players' ? 'cotisations' : 'salaires'}</CardTitle></CardHeader>
      <CardContent>
        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        <Table>
          <TableHeader><TableRow><TableHead>Membre</TableHead><TableHead className="hidden sm:table-cell">Total Payé</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.member}>
                <TableCell className="font-medium">{item.member}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.totalPaid.toFixed(2)} DH</TableCell>
                <TableCell><Badge variant={item.status === 'À jour' ? 'default' : item.status === 'Partiel' ? 'secondary' : 'destructive'}>{item.status}</Badge></TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button asChild variant="ghost" size="icon"><Link href={`/finances/${type === 'players' ? 'cotisations' : 'coaches'}/${encodeURIComponent(item.member)}`}><Eye className="h-4 w-4" /></Link></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setPaymentType(type === 'players' ? 'player' : 'coach'); setNewPaymentData(p => ({...p, member: item.member})); setOpen(true); }}><PlusCircle className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between"><h2 className="text-3xl font-bold tracking-tight">Finances</h2><Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau paiement</Button></div>
      <Tabs defaultValue="players" className="space-y-4">
        <TabsList><TabsTrigger value="players">Joueurs</TabsTrigger><TabsTrigger value="coaches">Entraîneurs</TabsTrigger></TabsList>
        <TabsContent value="players" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader className="pb-2 text-xs font-medium uppercase text-muted-foreground">Total dû</CardHeader><CardContent className="text-2xl font-bold">{playerPaymentsOverview.totalDue.toFixed(2)} DH</CardContent></Card>
            <Card><CardHeader className="pb-2 text-xs font-medium uppercase text-muted-foreground">Encaissé</CardHeader><CardContent className="text-2xl font-bold text-green-600">{playerPaymentsOverview.paymentsMade.toFixed(2)} DH</CardContent></Card>
            <Card><CardHeader className="pb-2 text-xs font-medium uppercase text-muted-foreground">Reste</CardHeader><CardContent className="text-2xl font-bold text-red-600">{playerPaymentsOverview.paymentsRemaining.toFixed(2)} DH</CardContent></Card>
          </div>
          {renderTable(filteredPlayerMembers, 'players')}
        </TabsContent>
        <TabsContent value="coaches" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader className="pb-2 text-xs font-medium uppercase text-muted-foreground">Total salaires</CardHeader><CardContent className="text-2xl font-bold">{coachSalariesOverview.totalDue.toFixed(2)} DH</CardContent></Card>
            <Card><CardHeader className="pb-2 text-xs font-medium uppercase text-muted-foreground">Payé</CardHeader><CardContent className="text-2xl font-bold text-green-600">{coachSalariesOverview.paymentsMade.toFixed(2)} DH</CardContent></Card>
            <Card><CardHeader className="pb-2 text-xs font-medium uppercase text-muted-foreground">Reste à payer</CardHeader><CardContent className="text-2xl font-bold text-red-600">{coachSalariesOverview.paymentsRemaining.toFixed(2)} DH</CardContent></Card>
          </div>
          {renderTable(filteredCoachMembers, 'coaches')}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2"><DialogTitle>Nouveau Paiement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                <div className="grid gap-2"><Label>Type</Label><Select value={paymentType} onValueChange={(v: any) => setPaymentType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="player">Cotisation</SelectItem><SelectItem value="coach">Salaire</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Mois concerné</Label><Input type="month" value={newPaymentData.dueDate} onChange={e => setNewPaymentData(p => ({...p, dueDate: e.target.value}))} required /></div>
                <div className="grid gap-2"><Label>Membre</Label><Select value={newPaymentData.member} onValueChange={v => setNewPaymentData(p => ({...p, member: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(paymentType === 'player' ? players : coaches).map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Montant total</Label><Input type="number" value={newPaymentData.totalAmount} onChange={e => setNewPaymentData(p => ({...p, totalAmount: e.target.value}))} required /></div>
                  <div className="grid gap-2"><Label>Versé</Label><Input type="number" value={newPaymentData.initialPaidAmount} onChange={e => setNewPaymentData(p => ({...p, initialPaidAmount: e.target.value}))} required /></div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t bg-background flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}