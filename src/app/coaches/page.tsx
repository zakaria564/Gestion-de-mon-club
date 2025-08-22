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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { coaches } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function CoachesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Entraîneurs</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un entraîneur
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Entraîneurs</CardTitle>
          <CardDescription>
            Gérez les informations des entraîneurs et du staff technique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Spécialisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell>{coach.specialization}</TableCell>
                  <TableCell>
                    <Badge>{coach.status}</Badge>
                  </TableCell>
                  <TableCell>{coach.contact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
