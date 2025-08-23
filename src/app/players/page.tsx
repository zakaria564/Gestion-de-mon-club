import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <Card>
        <CardHeader>
          <CardTitle>Liste des Joueurs</CardTitle>
          <CardDescription>
            Gérez les informations des joueurs de votre club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tuteur Légal</TableHead>
                <TableHead>Téléphone Tuteur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={player.photo} alt={player.name} data-ai-hint="player photo" />
                      <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{player.poste}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(player.status) as any}>{player.status}</Badge>
                  </TableCell>
                  <TableCell>{player.phone}</TableCell>
                  <TableCell>{player.email}</TableCell>
                  <TableCell>{player.tutorName}</TableCell>
                  <TableCell>{player.tutorPhone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
