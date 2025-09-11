
"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import { useFinancialContext } from "@/context/financial-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function CoachPaymentHistoryClient({ memberName }: { memberName: string }) {
  const context = useFinancialContext();
  const { toast } = useToast();

  if (!context) {
    throw new Error("CoachPaymentHistoryClient must be used within a FinancialProvider");
  }

  const { loading, coachSalaries, deleteCoachSalary } = context;

  const memberPayments = useMemo(() => {
    return coachSalaries
      .filter(p => p.member === memberName)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [memberName, coachSalaries]);

  const handleDelete = async (id: string) => {
    await deleteCoachSalary(id);
    toast({
        variant: "destructive",
        title: "Paiement supprimé",
        description: "L'entrée de paiement a été supprimée avec succès.",
    });
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-1/3 mt-1" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (memberPayments.length === 0 && !loading) {
     return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <Link href="/finances" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux finances
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <UserCheck className="mr-3 h-7 w-7" />
                        {memberName}
                    </CardTitle>
                    <CardDescription>
                        Historique des salaires mensuels.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aucun historique de paiement trouvé pour cet entraîneur.</p>
                </CardContent>
            </Card>
        </div>
    )
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Link href="/finances" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux finances
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <UserCheck className="mr-3 h-7 w-7" />
            {memberName}
          </CardTitle>
          <CardDescription>
            Historique des salaires mensuels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead>Montant Total</TableHead>
                <TableHead>Montant Payé</TableHead>
                <TableHead>Reste à payer</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.dueDate}</TableCell>
                  <TableCell>{payment.totalAmount.toFixed(2)} DH</TableCell>
                  <TableCell className="text-green-600">{payment.paidAmount.toFixed(2)} DH</TableCell>
                  <TableCell className={cn(
                      payment.remainingAmount > 0 ? "text-red-600" : "text-green-600"
                    )}
                  >
                      {payment.remainingAmount.toFixed(2)} DH
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(payment.status) as any}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                       <Link href={`/finances/coaches/receipt/${payment.id}`}>
                        Voir Reçu
                      </Link>
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">Supprimer</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce paiement.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(payment.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
