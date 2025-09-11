
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Banknote, Calendar as CalendarIcon, CheckCircle, Clock, XCircle, User, History, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useFinancialContext } from "@/context/financial-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubContext } from "@/context/club-context";

export function PlayerPaymentDetailClient({ id }: { id: string }) {
  const context = useFinancialContext();
  const { clubInfo } = useClubContext();
  const receiptRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  if (!context) {
    throw new Error("PlayerPaymentDetailClient must be used within a FinancialProvider");
  }

  const { loading, getPlayerPaymentById } = context;

  const payment = useMemo(() => getPlayerPaymentById(id), [id, getPlayerPaymentById]);

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


  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-1/3 mt-1" />
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
             <div className="mt-8">
                <Skeleton className="h-7 w-1/3 mb-4" />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-24" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return notFound();
  }
  
  const historyLink = `/finances/cotisations/${encodeURIComponent(payment.member)}`;

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

  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    if (!input || !payment) return;

    const originalWidth = input.style.width;
    input.style.width = '210mm';
    
    input.classList.add('pdf-export');
    
    html2canvas(input, { 
        scale: 2,
        backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgWidth = pdfWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`recu-cotisation-${payment.member.replace(/[\s/]/g, '-')}-${payment.dueDate}.pdf`);

      input.classList.remove('pdf-export');
      input.style.width = originalWidth;
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(historyLink)} className="flex items-center text-sm text-muted-foreground hover:underline p-0 h-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'historique de {payment.member}
        </Button>
         <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4"/>
            Télécharger le reçu
        </Button>
      </div>

        <Card>
            <div ref={receiptRef} className="p-4 bg-white text-black">
                <CardHeader>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">{clubInfo.name}</h1>
                        <p className="text-muted-foreground">Reçu de Cotisation</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">Reçu n°: {payment.id.substring(0,8)}</p>
                        <p className="text-sm">Date: {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl font-bold flex items-center"><User className="mr-3 h-8 w-8" />{payment.member}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-1">Détails de la Cotisation</CardDescription>
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
                            <span>Montant total:</span>
                            <span className="font-bold ml-auto">{payment.totalAmount.toFixed(2)} DH</span>
                        </div>
                        <div className="flex items-center gap-4 text-lg">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <span>Montant payé:</span>
                            <span className="font-bold ml-auto text-green-600">{payment.paidAmount.toFixed(2)} DH</span>
                        </div>
                        <div className="flex items-center gap-4 text-lg">
                            <XCircle className="h-6 w-6 text-red-500" />
                            <span>Reste à payer:</span>
                            <span className="font-bold ml-auto text-red-600">{payment.remainingAmount.toFixed(2)} DH</span>
                        </div>
                        <div className="flex items-center gap-4 text-lg">
                            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                            <span>Mois de la cotisation:</span>
                            <span className="font-bold ml-auto">{payment.dueDate}</span>
                        </div>
                    </div>

                    {formattedTransactions.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center"><History className="mr-2 h-6 w-6" />Historique des transactions</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date et Heure</TableHead>
                                        <TableHead className="text-right">Montant (DH)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formattedTransactions.map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{tx.date}</TableCell>
                                            <TableCell className="text-right font-medium">{tx.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                </CardContent>
            </div>
        </Card>
    </div>
  );
}
