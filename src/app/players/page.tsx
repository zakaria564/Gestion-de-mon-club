import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { players } from "@/lib/data";
import { PlusCircle, Phone, Mail, User, MapPin, Cake, Shirt, Shield } from "lucide-react";

export default function PlayersPage() {
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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Joueurs</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un joueur
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {players.map((player) => (
          <Card key={player.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{player.name}</CardTitle>
                <CardDescription>{player.poste}</CardDescription>
                <Badge variant={getBadgeVariant(player.status) as any} className="mt-2">{player.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex items-center text-sm">
                    <Shirt className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>Maillot n°{player.jerseyNumber}</span>
                </div>
                <div className="flex items-center text-sm">
                    <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>Catégorie: {player.category}</span>
                </div>
                <div className="flex items-center text-sm">
                    <Cake className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>{player.birthDate}</span>
                </div>
                <div className="flex items-center text-sm">
                    <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>{player.email}</span>
                </div>
                 <div className="flex items-center text-sm">
                    <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>{player.phone}</span>
                </div>
                 <div className="flex items-center text-sm">
                    <MapPin className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{player.address}</span>
                </div>

                {player.tutorName !== 'N/A' && (
                    <>
                        <div className="border-t my-4"></div>
                        <h4 className="text-sm font-semibold">Tuteur Légal</h4>
                        <div className="flex items-center text-sm">
                            <User className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>{player.tutorName}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span>{player.tutorPhone}</span>
                        </div>
                    </>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
