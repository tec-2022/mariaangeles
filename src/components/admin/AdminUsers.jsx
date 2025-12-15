import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Shield, Edit2, Trash2, Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => contentClient.entities.User.list()
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => contentClient.auth.me()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      setEditingUser(null);
    }
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    
    // Send invitation email
    await contentClient.integrations.Core.SendEmail({
      to: inviteEmail,
      subject: "Invitación al Panel de Administración - Dra. María de los Ángeles Quezada",
      body: `
<h2>Has sido invitado</h2>
<p>Has recibido una invitación para acceder al panel de administración del sitio web de la Dra. María de los Ángeles Quezada.</p>
<p><strong>Rol asignado:</strong> ${inviteRole === 'admin' ? 'Administrador' : inviteRole === 'editor' ? 'Editor' : 'Usuario'}</p>
<p>Para completar tu registro, visita el sitio y crea tu cuenta con este correo electrónico.</p>
<br>
<p>Saludos,<br>Equipo Dra. María de los Ángeles Quezada</p>
      `
    });
    
    setInviting(false);
    setInviteSuccess(true);
    setInviteEmail("");
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: { 
        full_name: editingUser.full_name,
        role: editingUser.role 
      }
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: "Administrador", className: "bg-purple-100 text-purple-800" },
      editor: { label: "Editor", className: "bg-blue-100 text-blue-800" },
      user: { label: "Usuario", className: "bg-slate-100 text-slate-800" }
    };
    return badges[role] || badges.user;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#db2777]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite New User */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#db2777]" />
          Invitar Nuevo Usuario
        </h3>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label>Correo Electrónico</Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Label>Rol</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleInvite} 
            disabled={!inviteEmail || inviting}
            className="bg-[#db2777] hover:bg-[#be185d]"
          >
            {inviting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Enviar Invitación
          </Button>
        </div>

        {inviteSuccess && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            Invitación enviada correctamente
          </div>
        )}

        <p className="text-sm text-slate-500 mt-4">
          <strong>Roles:</strong><br />
          • <strong>Administrador:</strong> Acceso completo al panel, puede gestionar usuarios<br />
          • <strong>Editor:</strong> Puede crear y editar contenido, pero no gestionar usuarios<br />
          • <strong>Usuario:</strong> Solo puede ver contenido público
        </p>
      </Card>

      {/* Users List */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#db2777]" />
          Usuarios Registrados ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const isCurrentUser = currentUser?.id === user.id;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#db2777] text-white flex items-center justify-center font-bold">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                          {isCurrentUser && (
                            <span className="text-xs text-[#db2777]">(Tú)</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleBadge.className}>
                        {roleBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_date)}</TableCell>
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#db2777]" />
              Editar Usuario
            </DialogTitle>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  placeholder="Nombre del usuario"
                />
              </div>

              <div>
                <Label>Correo Electrónico</Label>
                <p className="text-slate-600 p-2 bg-slate-50 rounded">{editingUser.email}</p>
                <p className="text-xs text-slate-400 mt-1">El correo no se puede modificar</p>
              </div>

              <div>
                <Label>Rol</Label>
                <Select 
                  value={editingUser.role || 'user'} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={updateMutation.isPending}
                  className="bg-[#db2777] hover:bg-[#be185d]"
                >
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}