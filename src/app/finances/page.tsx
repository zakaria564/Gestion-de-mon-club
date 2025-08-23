
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { playerPayments, coachSalaries, playerPaymentsOverview, coachSalariesOverview } from "@/lib/data";
import { Banknote, Users, UserCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {playerPayments.map((payment) => (
            <Card key={payment.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{payment.member}</CardTitle>
                <CardDescription>Date de paiement: {payment.dueDate}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Payé</span>
                        <span className="font-semibold">{payment.paidAmount.toFixed(2)} DH</span>
                    </div>
                    <Progress value={(payment.paidAmount / payment.totalAmount) * 100} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total: {payment.totalAmount.toFixed(2)} DH</span>
                        <span>Restant: {payment.remainingAmount.toFixed(2)} DH</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Badge variant={getBadgeVariant(payment.status) as any} className="w-full justify-center">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {coachSalaries.map((payment) => (
            <Card key={payment.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{payment.member}</CardTitle>
                 <CardDescription>Date de paiement: {payment.dueDate}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Payé</span>
                        <span className="font-semibold">{payment.paidAmount.toFixed(2)} DH</span>
                    </div>
                    <Progress value={(payment.paidAmount / payment.totalAmount) * 100} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total: {payment.totalAmount.toFixed(2)} DH</span>
                        <span>Restant: {payment.remainingAmount.toFixed(2)} DH</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Badge variant={getBadgeVariant(payment.status) as any} className="w-full justify-center">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

    