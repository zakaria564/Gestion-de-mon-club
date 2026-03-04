"use client";

import { useMemo, useRef, use } from "react";
import { notFound, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, Download } from "lucide-react";
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

  if (!financialCtx || !coachesCtx) return null;

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

  if (loading) return <div className="p-8"><Skeleton className="h-full w-full" /></div>;
  if (!payment) return notFound();
  
  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    if (!input) return;
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
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
        <Button variant="outline" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4"/> PDF</Button>
      </div>

      <Card className="border-none shadow-none bg-white">
        <div ref={receiptRef} className="p-12 bg-white text-black min-h-[297mm] flex flex-col">
            <header className="flex justify-between border-b-2 border-black pb-6 mb-8 bg-white">
                <div className="flex items-center gap-4 bg-white">
                    <ClubLogo className="size-20" />
                    <div className="bg-white"><h1 className="text-2xl font-bold bg-white">{clubInfo.name}</h1><p className="bg-white text-sm">Reçu de Salaire</p></div>
                </div>
                <div className="text-right bg-white"><p className="font-bold bg-white">N° : {professionalReceiptNumber}</p><p className="bg-white text-sm">Émis le : {new Date().toLocaleDateString('fr-FR')}</p></div>
            </header>
            <div className="flex justify-between items-start mb-12 bg-white">
                <div className="bg-white"><h2 className="text-3xl font-bold bg-white">{payment.member}</h2><p className="text-muted-foreground bg-white">Salaire Mensuel</p></div>
                <Badge variant={getBadgeVariant(payment.status) as any} className="text-lg px-4 py-1">{payment.status.toUpperCase()}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-8 p-8 border-2 border-black rounded-lg mb-12 bg-white">
                <div className="flex justify-between text-xl text-black bg-white"><span>Salaire Total :</span><span className="font-bold bg-white">{payment.totalAmount.toFixed(2)} DH</span></div>
                <div className="flex justify-between text-xl text-black bg-white"><span>Montant Versé :</span><span className="font-bold text-green-600 bg-white">{payment.paidAmount.toFixed(2)} DH</span></div>
                <div className="flex justify-between text-xl border-t border-black pt-4 text-black bg-white"><span>Reste à payer :</span><span className="font-bold text-red-600 bg-white">{payment.remainingAmount.toFixed(2)} DH</span></div>
                <div className="flex justify-between text-xl border-t border-black pt-4 text-black bg-white"><span>Mois de paie :</span><span className="font-bold bg-white">{payment.dueDate}</span></div>
            </div>
            {payment.transactions.length > 0 && (
                <div className="mb-24 bg-white">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-4 pb-2 text-black flex items-center gap-2 bg-white"><History className="h-5 w-5 bg-white" /> Historique des Paiements</h3>
                    <Table className="bg-white border-none">
                        <TableHeader className="bg-white"><TableRow className="border-black bg-white hover:bg-white"><TableHead className="text-black font-bold bg-white border-none">Date et Heure</TableHead><TableHead className="text-right text-black font-bold bg-white border-none">Montant (DH)</TableHead></TableRow></TableHeader>
                        <TableBody className="bg-white">
                            {payment.transactions.map(tx => (
                                <TableRow key={tx.id} className="border-gray-200 hover:bg-white bg-white"><TableCell className="text-black bg-white border-none">{new Date(tx.date).toLocaleString('fr-FR')}</TableCell><TableCell className="text-right font-bold text-black bg-white border-none">{tx.amount.toFixed(2)}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            <div className="mt-auto flex justify-center w-full bg-white pb-12">
                <div className="text-center bg-white"><p className="font-bold text-lg text-black bg-white">Signature et Cachet du Club</p></div>
            </div>
        </div>
      </Card>
    </div>
  );
}
