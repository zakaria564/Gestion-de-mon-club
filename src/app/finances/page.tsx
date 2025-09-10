
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Banknote, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import { useFinancialContext } from "@/context/financial-context";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { Skeleton } from "@/components/ui/skeleton";
import type { Payment } from "@/lib/financial-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type MemberFinancials = {
    id: string;
    name: string;
    photo?: string;
    totalPaid: number;
    totalDue: number;
    payments: Payment[];
}

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
    playerPaymentsOverview,
    coachSalariesOverview
  } = financialContext;

  const { players, loading: playersLoading } = playersContext;
  const { coaches, loading: coachesLoading } = coachesContext;

  const loading = financialLoading || playersLoading || coachesLoading;

  const playerFinancials = useMemo(() => {
    return players.map(player => {
        const payments = playerPayments.filter(p => p.member === player.name);
        const totalPaid = payments.reduce((acc, p) => acc + p.paidAmount, 0);
        const totalDue = payments.reduce((acc, p) => acc + p.totalAmount, 0);
        return {
            id: player.id,
            name: player.name,
            photo: player.photo,
            totalPaid,
            totalDue,
            payments
        };
    });
  }, [players, playerPayments]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div>
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center"><Users className="mr-2 h-7 w-7 text-primary" /> Cotisations des Joueurs</h2>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {loading ? (
             Array.from({length: 8}).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            ))
          ) : (
            playerFinancials.map((player) => (
            <Link href={`/finances/players/${player.id}`} key={player.id}>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
                            <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">{player.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">
                            {player.totalPaid.toFixed(2)} DH / {player.totalDue.toFixed(2)} DH
                        </div>
                        <Progress value={(player.totalDue > 0 ? (player.totalPaid / player.totalDue) * 100 : 100)} className="h-2" />
                    </CardContent>
                </Card>
            </Link>
          )))}
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center"><UserCheck className="mr-2 h-7 w-7 text-primary" /> Salaires des Entraîneurs</h2>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {loading ? (
             Array.from({length: 3}).map((_, index) => (
                 <Card key={index}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            ))
          ) : (
            coaches.map(coach => {
                const payments = coachSalaries.filter(p => p.member === coach.name);
                if (payments.length === 0) return null;
                
                const totalPaid = payments.reduce((acc, p) => acc + p.paidAmount, 0);
                const totalDue = payments.reduce((acc, p) => acc + p.totalAmount, 0);

                return (
                    <Card key={coach.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="h-12 w-12">
                                <AvatarImage src={coach.photo} alt={coach.name} data-ai-hint="coach photo"/>
                                <AvatarFallback>{coach.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base">{coach.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="text-sm text-muted-foreground mb-2">
                                {totalPaid.toFixed(2)} DH / {totalDue.toFixed(2)} DH
                            </div>
                             <Progress value={(totalDue > 0 ? (totalPaid / totalDue) * 100 : 100)} className="h-2" />
                             <div className="mt-4 flex flex-wrap gap-2">
                                {payments.map(p => (
                                    <Link key={p.id} href={`/finances/coaches/${p.id}`}>
                                        <Badge variant={p.status === 'payé' ? 'default' : p.status === 'partiel' ? 'secondary' : 'destructive'} className="cursor-pointer">
                                            {p.dueDate}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            })
          )}
        </div>
      </div>
    </div>
  );
}
