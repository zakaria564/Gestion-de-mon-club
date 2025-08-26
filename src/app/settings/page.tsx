
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Download, Upload, AlertCircle } from "lucide-react";
import { useClubContext } from "@/context/club-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlayersContext } from "@/context/players-context";
import { useCoachesContext } from "@/context/coaches-context";
import { useCalendarContext } from "@/context/calendar-context";
import { useFinancialContext } from "@/context/financial-context";
import { useResultsContext } from "@/context/results-context";

export default function SettingsPage() {
  const { 
    clubInfo, 
    loading: clubLoading, 
    updateClubInfo, 
    restoreData 
  } = useClubContext();

  const {
    user,
    updateUserProfile,
    updateUserPassword,
    loading: authLoading
  } = useAuth();

  const playersCtx = usePlayersContext();
  const coachesCtx = useCoachesContext();
  const calendarCtx = useCalendarContext();
  const financialCtx = useFinancialContext();
  const resultsCtx = useResultsContext();

  const { toast } = useToast();

  const [clubName, setClubName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isBackuping, setIsBackuping] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = clubLoading || authLoading || playersCtx.loading || coachesCtx.loading || calendarCtx.loading || financialCtx.loading;

  useEffect(() => {
    if (clubInfo) {
      setClubName(clubInfo.name);
    }
    if (user) {
        setDisplayName(user.displayName || '');
    }
  }, [clubInfo, user]);

  const handleSaveInfo = async () => {
    if (!clubName) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le nom du club ne peut pas être vide.",
        });
        return;
    }
    setIsSavingInfo(true);
    await updateClubInfo(clubName, logoFile || undefined);
    setIsSavingInfo(false);
    setLogoFile(null); 
    if(fileInputRef.current) fileInputRef.current.value = "";
    toast({
        title: "Succès",
        description: "Les informations du club ont été mises à jour.",
    });
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        await updateUserPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      if (displayName !== user?.displayName) {
        await updateUserProfile({ displayName });
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été modifiées avec succès."
      });

    } catch (error: any) {
        setProfileError(error.message);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: error.message
        });
    } finally {
        setIsSavingProfile(false);
    }
  };

  const handleBackup = async () => {
    setIsBackuping(true);
    try {
        const dataToBackup = {
            clubInfo: clubInfo,
            players: playersCtx.players,
            coaches: coachesCtx.coaches,
            calendarEvents: calendarCtx.calendarEvents,
            playerPayments: financialCtx.playerPayments,
            coachSalaries: financialCtx.coachSalaries,
            results: resultsCtx.results,
        };

        const jsonString = JSON.stringify(dataToBackup, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `backup-gestion-club-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: "Sauvegarde réussie",
            description: "Un fichier JSON avec vos données a été téléchargé.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erreur de sauvegarde",
            description: "La sauvegarde des données a échoué.",
        });
    }
    setIsBackuping(false);
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreError(null);
    try {
        await restoreData(file);
        toast({
            title: "Restauration réussie",
            description: "Vos données ont été restaurées. La page va être rechargée.",
        });
        setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
        setRestoreError(error.message || "Le fichier de sauvegarde est invalide ou corrompu.");
        toast({
            variant: "destructive",
            title: "Erreur de restauration",
            description: error.message || "Le fichier de sauvegarde est invalide ou corrompu.",
        });
    }
    setIsRestoring(false);
  }

  if (loading) {
      return (
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-12 w-full max-w-lg" />
              <Card>
                  <CardHeader>
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                  </CardContent>
                  <CardFooter>
                      <Skeleton className="h-10 w-32" />
                  </CardFooter>
              </Card>
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <h2 className="text-3xl font-bold tracking-tight">Paramètres du Club</h2>
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informations du Club</TabsTrigger>
          <TabsTrigger value="account">Mon Compte</TabsTrigger>
          <TabsTrigger value="admins">Comptes Admin</TabsTrigger>
          <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informations du Club</CardTitle>
              <CardDescription>
                Gérez les informations de base de votre club.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="club-name">Nom du club</Label>
                <Input id="club-name" value={clubName} onChange={(e) => setClubName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-logo">Logo du club</Label>
                <Input id="club-logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} ref={fileInputRef}/>
                <p className="text-xs text-muted-foreground">Si aucun nouveau logo n'est sélectionné, l'ancien sera conservé.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveInfo} disabled={isSavingInfo}>{isSavingInfo ? "Enregistrement..." : "Enregistrer les modifications"}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
         <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Mon Compte</CardTitle>
              <CardDescription>
                Gérez les informations de votre compte administrateur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {profileError && (
                  <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Nom d'utilisateur</Label>
                <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" placeholder="Laisser vide pour ne pas changer" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input id="confirm-password" type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? "Enregistrement..." : "Mettre à jour le profil"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Comptes Admin</CardTitle>
              <CardDescription>
                Gérez les comptes administrateurs du club. Bientôt disponible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Cette fonctionnalité est en cours de développement.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde et Restauration</CardTitle>
              <CardDescription>
                Sauvegardez ou restaurez les données de votre club via un fichier JSON.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {restoreError && (
                  <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{restoreError}</AlertDescription>
                  </Alert>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="w-full" onClick={handleBackup} disabled={isBackuping}>
                  <Download className="mr-2 h-4 w-4" /> 
                  {isBackuping ? "Sauvegarde en cours..." : "Sauvegarder les données (JSON)"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => document.getElementById('restore-input')?.click()} disabled={isRestoring}>
                  <Upload className="mr-2 h-4 w-4" /> 
                  {isRestoring ? "Restauration en cours..." : "Restaurer les données (JSON)"}
                </Button>
                <Input id="restore-input" type="file" accept=".json" className="hidden" onChange={handleRestore} />
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription>
                  La restauration écrasera toutes les données actuelles (joueurs, entraîneurs, calendrier, etc.). Utilisez cette fonction avec précaution.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
