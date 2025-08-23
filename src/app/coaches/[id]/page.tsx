
"use client"

import { useMemo } from 'react';
import { coaches } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, UserCircle, Award, Users } from "lucide-react";
import Link from "next/link";

export default function CoachDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const coach = useMemo(() => {
    return coaches.find((c) => c.id.toString() === id);
  }, [id]);

  if (!coach) {
    notFound();
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'default';
      case 'Inactif':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/coaches" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des entraîneurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={`https://placehold.co/128x128.png`} alt={coach.name} data-ai-hint="coach photo"/>
            <AvatarFallback className="text-4xl">{coach.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{coach.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">{coach.specialization}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(coach.status) as any}>{coach.status}</Badge>
              <Badge variant="secondary">{coach.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations</h3>
                <div className="flex items-center gap-4">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.specialization}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.category}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${coach.contact}`} className="hover:underline">{coach.contact}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{coach.phone}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
