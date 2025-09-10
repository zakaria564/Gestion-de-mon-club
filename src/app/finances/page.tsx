
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, PlusCircle, Users, UserCheck, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useFinancialContext } from "@/context/financial-context";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Payment } from "@/lib/financial-data";


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
    dueDate: '',
  });

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

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayerPayments = useMemo(() => {
    return playerPayments.filter(p => p.member.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [playerPayments, searchQuery]);

  const filteredCoachSalaries = useMemo(() => {
    return coachSalaries.filter(s => s.member.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [coachSalaries, searchQuery]);


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
      setNewPaymentData({ member: '', totalAmount: '', initialPaidAmount: '', dueDate: '' });
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'payé':
        return 'default';
      case 'non payé':
        return 'destructive';
      case 'partiel':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const renderTable = (data: Payment[], type: 'players' | 'coaches') => (
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
                <TableHead>Montant Total</TableHead>
                <TableHead>Montant Payé</TableHead>
                <TableHead>Reste à payer</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading || (type === 'players' ? playersLoading : coachesLoading)) ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 rounded-full"/></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md"/></TableCell>
                  </TableRow>
                ))
              ) : (
                data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.member}</TableCell>
                    <TableCell>{payment.totalAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.paidAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.remainingAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(payment.status)}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="ghost" size="icon">
                        <Link href={`/finances/${type}/${payment.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  )

  const memberOptions = paymentType === 'player' ? players : coaches;
  const remainingAmount = useMemo(() => {
    const total = parseFloat(newPaymentData.totalAmount) || 0;
    const paid = parseFloat(newPaymentData.initialPaidAmount) || 0;
    return (total - paid).toFixed(2);
  }, [newPaymentData.totalAmount, newPaymentData.initialPaidAmount]);


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
                   <Select onValueChange={(value) => setPaymentType(value as 'player' | 'coach')} defaultValue={paymentType}>
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
                  <Label htmlFor="member">Membre</Label>
                  <Select name="member" onValueChange={(value) => setNewPaymentData(prev => ({ ...prev, member: value }))} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberOptions.map(member => (
                          <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
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
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Mois de la cotisation/paie</Label>
                  <Input id="dueDate" type="month" value={newPaymentData.dueDate} onChange={(e) => setNewPaymentData(p => ({...p, dueDate: e.target.value}))} required/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="players" className="space-y-4">
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
          {renderTable(filteredPlayerPayments, 'players')}
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
          {renderTable(filteredCoachSalaries, 'coaches')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
    
