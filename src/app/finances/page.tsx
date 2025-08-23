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
import { Badge } from "@/components/ui/badge";
import { finances, financialOverview } from "@/lib/data";
import { Banknote, Landmark } from "lucide-react";

export default function FinancesPage() {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Payé':
        return 'default';
      case 'En retard':
        return 'destructive';
      case 'En attente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Aperçu des paiements</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dû</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialOverview.totalDue.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements Effectués</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialOverview.paymentsMade.toFixed(2)} DH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements Restants</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialOverview.paymentsRemaining.toFixed(2)} DH</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Détails des Paiements</CardTitle>
          <CardDescription>
            Suivi des paiements des cotisations des membres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'échéance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finances.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.member}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(payment.status) as any}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
