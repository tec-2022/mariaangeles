import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, UserCheck, UserX, Download, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminSubscribers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: () => base44.entities.Subscriber.list('-created_date')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscriber.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-subscribers'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscriber.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscribers'] });
      setDeleteId(null);
    }
  });

  const toggleActive = (sub) => {
    updateMutation.mutate({ id: sub.id, data: { active: !sub.active } });
  };

  const exportCSV = () => {
    const headers = ['Email', 'Fuente', 'Estado', 'Fecha de suscripción'];
    const rows = subscribers.map(s => [
      s.email,
      s.source || 'blog',
      s.active ? 'Activo' : 'Inactivo',
      new Date(s.created_date).toLocaleDateString('es-MX')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suscriptores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.active).length;
  const sourceLabels = { blog: 'Blog', podcast: 'Podcast', newsletter: 'Newsletter' };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-white text-center">
          <Users className="w-8 h-8 text-[#0A2540] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[#0A2540]">{subscribers.length}</div>
          <div className="text-sm text-slate-500">Total Suscriptores</div>
        </Card>
        <Card className="p-4 bg-white text-center">
          <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-slate-500">Activos</div>
        </Card>
        <Card className="p-4 bg-white text-center">
          <UserX className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{subscribers.length - activeCount}</div>
          <div className="text-sm text-slate-500">Inactivos</div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Subscribers List */}
      <div className="space-y-2">
        {filteredSubscribers.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {searchQuery ? 'No se encontraron suscriptores' : 'No hay suscriptores aún'}
            </p>
          </Card>
        ) : (
          filteredSubscribers.map((sub) => (
            <Card key={sub.id} className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.active ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <Mail className={`w-5 h-5 ${sub.active ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-[#0A2540]">{sub.email}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{new Date(sub.created_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{sourceLabels[sub.source] || 'Blog'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={sub.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {sub.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleActive(sub)}
                    title={sub.active ? 'Desactivar' : 'Activar'}
                  >
                    {sub.active ? <UserX className="w-4 h-4 text-slate-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDeleteId(sub.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscriptor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El suscriptor será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}