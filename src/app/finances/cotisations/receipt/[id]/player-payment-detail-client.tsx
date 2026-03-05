
"use client";

import React, { useMemo, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useFinancialContext } from "@/context/financial-context";
import { useClubContext } from "@/context/club-context";
import { ClubLogo } from "@/components/club-logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, History } from "lucide-react";

export function PlayerPaymentDetailClient({ id }: { id: string }) {
  const { getPlayerPaymentById, loading: financialLoading } = useFinancialContext();
  const { clubInfo } = useClubContext();
  const receiptRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const payment = useMemo(() => getPlayerPaymentById(id), [id, getPlayerPaymentById]);

  if (financialLoading) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;
  if (!payment) return notFound();

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'payé': return 'default';
      case 'partiel': return 'secondary';
      default: return 'outline';
    }
  };

  const receiptNumber = `RC-${payment.dueDate.replace('-', '')}-${payment.id.substring(0, 4).toUpperCase()}`;

  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    if (!input) return;
    html2canvas(input, { scale: 2, backgroundColor: '#ffffff', useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`recu-cotisation-${payment.member.replace(/\s/g, '-')}-${payment.dueDate}.pdf`);
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-muted/5 min-h-screen">
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
        <Button variant="default" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4" /> Télécharger PDF</Button>
      </div>

      <Card className="max-w-4xl mx-auto border-none shadow-xl overflow-hidden bg-white">
        <div ref={receiptRef} className="p-12 bg-white text-black min-h-[297mm] flex flex-col font-sans">
          <header className="flex justify-between border-b-2 border-black pb-8 mb-10 bg-white">
            <div className="flex items-center gap-6 bg-white">
              <ClubLogo className="size-24" />
              <div className="bg-white">
                <h1 className="text-3xl font-black uppercase bg-white">{clubInfo.name}</h1>
                <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase bg-white">Reçu de Cotisation</p>
              </div>
            </div>
            <div className="text-right bg-white">
              <p className="font-bold text-xl bg-white">N° {receiptNumber}</p>
              <p className="text-sm text-muted-foreground bg-white">Date: {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </header>

          <div className="flex justify-between items-start mb-12 bg-white">
            <div className="bg-white">
              <h2 className="text-4xl font-black mb-1 bg-white">{payment.member}</h2>
              <p className="text-lg text-muted-foreground font-medium bg-white">Période: {payment.dueDate}</p>
            </div>
            <Badge variant={getBadgeVariant(payment.status) as any} className="text-xl px-6 py-2 uppercase tracking-tighter">{payment.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-8 p-10 border-2 border-black rounded-2xl mb-12 bg-white">
            <div className="flex justify-between text-2xl bg-white"><span>Total dû</span><span className="font-bold bg-white">{payment.totalAmount.toFixed(2)} DH</span></div>
            <div className="flex justify-between text-2xl bg-white"><span>Versé</span><span className="font-bold text-green-600 bg-white">{payment.paidAmount.toFixed(2)} DH</span></div>
            <div className="flex justify-between text-2xl border-t border-black pt-6 col-span-2 bg-white"><span>Reste à payer</span><span className="font-bold text-red-600 bg-white">{payment.remainingAmount.toFixed(2)} DH</span></div>
          </div>

          {payment.transactions.length > 0 && (
            <div className="mb-20 flex-1 bg-white">
              <h3 className="text-xl font-black border-b border-black mb-6 pb-2 flex items-center gap-3 uppercase bg-white"><History className="h-6 w-6" /> Historique des versements</h3>
              <Table className="bg-white">
                <TableHeader><TableRow className="border-black bg-white hover:bg-white"><TableHead className="text-black font-bold uppercase text-xs">Date et Heure</TableHead><TableHead className="text-right text-black font-bold uppercase text-xs">Montant (DH)</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payment.transactions.map(tx => (
                    <TableRow key={tx.id} className="border-gray-100 hover:bg-white bg-white">
                      <TableCell className="py-4 font-medium">{new Date(tx.date).toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="text-right font-black text-lg">{tx.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-auto pt-12 text-center border-t border-dotted border-gray-300 bg-white">
            <p className="font-black text-xl uppercase tracking-widest bg-white">Signature et Cachet du Club</p>
            <div className="h-32 flex items-center justify-center text-gray-300 italic bg-white">
              [Document officiel - Trésorerie {clubInfo.name}]
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
