import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2, Archive, Reply, CheckCircle, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => contentClient.entities.ContactMessage.list('-created_date')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.ContactMessage.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.ContactMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      setSelectedMessage(null);
    }
  });

  const markAsRead = (msg) => {
    if (!msg.read) {
      updateMutation.mutate({ id: msg.id, data: { read: true } });
    }
    setSelectedMessage(msg);
  };

  const toggleArchive = (msg) => {
    updateMutation.mutate({ id: msg.id, data: { archived: !msg.archived } });
  };

  const markAsReplied = (msg) => {
    updateMutation.mutate({ id: msg.id, data: { replied: true } });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este mensaje?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inboxMessages = filteredMessages.filter(m => !m.archived);
  const archivedMessages = filteredMessages.filter(m => m.archived);
  const unreadCount = messages.filter(m => !m.read && !m.archived).length;

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const MessageCard = ({ msg }) => (
    <Card 
      className={`p-4 bg-white cursor-pointer hover:shadow-md transition-all ${!msg.read ? 'border-l-4 border-l-[#D4AF37]' : ''}`}
      onClick={() => markAsRead(msg)}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.read ? 'bg-slate-100' : 'bg-[#D4AF37]/20'}`}>
          {msg.read ? <MailOpen className="w-5 h-5 text-slate-500" /> : <Mail className="w-5 h-5 text-[#D4AF37]" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${!msg.read ? 'font-bold' : ''}`}>{msg.name}</h4>
            {msg.replied && <Badge className="bg-green-100 text-green-700 text-xs">Respondido</Badge>}
          </div>
          <p className="text-sm text-[#D4AF37]">{msg.subject || 'Sin asunto'}</p>
          <p className="text-sm text-slate-500 truncate">{msg.message}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {new Date(msg.created_date).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar mensajes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount} sin leer</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">
            Bandeja de Entrada ({inboxMessages.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archivados ({archivedMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6 space-y-3">
          {inboxMessages.map((msg) => (
            <MessageCard key={msg.id} msg={msg} />
          ))}
          {inboxMessages.length === 0 && (
            <Card className="p-12 text-center bg-white">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hay mensajes</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-6 space-y-3">
          {archivedMessages.map((msg) => (
            <MessageCard key={msg.id} msg={msg} />
          ))}
          {archivedMessages.length === 0 && (
            <Card className="p-12 text-center bg-white">
              <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No hay mensajes archivados</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject || 'Sin asunto'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-bold">{selectedMessage.name}</p>
                    <a href={`mailto:${selectedMessage.email}`} className="text-sm text-[#D4AF37] hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(selectedMessage.created_date).toLocaleString('es')}
                  </p>
                </div>
                <div className="p-4 bg-white border rounded-lg min-h-[150px]">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div className="flex justify-between gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toggleArchive(selectedMessage)}>
                      <Archive className="w-4 h-4 mr-2" />
                      {selectedMessage.archived ? 'Desarchivar' : 'Archivar'}
                    </Button>
                    <Button variant="outline" className="text-red-500" onClick={() => handleDelete(selectedMessage.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.replied && (
                      <Button variant="outline" onClick={() => markAsReplied(selectedMessage)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar respondido
                      </Button>
                    )}
                    <Button className="bg-[#0A2540]" asChild>
                      <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                        <Reply className="w-4 h-4 mr-2" />
                        Responder
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}