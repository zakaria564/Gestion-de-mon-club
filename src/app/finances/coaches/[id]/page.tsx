
"use client";

import { useState, useMemo } from "react";
import { coachSalaries } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Banknote, Calendar, CheckCircle, Clock, XCircle, UserCheck, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
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


export default function CoachPaymentDetailPage() {
  const params = useParams();
  const payment = useMemo(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    return coachSalaries.find((p) => p.id.toString() === id);
  }, [params.id]);

  const [open, setOpen] = useState(false);

  if (!payment) {
    notFound();
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'payé':
            return <CheckCircle className="h-8 w-8 text-green-500" />;
        case 'non payé':
            return <XCircle className="h-8 w-8 text-red-500" />;
        case 'partiel':
            return <Clock className="h-8 w-8 text-amber-500" />;
        default:
            return null;
    }
  }

  const canAddComplement = payment.status === 'partiel' || payment.status === 'non payé';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/finances" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux finances
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-3xl font-bold flex items-center"><UserCheck className="mr-3 h-8 w-8" />{payment.member}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-1">Détails du Salaire</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                {getStatusIcon(payment.status)}
                <Badge variant={getBadgeVariant(payment.status) as any} className="text-lg">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-center gap-4 text-lg">
                    <Banknote className="h-6 w-6 text-muted-foreground" />
                    <span>Salaire Total:</span>
                    <span className="font-bold ml-auto">{payment.totalAmount.toFixed(2)} DH</span>
                </div>
                <div className="flex items-center gap-4 text-lg">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span>Montant payé:</span>
                    <span className="font-bold ml-auto text-green-600 dark:text-green-400">{payment.paidAmount.toFixed(2)} DH</span>
                </div>
                 <div className="flex items-center gap-4 text-lg">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span>Reste à payer:</span>
                    <span className="font-bold ml-auto text-red-600 dark:text-red-400">{payment.remainingAmount.toFixed(2)} DH</span>
                </div>
                 <div className="flex items-center gap-4 text-lg">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                    <span>Mois de paie:</span>
                    <span className="font-bold ml-auto">{payment.dueDate}</span>
                </div>
            </div>
        </CardContent>
         {canAddComplement && (
            <CardFooter className="justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un complément
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un paiement complémentaire</DialogTitle>
                      <DialogDescription>
                        Le montant restant à payer est de {payment.remainingAmount.toFixed(2)} DH.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="complementAmount">Montant du complément (DH)</Label>
                        <Input id="complementAmount" type="number" placeholder={payment.remainingAmount.toFixed(2)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Sauvegarder</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
