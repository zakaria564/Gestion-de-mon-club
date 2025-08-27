
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationsContext, NewNotification } from "@/context/notifications-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function NotificationsPage() {
  const { notifications, loading, addNotification, deleteNotification } = useNotificationsContext();
  const [newMessage, setNewMessage] = useState("");
  const [newPriority, setNewPriority] = useState<'Haute' | 'Moyenne'>("Moyenne");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage) return;

    const newNotification: NewNotification = {
      message: newMessage,
      priority: newPriority,
    };
    await addNotification(newNotification);
    setNewMessage("");
    setNewPriority("Moyenne");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Créer une notification</CardTitle>
          <CardDescription>Envoyez un nouveau message à tous les membres.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid gap-2">
              <Label htmlFor="message" className="sr-only">Message</Label>
              <Input
                id="message"
                placeholder="Votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
               <Label htmlFor="priority" className="sr-only">Priorité</Label>
               <Select value={newPriority} onValueChange={(v: 'Haute' | 'Moyenne') => setNewPriority(v)}>
                 <SelectTrigger className="w-full sm:w-[180px]">
                   <SelectValue placeholder="Priorité" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Moyenne">Moyenne</SelectItem>
                   <SelectItem value="Haute">Haute</SelectItem>
                 </SelectContent>
               </Select>
            </div>
            <Button type="submit">Envoyer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des notifications</CardTitle>
          <CardDescription>
            Messages et rappels récents pour le club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>{format(new Date(notification.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          notification.priority === "Haute"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {notification.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Aucune notification à afficher.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
