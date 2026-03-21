
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { useAuth, type UserRole } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, UserCog, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "userProfiles"));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, "userProfiles", uid), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast({ title: "Rôle mis à jour", description: `L'utilisateur est maintenant ${newRole}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le rôle." });
    }
  };

  if (profile?.role !== 'admin') {
    return <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h2 className="text-2xl font-bold">Accès Refusé</h2>
      <p>Seuls les administrateurs peuvent accéder à cette page.</p>
    </div>;
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement de l'équipe...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><UserCog className="text-primary" /> Équipe Staff</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des comptes</CardTitle>
          <CardDescription>Affectez les rôles appropriés à votre équipe technique et médicale.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle actuel</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell className="font-medium">{u.displayName}</TableCell>
                  <TableCell className="text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3" /> {u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : u.role === 'medical' ? 'secondary' : 'outline'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select value={u.role} onValueChange={(val: UserRole) => handleRoleChange(u.uid, val)}>
                      <SelectTrigger className="w-[140px] ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="coach">Entraîneur</SelectItem>
                        <SelectItem value="medical">Staff Médical</SelectItem>
                        <SelectItem value="parent">Parent/Joueur</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
