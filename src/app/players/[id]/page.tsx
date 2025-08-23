
"use client"

import { useMemo } from 'react';
import { players } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cake, Mail, Phone, Shield, User, UserCheck, UserCircle, MapPin } from "lucide-react";
import Link from "next/link";

export default function PlayerDetailPage() {
  const params = useParams();
  const player = useMemo(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    return players.find((p) => p.id.toString() === id);
  }, [params.id]);


  if (!player) {
    notFound();
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'default';
      case 'Blessé':
        return 'destructive';
      case 'Suspendu':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/players" className="flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des joueurs
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-32 w-32 border">
            <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
            <AvatarFallback className="text-4xl">{player.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-1">{player.poste}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={getBadgeVariant(player.status) as any}>{player.status}</Badge>
              <Badge variant="secondary">{player.category}</Badge>
              <Badge variant="outline">Maillot n°{player.jerseyNumber}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                <div className="flex items-center gap-4">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span>{player.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Cake className="h-5 w-5 text-muted-foreground" />
                    <span>{player.birthDate}</span>
                </div>
                <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{player.address}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact</h3>
                 <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${player.email}`} className="hover:underline">{player.email}</a>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.phone}</span>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tuteur Légal</h3>
                 <div className="flex items-center gap-4">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                    <span>{player.tutorName}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{player.tutorPhone}</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
