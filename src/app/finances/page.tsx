
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
  DialogTrigger,
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
import { format, parseISO } from 'date-fns';
import type { Payment } from "@/lib/financial-data";
import { Badge } from "@/components/ui/badge";

type MemberStatus = 'À jour' | 'Paiement en attente';

export default function FinancesPage() {
  const financialContext = useFinancialContext();
  const playersContext = usePlayersContext();
  const coachesContext = useCoachesContext();
  
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

  const aggregatePayments = (payments: Payment[]) => {
      const memberSummary: { [key: string]: { member: string; totalPaid: number; paymentCount: number, status: MemberStatus } } = {};

      payments.forEach(p => {
          if (!memberSummary[p.member]) {
              memberSummary[p.member] = { member: p.member, totalPaid: 0, paymentCount: 0, status: 'À jour' };
          }
          memberSummary[p.member].totalPaid += p.paidAmount;
          memberSummary[p.member].paymentCount += 1;
          if (p.status === 'partiel' || p.status === 'non payé') {
            memberSummary[p.member].status = 'Paiement en attente';
          }
      });

      return Object.values(memberSummary);
  };

  const aggregatedPlayerPayments = useMemo(() => {
    return aggregatePayments(playerPayments);
  }, [playerPayments]);

  const aggregatedCoachSalaries = useMemo(() => {
      return aggregatePayments(coachSalaries);
  }, [coachSalaries]);


  const filteredPlayerMembers = useMemo(() => {
    return aggregatedPlayerPayments.filter(p => p.member.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [aggregatedPlayerPayments, searchQuery]);

  const filteredCoachMembers = useMemo(() => {
    return aggregatedCoachSalaries.filter(s => s.member.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [aggregatedCoachSalaries, searchQuery]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalAmount = parseFloat(newPaymentData.totalAmount);
    const initialPaidAmount = parseFloat(newPaymentData.initialPaidAmount);

    if (newPaymentData.member && !isNaN(totalAmount) && !isNaN(initialPaidAmount) && newPaymentData.dueDate) {
      if (paymentType === 'player') {
        await addPlayerPayment({ ...newPaymentData, totalAmount, initialPaidAmount });
      } else {
        await addCoachSalary({ ...newPaymentData, totalAmount, initialPaidAmount });
      }
      setOpen(false);
      setNewPaymentData({ member: '', totalAmount: '', initialPaidAmount: '', dueDate: format(new Date(), 'yyyy-MM') });
    }
  };
  
  const openAddPaymentDialog = (type: 'player' | 'coach', memberName?: string) => {
    setPaymentType(type);
    setNewPaymentData({
      member: memberName || '',
      totalAmount: '',
      initialPaidAmount: '',
      dueDate: format(new Date(), 'yyyy-MM'),
    });
    setOpen(true);
  }

  const renderTable = (
    data: { member: string; totalPaid: number; paymentCount: number, status: MemberStatus }[], 
    type: 'players' | 'coaches',
    rawPayments: Payment[]
  ) => {
    const linkPath = type === 'players' ? 'cotisations' : 'coaches';
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    const hasPaymentForCurrentMonth = (memberName: string) => {
      if (!rawPayments) return false;
      return rawPayments.some(p => p.member === memberName && p.dueDate === currentMonth);
    };

    const getBadgeStyle = (status: MemberStatus): React.CSSProperties => {
        switch (status) {
            case 'À jour':
                return { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' };
            case 'Paiement en attente':
                return { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' };
            default:
                return {};
        }
    };


    return (
     <Card>
      <CardHeader>
        <CardTitle>Liste des {type === 'players' ? 'cotisations' : 'salaires'}</CardTitle>
        <CardDescription>
          Suivez les paiements {type === 'players' ? 'des joueurs' : 'des entraîneurs'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead className="hidden sm:table-cell">Total Payé</TableHead>
                <TableHead className="hidden sm:table-cell">Mois Payés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading || (type === 'players' ? playersLoading : coachesLoading)) ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20"/></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20"/></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full"/></TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md"/>
                        <Skeleton className="h-8 w-8 rounded-md"/>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                data.map((item) => (
                  <TableRow key={item.member}>
                    <TableCell className="font-medium">{item.member}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.totalPaid.toFixed(2)} DH</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.paymentCount}</TableCell>
                    <TableCell>
                      <Badge style={getBadgeStyle(item.status)} className="h-auto">
                        {item.status === 'Paiement en attente' ? (
                          <span className="text-center leading-tight">
                            Paiement en<br />attente
                          </span>
                        ) : (
                          item.status
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="ghost" size="icon">
                        <Link href={`/finances/${linkPath}/${encodeURIComponent(item.member)}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openAddPaymentDialog(type === 'players' ? 'player' : 'coach', item.member)} disabled={hasPaymentForCurrentMonth(item.member)} >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  )};

  const memberOptions = paymentType === 'player' ? players : coaches;
  
  const remainingAmount = useMemo(() => {
    const total = parseFloat(newPaymentData.totalAmount) || 0;
    const paid = parseFloat(newPaymentData.initialPaidAmount) || 0;
    return (total - paid).toFixed(2);
  }, [newPaymentData.totalAmount, newPaymentData.initialPaidAmount]);

  const membersWithPaymentForMonth = useMemo(() => {
    if (!newPaymentData.dueDate) return new Set();

    const collection = paymentType === 'player' ? playerPayments : coachSalaries;

    return new Set(
        collection
            .filter(p => p.dueDate === newPaymentData.dueDate)
            .map(p => p.member)
    );
  }, [newPaymentData.dueDate, playerPayments, coachSalaries, paymentType]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion Financière</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un paiement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau paiement</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Type de paiement</Label>
                   <Select onValueChange={(value) => setPaymentType(value as 'player' | 'coach')} value={paymentType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="player">Cotisation Joueur</SelectItem>
                        <SelectItem value="coach">Salaire Entraîneur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="dueDate">Mois de la cotisation/paie</Label>
                  <Input id="dueDate" type="month" value={newPaymentData.dueDate} onChange={(e) => setNewPaymentData(p => ({...p, dueDate: e.target.value}))} required readOnly />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="member">Membre</Label>
                  <Select name="member" onValueChange={(value) => setNewPaymentData(prev => ({ ...prev, member: value }))} value={newPaymentData.member} required>
                    <SelectTrigger disabled={!newPaymentData.dueDate}>
                        <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberOptions.map(member => (
                          <SelectItem key={member.id} value={member.name} disabled={membersWithPaymentForMonth.has(member.name)}>
                            {member.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">Montant total (DH)</Label>
                  <Input id="totalAmount" type="number" placeholder="300" value={newPaymentData.totalAmount} onChange={(e) => setNewPaymentData(p => ({...p, totalAmount: e.target.value}))} required/>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="initialPaidAmount">Montant initial payé (DH)</Label>
                  <Input id="initialPaidAmount" type="number" placeholder="150" value={newPaymentData.initialPaidAmount} onChange={(e) => setNewPaymentData(p => ({...p, initialPaidAmount: e.target.value}))} required/>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="remainingAmount">Reste à payer (DH)</Label>
                  <Input id="remainingAmount" type="number" value={remainingAmount} readOnly className="bg-muted" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="players" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="players">
             <Users className="mr-2 h-4 w-4" /> Cotisations Joueurs
          </TabsTrigger>
          <TabsTrigger value="coaches">
            <UserCheck className="mr-2 h-4 w-4" /> Salaires Entraîneurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total à recevoir</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{playerPaymentsOverview.totalDue.toFixed(2)} DH</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total reçu</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{playerPaymentsOverview.paymentsMade.toFixed(2)} DH</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total restant</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{playerPaymentsOverview.paymentsRemaining.toFixed(2)} DH</div>}
              </CardContent>
            </Card>
          </div>
          {renderTable(filteredPlayerMembers, 'players', playerPayments)}
        </TabsContent>

        <TabsContent value="coaches" className="space-y-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total à payer</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{coachSalariesOverview.totalDue.toFixed(2)} DH</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total payé</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
               {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{coachSalariesOverview.paymentsMade.toFixed(2)} DH</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total restant</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-xl font-bold">{coachSalariesOverview.paymentsRemaining.toFixed(2)} DH</div>}
              </CardContent>
            </Card>
          </div>
          {renderTable(filteredCoachMembers, 'coaches', coachSalaries)}
        </TabsContent>
      </Tabs>
    </div>
  );
}





    