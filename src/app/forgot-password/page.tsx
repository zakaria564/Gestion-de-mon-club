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
import { ClubLogo } from '@/components/club-logo';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
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
             <ClubLogo className="mx-auto h-12 w-12" />
            <CardTitle className="mt-4 text-2xl">Mot de passe oublié?</CardTitle>
            <CardDescription>
              Entrez votre email et nous vous enverrons un lien pour le réinitialiser.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@exemple.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Envoyer le lien
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
