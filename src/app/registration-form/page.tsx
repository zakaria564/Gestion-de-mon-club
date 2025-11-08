
"use client";

import { useRef, createRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { ClubLogo } from "@/components/club-logo";
import { useClubContext } from "@/context/club-context";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegistrationFormPage() {
  const { clubInfo } = useClubContext();
  const adultFormRef = createRef<HTMLDivElement>();
  const minorFormRef = createRef<HTMLDivElement>();
  const documentsRef = createRef<HTMLDivElement>();
  
  const currentSeason = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const handleDownloadPDF = (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    const input = ref.current;
    if (!input) return;

    const originalWidth = input.style.width;
    input.style.width = '210mm'; // A4 width for consistent scaling
    
    html2canvas(input, { 
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgWidth = pdfWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);
      
      input.style.width = originalWidth; // Restore original width
    });
  };
  
  const FormField = ({ label }: { label: string }) => (
    <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
      <label className="text-sm font-medium whitespace-nowrap">{label} :</label>
      <div className="w-full"></div>
    </div>
  );
  
  const CheckboxField = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 border border-black"></div>
      <span className="text-sm">{label}</span>
    </div>
  );

  const DocumentsList = () => (
    <section className="mb-6">
      <h3 className="font-bold text-lg mb-3 underline">PIÈCES À FOURNIR</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        <CheckboxField label="1 Certificat médical d'aptitude sportive" />
        <CheckboxField label="2 Photos d'identité" />
        <CheckboxField label="1 Photocopie de la CIN / Passeport" />
        <CheckboxField label="1 Extrait d'acte de naissance" />
        <CheckboxField label="Autorisation parentale (pour les mineurs)" />
        <CheckboxField label="Paiement des frais d'inscription (300 DH)" />
      </div>
    </section>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Fiches d'inscription</h2>
      </div>

      <Tabs defaultValue="minor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="minor">Inscription Mineur</TabsTrigger>
          <TabsTrigger value="adult">Inscription Adulte</TabsTrigger>
          <TabsTrigger value="documents">Pièces à Fournir</TabsTrigger>
        </TabsList>
        
        <TabsContent value="minor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fiche d'Inscription (Mineur)</CardTitle>
              <CardDescription>Destinée aux joueurs n'ayant pas atteint l'âge de la majorité.</CardDescription>
              <Button onClick={() => handleDownloadPDF(minorFormRef, `fiche-inscription-mineur-${clubInfo.name.toLowerCase().replace(/ /g, "-")}.pdf`)} className="w-fit">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto bg-white dark:bg-background p-4 sm:p-8 rounded-md shadow-lg">
                <div ref={minorFormRef} className="text-black bg-white p-4">
                  <header className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      <ClubLogo className="size-20" />
                      <div>
                        <h1 className="text-2xl font-bold uppercase">{clubInfo.name}</h1>
                        <p className="text-lg">Fiche d’inscription (Joueur Mineur)</p>
                        <p className="font-semibold">Saison {currentSeason}</p>
                      </div>
                    </div>
                    <div className="h-32 w-28 border-2 border-black flex items-center justify-center text-sm text-gray-500">
                      Photo
                    </div>
                  </header>
                  <section className="mb-6">
                    <h3 className="font-bold text-lg mb-3 underline">INFORMATIONS PERSONNELLES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <FormField label="Nom et Prénom" />
                      <FormField label="Date de naissance" />
                      <FormField label="Lieu de naissance" />
                      <FormField label="Nationalité" />
                      <FormField label="Adresse complète" />
                      <FormField label="E-mail" />
                      <FormField label="Téléphone" />
                    </div>
                  </section>
                  <section className="mb-6">
                    <h3 className="font-bold text-lg mb-3 underline">INFORMATIONS SPORTIVES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <FormField label="Catégorie" />
                      <FormField label="Poste de prédilection" />
                    </div>
                  </section>
                  <section className="mb-6">
                    <h3 className="font-bold text-lg mb-3 underline">TUTEUR LÉGAL (POUR LES MINEURS)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <FormField label="Nom et Prénom du tuteur" />
                      <FormField label="Lien de parenté" />
                      <FormField label="N° CIN du tuteur" />
                      <FormField label="Téléphone du tuteur" />
                    </div>
                  </section>
                  <footer className="pt-8">
                    <p className="text-xs mb-8">
                      Je soussigné(e), ...................................................................., responsable légal du joueur, déclare autoriser mon enfant à participer aux activités sportives organisées par le club pour la saison {currentSeason}. J'ai pris connaissance du règlement intérieur du club et m'engage à le respecter.
                    </p>
                    <div className="flex justify-center items-center text-center mt-16">
                        <div>
                            <p className="font-semibold">Signature du tuteur légal</p>
                            <p className="text-xs">(Précédée de la mention "Lu et approuvé")</p>
                        </div>
                    </div>
                  </footer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adult" className="mt-4">
           <Card>
            <CardHeader>
              <CardTitle>Fiche d'Inscription (Majeur)</CardTitle>
              <CardDescription>Destinée aux joueurs adultes.</CardDescription>
               <Button onClick={() => handleDownloadPDF(adultFormRef, `fiche-inscription-adulte-${clubInfo.name.toLowerCase().replace(/ /g, "-")}.pdf`)} className="w-fit">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto bg-white dark:bg-background p-4 sm:p-8 rounded-md shadow-lg">
                <div ref={adultFormRef} className="text-black bg-white p-4">
                  <header className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      <ClubLogo className="size-20" />
                      <div>
                        <h1 className="text-2xl font-bold uppercase">{clubInfo.name}</h1>
                        <p className="text-lg">Fiche d’inscription (Joueur Majeur)</p>
                        <p className="font-semibold">Saison {currentSeason}</p>
                      </div>
                    </div>
                    <div className="h-32 w-28 border-2 border-black flex items-center justify-center text-sm text-gray-500">
                      Photo
                    </div>
                  </header>
                  <section className="mb-6">
                    <h3 className="font-bold text-lg mb-3 underline">INFORMATIONS PERSONNELLES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <FormField label="Nom et Prénom" />
                      <FormField label="Date de naissance" />
                      <FormField label="Lieu de naissance" />
                      <FormField label="Nationalité" />
                      <FormField label="Adresse complète" />
                      <FormField label="N° CIN / Carte de séjour" />
                      <FormField label="E-mail" />
                      <FormField label="Téléphone" />
                    </div>
                  </section>
                  <section className="mb-6">
                    <h3 className="font-bold text-lg mb-3 underline">INFORMATIONS SPORTIVES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <FormField label="Catégorie" />
                      <FormField label="Poste de prédilection" />
                    </div>
                  </section>
                  <footer className="pt-16">
                     <p className="text-xs mb-8">
                      Je soussigné(e), ...................................................................., déclare vouloir m'inscrire au club pour la saison {currentSeason}. J'ai pris connaissance du règlement intérieur du club et m'engage à le respecter.
                    </p>
                     <div className="flex justify-center items-center text-center mt-16">
                        <div>
                            <p className="font-semibold">Signature du joueur</p>
                            <p className="text-xs">(Précédée de la mention "Lu et approuvé")</p>
                        </div>
                    </div>
                  </footer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
            <Card>
            <CardHeader>
              <CardTitle>Pièces à Fournir</CardTitle>
              <CardDescription>Liste récapitulative de tous les documents requis pour finaliser l'inscription.</CardDescription>
              <Button onClick={() => handleDownloadPDF(documentsRef, `pieces-a-fournir-${clubInfo.name.toLowerCase().replace(/ /g, "-")}.pdf`)} className="w-fit">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger la liste
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto bg-white dark:bg-background p-4 sm:p-8 rounded-md shadow-lg">
                <div ref={documentsRef} className="text-black bg-white p-4">
                   <header className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      <ClubLogo className="size-20" />
                      <div>
                        <h1 className="text-2xl font-bold uppercase">{clubInfo.name}</h1>
                        <p className="text-lg">Pièces à Fournir pour l'Inscription</p>
                        <p className="font-semibold">Saison {currentSeason}</p>
                      </div>
                    </div>
                  </header>
                  <DocumentsList />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
