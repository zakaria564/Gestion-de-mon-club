
"use client";

import { useState, useMemo, useEffect, useRef, use } from "react";
import { notFound, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Banknote, Calendar as CalendarIcon, CheckCircle, Clock, XCircle, User, History, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useFinancialContext } from "@/context/financial-context";
import { usePlayersContext } from "@/context/players-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubContext } from "@/context/club-context";
import { ClubLogo } from "@/components/club-logo";

export function PlayerPaymentDetailClient({ id: idParam }: { id: any }) {
  const financialCtx = useFinancialContext();
  const playersCtx = usePlayersContext();
  const { clubInfo } = useClubContext();
  const receiptRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const id = typeof idParam === 'string' ? idParam : use(idParam as unknown as Promise<{id: string}>).id;

  if (!financialCtx || !playersCtx) {
    throw new Error("PlayerPaymentDetailClient must be used within a FinancialProvider and PlayersProvider");
  }

  const { loading: financialLoading, getPlayerPaymentById } = financialCtx;
  const { players, loading: playersLoading } = playersCtx;

  const payment = useMemo(() => getPlayerPaymentById(id), [id, getPlayerPaymentById]);

  const loading = financialLoading || playersLoading;

  const [formattedTransactions, setFormattedTransactions] = useState<{ id: number; date: string; amount: number; }[]>([]);

  useEffect(() => {
    if (payment) {
      setFormattedTransactions(
        payment.transactions.map(tx => ({
          ...tx,
          date: new Date(tx.date).toLocaleString('fr-FR'),
        }))
      );
    }
  }, [payment]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'payé': return 'default';
      case 'non payé': return 'destructive';
      case 'partiel': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'payé': return <CheckCircle className="h-8 w-8 text-green-500" />;
        case 'non payé': return <XCircle className="h-8 w-8 text-red-500" />;
        case 'partiel': return <Clock className="h-8 w-8 text-amber-500" />;
        default: return null;
    }
  }

  // Format de reçu professionnel : RC-ANNEE-MOIS-SHORTID
  const professionalReceiptNumber = useMemo(() => {
    if (!payment) return "";
    const dateParts = payment.dueDate.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const shortId = payment.id.substring(0, 4).toUpperCase();
    return `RC-${year}-${month}-${shortId}`;
  }, [payment]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-24 mb-4" />
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><Separator /><CardContent className="pt-6 space-y-6"><Skeleton className="h-6 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!payment) return notFound();
  
  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    if (!input || !payment) return;
    const originalWidth = input.style.width;
    input.style.width = '210mm';
    html2canvas(input, { scale: 2, backgroundColor: '#ffffff', useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`recu-cotisation-${payment.member.replace(/[\s/]/g, '-')}-${payment.dueDate}.pdf`);
      input.style.width = originalWidth;
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center text-sm text-muted-foreground hover:underline p-0 h-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
         <Button variant="outline" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4"/> Télécharger le reçu</Button>
      </div>

        <Card>
            <div ref={receiptRef} className="p-8 bg-white text-black min-h-[297mm]">
                <CardHeader className="px-0">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4 border-b pb-6">
                     <div className="flex items-center gap-4">
                        <ClubLogo className="size-20" />
                        <div>
                            <h1 className="text-3xl font-bold">{clubInfo.name}</h1>
                            <p className="text-muted-foreground text-lg">Reçu de Cotisation</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="font-bold">N° : {professionalReceiptNumber}</p>
                        <p className="text-sm">Date d'émission: {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-3xl font-bold flex items-center gap-3"><User className="h-8 w-8" />{payment.member}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-1">Historique de paiement pour la cotisation mensuelle</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getBadgeVariant(payment.status) as any} className="text-lg px-4 py-1">
                            {payment.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                </CardHeader>
                <Separator className="my-6" />
                <CardContent className="px-0 pt-6">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 bg-muted/30 p-6 rounded-lg">
                        <div className="flex items-center gap-4 text-xl">
                            <Banknote className="h-7 w-7 text-muted-foreground" />
                            <span>Montant total dû:</span>
                            <span className="font-bold ml-auto">{payment.totalAmount.toFixed(2)} DH</span>
                        </div>
                        <div className="flex items-center gap-4 text-xl">
                            <CheckCircle className="h-7 w-7 text-green-500" />
                            <span>Montant déjà payé:</span>
                            <span className="font-bold ml-auto text-green-600">{payment.paidAmount.toFixed(2)} DH</span>
                        </div>
                        <div className="flex items-center gap-4 text-xl border-t pt-4">
                            {payment.remainingAmount > 0 ? <XCircle className="h-7 w-7 text-red-500" /> : <CheckCircle className="h-7 w-7 text-green-500" />}
                            <span>Reste à payer:</span>
                            <span className={`font-bold ml-auto ${payment.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {payment.remainingAmount.toFixed(2)} DH
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xl border-t pt-4">
                            <CalendarIcon className="h-7 w-7 text-muted-foreground" />
                            <span>Mois concerné:</span>
                            <span className="font-bold ml-auto">{payment.dueDate}</span>
                        </div>
                    </div>

                    {formattedTransactions.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-2xl font-bold mb-6 flex items-center border-b pb-2"><History className="mr-3 h-7 w-7" />Historique des Versements</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="text-lg">Date et Heure</TableHead>
                                        <TableHead className="text-right text-lg">Montant Versé (DH)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formattedTransactions.map(tx => (
                                        <TableRow key={tx.id} className="border-b">
                                            <TableCell className="text-lg">{tx.date}</TableCell>
                                            <TableCell className="text-right font-bold text-lg">{tx.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="mt-32 flex justify-center">
                        <div className="text-center">
                            <p className="font-bold text-xl underline mb-12">Signature et Cachet du Club</p>
                            <div className="h-24"></div>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    </div>
  );
}
