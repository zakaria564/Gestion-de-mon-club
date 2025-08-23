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
import { playerPayments, coachSalaries, playerPaymentsOverview, coachSalariesOverview } from "@/lib/data";
import { Banknote, Users, UserCheck } from "lucide-react";

export default function FinancesPage() {
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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center"><Users className="mr-2 h-8 w-8 text-primary" /> Joueurs (Cotisations)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Montant total (en DH)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerPaymentsOverview.totalDue.toFixed(2)} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avance payée (en DH)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerPaymentsOverview.paymentsMade.toFixed(2)} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reste à payer (en DH)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerPaymentsOverview.paymentsRemaining.toFixed(2)} DH</div>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Détails des Cotisations</CardTitle>
            <CardDescription>
              Suivi des cotisations des joueurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Montant Total</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Reste à payer</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de paiement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.member}</TableCell>
                    <TableCell>{payment.totalAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.paidAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.remainingAmount.toFixed(2)} DH</TableCell>
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

      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center"><UserCheck className="mr-2 h-8 w-8 text-primary" /> Entraîneurs (Salaires)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salaire mensuel (en DH)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coachSalariesOverview.totalDue.toFixed(2)} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avance payée (en DH)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coachSalariesOverview.paymentsMade.toFixed(2)} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reste à payer (en DH)</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coachSalariesOverview.paymentsRemaining.toFixed(2)} DH</div>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Détails des Salaires</CardTitle>
            <CardDescription>
              Suivi des salaires des entraîneurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entraîneur</TableHead>
                  <TableHead>Montant Total</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Reste à payer</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de paiement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coachSalaries.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.member}</TableCell>
                    <TableCell>{payment.totalAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.paidAmount.toFixed(2)} DH</TableCell>
                    <TableCell>{payment.remainingAmount.toFixed(2)} DH</TableCell>
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
    </div>
  );
}
