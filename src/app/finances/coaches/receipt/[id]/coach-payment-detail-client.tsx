
"use client";

import { useState, useMemo, useEffect, useRef, use } from "react";
import { notFound, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Banknote, Calendar as CalendarIcon, CheckCircle, Clock, XCircle, History, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useFinancialContext } from "@/context/financial-context";
import { useCoachesContext } from "@/context/coaches-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubContext } from "@/context/club-context";
import { ClubLogo } from "@/components/club-logo";

export function CoachPaymentDetailClient({ id: idParam }: { id: any }) {
  const financialCtx = useFinancialContext();
  const coachesCtx = useCoachesContext();
  const { clubInfo } = useClubContext();
  const receiptRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const id = typeof idParam === 'string' ? idParam : use(idParam as unknown as Promise<{id: string}>).id;

  if (!financialCtx || !coachesCtx) {
    throw new Error("CoachPaymentDetailClient must be used within FinancialProvider and CoachesProvider");
  }

  const { loading: financialLoading, getCoachSalaryById } = financialCtx;
  const { loading: coachesLoading } = coachesCtx;
  
  const payment = useMemo(() => getCoachSalaryById(id), [id, getCoachSalaryById]);
  const loading = financialLoading || coachesLoading;

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'payé': return 'default';
      case 'non payé': return 'destructive';
      case 'partiel': return 'secondary';
      default: return 'outline';
    }
  };

  const professionalReceiptNumber = useMemo(() => {
    if (!payment) return "";
    const dateParts = payment.dueDate.split('-');
    return `RS-${dateParts[0]}-${dateParts[1]}-${payment.id.substring(0, 4).toUpperCase()}`;
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
    html2canvas(input, { scale: 2, backgroundColor: '#ffffff', useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`recu-salaire-${payment.member.replace(/[\s/]/g, '-')}-${payment.dueDate}.pdf`);
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center text-sm text-muted-foreground hover:underline p-0 h-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
         <Button variant="outline" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4"/> PDF</Button>
      </div>

      <Card className="border-none shadow-none bg-white">
        <div ref={receiptRef} className="p-12 bg-white text-black min-h-[297mm]">
            <header className="flex justify-between border-b-2 border-black pb-6 mb-8">
                <div className="flex items-center gap-4">
                    <ClubLogo className="size-20" />
                    <div><h1 className="text-2xl font-bold">{clubInfo.name}</h1><p>Reçu de Salaire</p></div>
                </div>
                <div className="text-right"><p className="font-bold">N° : {professionalReceiptNumber}</p><p>Émis le : {new Date().toLocaleDateString('fr-FR')}</p></div>
            </header>
            
            <div className="flex justify-between items-start mb-12">
                <div><h2 className="text-3xl font-bold">{payment.member}</h2><p className="text-muted-foreground">Salaire Mensuel</p></div>
                <Badge variant={getBadgeVariant(payment.status) as any} className="text-lg px-4 py-1">{payment.status.toUpperCase()}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-8 p-8 border-2 border-black rounded-lg mb-12 bg-white">
                <div className="flex justify-between text-xl text-black"><span>Salaire Total :</span><span className="font-bold">{payment.totalAmount.toFixed(2)} DH</span></div>
                <div className="flex justify-between text-xl text-black"><span>Montant Versé :</span><span className="font-bold text-green-600">{payment.paidAmount.toFixed(2)} DH</span></div>
                <div className="flex justify-between text-xl border-t border-black pt-4 text-black"><span>Reste à payer :</span><span className="font-bold text-red-600">{payment.remainingAmount.toFixed(2)} DH</span></div>
                <div className="flex justify-between text-xl border-t border-black pt-4 text-black"><span>Mois de paie :</span><span className="font-bold">{payment.dueDate}</span></div>
            </div>

            {payment.transactions.length > 0 && (
                <div className="mb-24">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-4 pb-2 text-black flex items-center gap-2"><History className="h-5 w-5" /> Historique des Paiements</h3>
                    <Table className="bg-transparent">
                        <TableHeader><TableRow className="border-black bg-transparent hover:bg-transparent"><TableHead className="text-black font-bold bg-transparent">Date et Heure</TableHead><TableHead className="text-right text-black font-bold bg-transparent">Montant (DH)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {payment.transactions.map(tx => (
                                <TableRow key={tx.id} className="border-gray-200 hover:bg-transparent"><TableCell className="text-black bg-transparent">{new Date(tx.date).toLocaleString('fr-FR')}</TableCell><TableCell className="text-right font-bold text-black bg-transparent">{tx.amount.toFixed(2)}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className="mt-auto flex justify-center w-full">
                <div className="text-center"><p className="font-bold text-lg text-black">Signature et Cachet du Club</p></div>
            </div>
        </div>
      </Card>
    </div>
  );
}
