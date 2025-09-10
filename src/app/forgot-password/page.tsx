
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClubImage } from '@/components/club-image';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      toast({
        title: "Email envoyé",
        description: "Veuillez consulter votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:underline">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Retour
            </Link>
          </div>
          <div className="text-center pt-4">
             <ClubImage className="mx-auto h-12 w-12" />
            <CardTitle className="mt-4 text-2xl">Mot de passe oublié?</CardTitle>
            { !submitted ? (
              <CardDescription>
                Entrez votre email et nous vous enverrons un lien pour le réinitialiser.
              </CardDescription>
            ) : (
              <CardDescription className="text-primary">
                Un lien a été envoyé à votre adresse e-mail.
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          { !submitted && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                 {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@exemple.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
