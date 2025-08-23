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
import { PlusCircle } from "lucide-react";

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
            <CardHeader className="flex flex-row items-center gap-4 p-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold">{player.name}</CardTitle>
                <CardDescription>{player.poste}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-sm">{player.category}</Badge>
                    <Badge variant={getBadgeVariant(player.status) as any} className="text-sm">{player.status}</Badge>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
