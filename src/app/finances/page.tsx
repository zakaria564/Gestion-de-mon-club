
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, PlusCircle, Users, UserCheck, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useFinancialContext } from "@/context/financial-context";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import type { Payment } from "@/lib/financial-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type MemberStatus = 'À jour' | 'En attente' | 'Partiel';

export default function FinancesPage() {
  const financialContext = useFinancialContext();
  const playersContext = usePlayersContext();
  const coachesContext = useCoachesContext();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'player' | 'coach'>('player');
  const [newPaymentData, setNewPaymentData] = useState({
    member: '',
    totalAmount: '',
    initialPaidAmount: '',
    dueDate: format(new Date(), 'yyyy-MM'),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  if (!financialContext || !playersContext || !coachesContext) {
    throw new Error("FinancesPage must be used within all required providers");
  }

  const { 
    playerPayments, 
    coachSalaries, 
    addPlayerPayment, 
    addCoachSalary, 
    loading,
    playerPaymentsOverview,
    coachSalariesOverview
  } = financialContext;

  const { players, loading: playersLoading } = playersContext;
  const { coaches, loading: coachesLoading } = coachesContext;

  const aggregatePayments = (
    payments: Payment[],
    allMembers: { id: string; name: string }[]
  ) => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    
    const paymentsByMember = payments.reduce((acc, p) => {
        if (!acc[p.member]) acc[p.member] = [];
        acc[p.member].push(p);
        return acc;
    }, {} as Record<string, Payment[]>);

    return allMembers.map(member => {
        const memberPayments = paymentsByMember[member.name] || [];
        const currentMonthPayment = memberPayments.find(p => p.dueDate === currentMonthStr);
        
        // Vérification des arriérés (mois passés non soldés)
        const hasArrears = memberPayments.some(p => p.dueDate < currentMonthStr && p.status !== 'payé');

        let status: MemberStatus = 'En attente';

        if (currentMonthPayment) {
            if (currentMonthPayment.status === 'payé') {
                status = hasArrears ? 'Partiel' : 'À jour';
            } else if (currentMonthPayment.status === 'partiel') {
                status = 'Partiel';
            } else {
                status = 'En attente';
            }
        } else {
            // Aucun paiement pour le mois en cours
            status = 'En attente';
        }

        const totalPaid = memberPayments.reduce((sum, p) => sum + p.paidAmount, 0);
        const paymentCount = memberPayments.length;

        return { member: member.name, totalPaid, paymentCount, status };
    });
  };

  const aggregatedPlayerPayments = useMemo(() => aggregatePayments(playerPayments, players), [playerPayments, players]);
  const aggregatedCoachSalaries = useMemo(() => aggregatePayments(coachSalaries, coaches), [coachSalaries, coaches]);

  const filteredPlayerMembers = useMemo(() => aggregatedPlayerPayments.filter(p => p.member.toLowerCase().includes(searchQuery.toLowerCase())), [aggregatedPlayerPayments, searchQuery]);
  const filteredCoachMembers = useMemo(() => aggregatedCoachSalaries.filter(s => s.member.toLowerCase().includes(searchQuery.toLowerCase())), [aggregatedCoachSalaries, searchQuery]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const total = parseFloat(newPaymentData.totalAmount);
    const paid = parseFloat(newPaymentData.initialPaidAmount);

    if (paid > total) {
        toast({ variant: "destructive", title: "Erreur", description: "Le montant payé ne peut pas être supérieur au total." });
        return;
    }

    if (newPaymentData.member && !isNaN(total) && !isNaN(paid)) {
      if (paymentType === 'player') await addPlayerPayment({ ...newPaymentData, totalAmount: total, initialPaidAmount: paid });
      else await addCoachSalary({ ...newPaymentData, totalAmount: total, initialPaidAmount: paid });
      setOpen(false);
      setNewPaymentData({ member: '', totalAmount: '', initialPaidAmount: '', dueDate: format(new Date(), 'yyyy-MM') });
    }
  };
  
  const renderTable = (data: any[], type: 'players' | 'coaches', rawPayments: Payment[]) => {
    const linkPath = type === 'players' ? 'cotisations' : 'coaches';
    const currentMonth = format(new Date(), 'yyyy-MM');
    const getBadgeStyle = (status: MemberStatus): React.CSSProperties => {
        switch (status) {
            case 'À jour': return { backgroundColor: 'hsl(var(--primary))', color: 'white' };
            case 'Partiel': return { backgroundColor: 'hsl(var(--accent))', color: 'white' };
            case 'En attente': return { backgroundColor: 'hsl(var(--destructive))', color: 'white' };
            default: return {};
        }
    };

    return (
     <Card>
      <CardHeader><CardTitle>Liste des {type === 'players' ? 'cotisations' : 'salaires'}</CardTitle></CardHeader>
      <CardContent>
          <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Table>
            <TableHeader><TableRow><TableHead>Membre</TableHead><TableHead className="hidden sm:table-cell">Total Payé</TableHead><TableHead className="hidden sm:table-cell">Mois Payés</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {(loading || (type === 'players' ? playersLoading : coachesLoading)) ? (
                Array.from({length: 5}).map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-24"/></TableCell><TableCell colSpan={4}><Skeleton className="h-5 w-full"/></TableCell></TableRow>)
              ) : (
                data.map((item) => (
                  <TableRow key={item.member}>
                    <TableCell className="font-medium">{item.member}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.totalPaid.toFixed(2)} DH</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.paymentCount}</TableCell>
                    <TableCell><Badge style={getBadgeStyle(item.status)}>{item.status}</Badge></TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                       <Button asChild variant="ghost" size="icon"><Link href={`/finances/${linkPath}/${encodeURIComponent(item.member)}`}><Eye className="h-4 w-4" /></Link></Button>
                       <Button variant="ghost" size="icon" onClick={() => { setPaymentType(type === 'players' ? 'player' : 'coach'); setNewPaymentData({...newPaymentData, member: item.member}); setOpen(true); }} disabled={rawPayments.some(p => p.member === item.member && p.dueDate === currentMonth)}><PlusCircle className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  )};

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between"><h2 className="text-3xl font-bold tracking-tight">Finances</h2><Button onClick={() => setOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un paiement</Button></div>
      <Tabs defaultValue="players" onValueChange={setActiveTab} className="space-y-4">
        <TabsList><TabsTrigger value="players">Joueurs</TabsTrigger><TabsTrigger value="coaches">Entraîneurs</TabsTrigger></TabsList>
        <TabsContent value="players" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader className="pb-2 text-sm font-medium">Total dû</CardHeader><CardContent className="text-2xl font-bold">{playerPaymentsOverview.totalDue.toFixed(2)} DH</CardContent></Card>
                <Card><CardHeader className="pb-2 text-sm font-medium">Total reçu</CardHeader><CardContent className="text-2xl font-bold">{playerPaymentsOverview.paymentsMade.toFixed(2)} DH</CardContent></Card>
                <Card><CardHeader className="pb-2 text-sm font-medium">Reste</CardHeader><CardContent className="text-2xl font-bold">{playerPaymentsOverview.paymentsRemaining.toFixed(2)} DH</CardContent></Card>
            </div>
            {renderTable(filteredPlayerMembers, 'players', playerPayments)}
        </TabsContent>
        <TabsContent value="coaches" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader className="pb-2 text-sm font-medium">Total dû</CardHeader><CardContent className="text-2xl font-bold">{coachSalariesOverview.totalDue.toFixed(2)} DH</CardContent></Card>
                <Card><CardHeader className="pb-2 text-sm font-medium">Total payé</CardHeader><CardContent className="text-2xl font-bold">{coachSalariesOverview.paymentsMade.toFixed(2)} DH</CardContent></Card>
                <Card><CardHeader className="pb-2 text-sm font-medium">Reste</CardHeader><CardContent className="text-2xl font-bold">{coachSalariesOverview.paymentsRemaining.toFixed(2)} DH</CardContent></Card>
            </div>
            {renderTable(filteredCoachMembers, 'coaches', coachSalaries)}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader><DialogTitle>Nouveau Paiement</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={paymentType} onValueChange={(v: any) => setPaymentType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="player">Cotisation</SelectItem><SelectItem value="coach">Salaire</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Mois</Label>
                <Input type="month" value={newPaymentData.dueDate} onChange={e => setNewPaymentData({...newPaymentData, dueDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Membre</Label>
                <Select value={newPaymentData.member} onValueChange={v => setNewPaymentData({...newPaymentData, member: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(paymentType === 'player' ? players : coaches).map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Total dû</Label><Input type="number" value={newPaymentData.totalAmount} onChange={e => setNewPaymentData({...newPaymentData, totalAmount: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Versé</Label><Input type="number" value={newPaymentData.initialPaidAmount} onChange={e => setNewPaymentData({...newPaymentData, initialPaidAmount: e.target.value})} required /></div>
              </div>
              <DialogFooter><Button type="submit">Enregistrer</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  );
}
