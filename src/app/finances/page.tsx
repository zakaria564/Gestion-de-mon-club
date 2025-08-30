
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Users, UserCheck, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinancialContext } from "@/context/financial-context";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { Skeleton } from "@/components/ui/skeleton";


export default function FinancesPage() {
  const financialContext = useFinancialContext();
  const playersContext = usePlayersContext();
  const coachesContext = useCoachesContext();

  if (!financialContext || !playersContext || !coachesContext) {
    throw new Error("FinancesPage must be used within all required providers");
  }

  const { 
    playerPayments, 
    coachSalaries,
    loading: financialLoading,
    addPlayerPayment, 
    addCoachSalary,
    playerPaymentsOverview,
    coachSalariesOverview
  } = financialContext;

  const { players, loading: playersLoading } = playersContext;
  const { coaches, loading: coachesLoading } = coachesContext;


  const [playerPaymentOpen, setPlayerPaymentOpen] = useState(false);
  const [coachSalaryOpen, setCoachSalaryOpen] = useState(false);

  const [newPlayerPaymentData, setNewPlayerPaymentData] = useState({
    member: '',
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
  });

  const [newCoachSalaryData, setNewCoachSalaryData] = useState({
    member: '',
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
  });

  const coachRemainingAmount = useMemo(() => {
    const total = parseFloat(newCoachSalaryData.totalAmount) || 0;
    const paid = parseFloat(newCoachSalaryData.paidAmount) || 0;
    return (total - paid).toFixed(2);
  }, [newCoachSalaryData.totalAmount, newCoachSalaryData.paidAmount]);

  const playerRemainingAmount = useMemo(() => {
    const total = parseFloat(newPlayerPaymentData.totalAmount) || 0;
    const paid = parseFloat(newPlayerPaymentData.paidAmount) || 0;
    return (total - paid).toFixed(2);
  }, [newPlayerPaymentData.totalAmount, newPlayerPaymentData.paidAmount]);

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

  const handleAddPlayerPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalAmount = parseFloat(newPlayerPaymentData.totalAmount);
    const paidAmount = parseFloat(newPlayerPaymentData.paidAmount);

    if (newPlayerPaymentData.member && !isNaN(totalAmount) && !isNaN(paidAmount) && newPlayerPaymentData.dueDate) {
        await addPlayerPayment({
            member: newPlayerPaymentData.member,
            totalAmount,
            initialPaidAmount: paidAmount,
            dueDate: newPlayerPaymentData.dueDate,
        });
        setPlayerPaymentOpen(false);
        setNewPlayerPaymentData({ member: '', totalAmount: '', paidAmount: '', dueDate: '' });
    }
  };

  const handleAddCoachSalary = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalAmount = parseFloat(newCoachSalaryData.totalAmount);
    const paidAmount = parseFloat(newCoachSalaryData.paidAmount);

     if (newCoachSalaryData.member && !isNaN(totalAmount) && !isNaN(paidAmount) && newCoachSalaryData.dueDate) {
        await addCoachSalary({
            member: newCoachSalaryData.member,
            totalAmount,
            initialPaidAmount: paidAmount,
            dueDate: newCoachSalaryData.dueDate,
        });
        setCoachSalaryOpen(false);
        setNewCoachSalaryData({ member: '', totalAmount: '', paidAmount: '', dueDate: '' });
    }
  };

  const availablePlayers = useMemo(() => {
    const paidPlayerNames = new Set(playerPayments.map(p => p.member));
    return players.filter(player => !paidPlayerNames.has(player.name));
  }, [players, playerPayments]);

  const availableCoaches = useMemo(() => {
    const paidCoachNames = new Set(coachSalaries.map(s => s.member));
    return coaches.filter(coach => !paidCoachNames.has(coach.name));
  }, [coaches, coachSalaries]);

  const loading = financialLoading || playersLoading || coachesLoading;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div>
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center"><Users className="mr-2 h-7 w-7 text-primary" /> Joueurs (Cotisations)</h2>
            <Dialog open={playerPaymentOpen} onOpenChange={setPlayerPaymentOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un paiement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddPlayerPayment}>
                  <DialogHeader>
                    <DialogTitle>Ajouter un paiement de joueur</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="player">Joueur</Label>
                      <Select onValueChange={(value) => setNewPlayerPaymentData(p => ({...p, member: value}))} value={newPlayerPaymentData.member}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un joueur" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlayers.map(player => <SelectItem key={player.id} value={player.name}>{player.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalAmount">Montant total (DH)</Label>
                      <Input id="totalAmount" type="number" placeholder="1500" value={newPlayerPaymentData.totalAmount} onChange={(e) => setNewPlayerPaymentData(p => ({...p, totalAmount: e.target.value}))}/>
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="paidAmount">Montant payé (DH)</Label>
                      <Input id="paidAmount" type="number" placeholder="750" value={newPlayerPaymentData.paidAmount} onChange={(e) => setNewPlayerPaymentData(p => ({...p, paidAmount: e.target.value}))}/>
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="playerRemainingAmount">Reste à payer (DH)</Label>
                      <Input id="playerRemainingAmount" type="number" value={playerRemainingAmount} readOnly className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Date d'échéance</Label>
                      <Input id="dueDate" type="date" value={newPlayerPaymentData.dueDate} onChange={(e) => setNewPlayerPaymentData(p => ({...p, dueDate: e.target.value}))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Sauvegarder</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {loading ? (
             Array.from({length: 4}).map((_, index) => (
                <Card key={index} className="p-4">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-5 w-1/4 mt-1" />
                </Card>
            ))
          ) : (
            playerPayments.map((payment) => (
            <Link href={`/finances/players/${payment.id}`} key={payment.id}>
                <Card className="hover:shadow-lg transition-shadow p-4 flex items-center justify-between">
                    <span className="font-semibold text-sm">{payment.member}</span>
                    <Badge variant={getBadgeVariant(payment.status) as any} className="text-xs">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                </Card>
            </Link>
          )))}
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center"><UserCheck className="mr-2 h-7 w-7 text-primary" /> Entraîneurs (Salaires)</h2>
             <Dialog open={coachSalaryOpen} onOpenChange={setCoachSalaryOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un salaire
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddCoachSalary}>
                  <DialogHeader>
                    <DialogTitle>Ajouter un salaire d'entraîneur</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="coach">Entraîneur</Label>
                      <Select onValueChange={(value) => setNewCoachSalaryData(p => ({...p, member: value}))} value={newCoachSalaryData.member}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un entraîneur" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCoaches.map(coach => <SelectItem key={coach.id} value={coach.name}>{coach.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalAmount">Salaire Total (DH)</Label>
                      <Input id="totalAmount" type="number" placeholder="20000" value={newCoachSalaryData.totalAmount} onChange={(e) => setNewCoachSalaryData(p => ({...p, totalAmount: e.target.value}))} />
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="paidAmount">Montant payé (DH)</Label>
                      <Input id="paidAmount" type="number" placeholder="10000" value={newCoachSalaryData.paidAmount} onChange={(e) => setNewCoachSalaryData(p => ({...p, paidAmount: e.target.value}))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remainingAmount">Reste à payer (DH)</Label>
                      <Input id="remainingAmount" type="number" value={coachRemainingAmount} readOnly className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Mois de paie</Label>
                      <Input id="dueDate" type="month" value={newCoachSalaryData.dueDate} onChange={(e) => setNewCoachSalaryData(p => ({...p, dueDate: e.target.value}))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Sauvegarder</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {loading ? (
             Array.from({length: 3}).map((_, index) => (
                <Card key={index} className="p-4">
                     <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-5 w-1/4 mt-1" />
                </Card>
            ))
          ) : (
            coachSalaries.map((payment) => (
            <Link href={`/finances/coaches/${payment.id}`} key={payment.id}>
                 <Card className="hover:shadow-lg transition-shadow p-4 flex items-center justify-between">
                    <span className="font-semibold text-sm">{payment.member}</span>
                    <Badge variant={getBadgeVariant(payment.status) as any} className="text-xs">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                </Card>
            </Link>
          )))}
        </div>
      </div>
    </div>
  );
}

    