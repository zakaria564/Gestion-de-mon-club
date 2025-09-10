
"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format, parse } from 'date-fns';
import { usePlayersContext } from "@/context/players-context";
import { useFinancialContext } from "@/context/financial-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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


export function PlayerPaymentsClient({ playerId }: { playerId: string }) {
  const playersContext = usePlayersContext();
  const financialContext = useFinancialContext();

  if (!playersContext || !financialContext) {
    throw new Error("Component must be used within Players and Financial providers");
  }

  const { getPlayerById, loading: playersLoading } = playersContext;
  const { playerPayments, addPlayerPayment, loading: financialLoading } = financialContext;
  
  const [open, setOpen] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState({
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
  });

  const player = useMemo(() => getPlayerById(playerId), [playerId, getPlayerById]);

  const paymentsForPlayer = useMemo(() => {
    if (!player) return [];
    return playerPayments
      .filter(p => p.member === player.name)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [player, playerPayments]);

  const { totalPaid, totalDue } = useMemo(() => {
    return paymentsForPlayer.reduce((acc, p) => {
        acc.totalPaid += p.paidAmount;
        acc.totalDue += p.totalAmount;
        return acc;
    }, { totalPaid: 0, totalDue: 0 });
  }, [paymentsForPlayer]);

  const loading = playersLoading || financialLoading;

  if (loading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-96 w-full mt-6" />
        </div>
    )
  }

  if (!player) {
    return notFound();
  }

  const remainingAmount = useMemo(() => {
    const total = parseFloat(newPaymentData.totalAmount) || 0;
    const paid = parseFloat(newPaymentData.paidAmount) || 0;
    return (total - paid).toFixed(2);
  }, [newPaymentData.totalAmount, newPaymentData.paidAmount]);

  const handleAddPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalAmount = parseFloat(newPaymentData.totalAmount);
    const paidAmount = parseFloat(newPaymentData.paidAmount);

    if (!isNaN(totalAmount) && !isNaN(paidAmount) && newPaymentData.dueDate) {
        await addPlayerPayment({
            member: player.name,
            totalAmount,
            initialPaidAmount: paidAmount,
            dueDate: newPaymentData.dueDate,
        });
        setOpen(false);
        setNewPaymentData({ totalAmount: '', paidAmount: '', dueDate: '' });
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'payé': return 'default';
      case 'partiel': return 'secondary';
      case 'non payé': return 'destructive';
      default: return 'outline';
    }
  };
  
  const formattedDate = (dateString: string) => {
    try {
        if (dateString.length === 7) { // yyyy-MM
            return format(parse(dateString, 'yyyy-MM', new Date()), 'MMMM yyyy');
        }
        return format(parse(dateString, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
    } catch {
        return dateString;
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
            <Link href="/finances" className="flex items-center text-sm text-muted-foreground hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la vue d'ensemble
            </Link>
             <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une cotisation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddPayment}>
                  <DialogHeader>
                    <DialogTitle>Nouvelle Cotisation pour {player.name}</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Mois de la Cotisation</Label>
                      <Input id="dueDate" type="month" value={newPaymentData.dueDate} onChange={(e) => setNewPaymentData(p => ({...p, dueDate: e.target.value}))} required/>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalAmount">Montant total (DH)</Label>
                      <Input id="totalAmount" type="number" placeholder="300" value={newPaymentData.totalAmount} onChange={(e) => setNewPaymentData(p => ({...p, totalAmount: e.target.value}))} required/>
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="paidAmount">Montant payé (DH)</Label>
                      <Input id="paidAmount" type="number" placeholder="150" value={newPaymentData.paidAmount} onChange={(e) => setNewPaymentData(p => ({...p, paidAmount: e.target.value}))} required/>
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
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo"/>
                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-2xl">{player.name}</CardTitle>
                <CardDescription>Historique des cotisations</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Dû</CardDescription>
                        <CardTitle className="text-2xl">{totalDue.toFixed(2)} DH</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Payé</CardDescription>
                        <CardTitle className="text-2xl text-green-600">{totalPaid.toFixed(2)} DH</CardTitle>
                    </CardHeader>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Solde Restant</CardDescription>
                        <CardTitle className="text-2xl text-red-600">{(totalDue - totalPaid).toFixed(2)} DH</CardTitle>
                    </CardHeader>
                </Card>
            </div>
            
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Montant Total</TableHead>
                    <TableHead>Montant Payé</TableHead>
                    <TableHead>Reste</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Progression</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {paymentsForPlayer.map((payment) => (
                    <TableRow key={payment.id} className="cursor-pointer" onClick={() => window.location.href = `/finances/players/${playerId}/${payment.id}`}>
                        <TableCell className="font-medium">{formattedDate(payment.dueDate)}</TableCell>
                        <TableCell>{payment.totalAmount.toFixed(2)} DH</TableCell>
                        <TableCell className="text-green-600">{payment.paidAmount.toFixed(2)} DH</TableCell>
                        <TableCell className="text-red-600">{payment.remainingAmount.toFixed(2)} DH</TableCell>
                        <TableCell><Badge variant={getBadgeVariant(payment.status)}>{payment.status}</Badge></TableCell>
                        <TableCell className="text-right w-[150px]">
                            <Progress value={(payment.totalAmount > 0 ? (payment.paidAmount / payment.totalAmount) * 100 : 100)} className="h-2" />
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            {paymentsForPlayer.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    Aucun paiement enregistré pour ce joueur.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
