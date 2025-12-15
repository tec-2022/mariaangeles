import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Calendar, MapPin, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { autoTranslate } from "./AutoTranslate";
import AdminTable from "./AdminTable";

export default function AdminEvents() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    date: "",
    time: "",
    location: "",
    type: "seminar",
    image: "",
    link: "",
    is_upcoming: true,
    featured: false,
    attendees: 0
  });

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => contentClient.entities.Event.list('-date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    }
  });

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || "",
        title_en: event.title_en || "",
        description: event.description || "",
        description_en: event.description_en || "",
        date: event.date || "",
        time: event.time || "",
        location: event.location || "",
        type: event.type || "seminar",
        image: event.image || "",
        link: event.link || "",
        is_upcoming: event.is_upcoming !== false,
        featured: event.featured || false,
        attendees: event.attendees || 0
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        title_en: "",
        description: "",
        description_en: "",
        date: "",
        time: "",
        location: "",
        type: "seminar",
        image: "",
        link: "",
        is_upcoming: true,
        featured: false,
        attendees: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    
    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.description && !formData.description_en) translatePromises.push(autoTranslate(formData.description).then(t => dataToSave.description_en = t));
    await Promise.all(translatePromises);
    
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este evento?")) {
      deleteMutation.mutate(id);
    }
  };

  const eventTypes = [
    { value: "keynote", label: "Ponencia" },
    { value: "seminar", label: "Seminario" },
    { value: "workshop", label: "Workshop" },
    { value: "congress", label: "Congreso" },
    { value: "forum", label: "Foro" }
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const filterOptions = [
    {
      key: "type",
      label: "Tipo",
      options: eventTypes.map(t => ({ value: t.value, label: t.label }))
    },
    {
      key: "is_upcoming",
      label: "Estado",
      options: [
        { value: true, label: "Próximo" },
        { value: false, label: "Pasado" }
      ]
    }
  ];

  const renderEventRow = (event) => (
    <Card key={event.id} className="p-4 bg-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-[#0A2540] text-white flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-xs uppercase">{new Date(event.date).toLocaleDateString('es', { month: 'short' })}</span>
          <span className="text-xl font-bold">{new Date(event.date).getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#0A2540] truncate">{event.title}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {event.time}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{eventTypes.find(t => t.value === event.type)?.label || event.type}</Badge>
            <Badge className={event.is_upcoming ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
              {event.is_upcoming ? "Próximo" : "Pasado"}
            </Badge>
            {event.featured && <Badge className="bg-[#D4AF37]/20 text-[#b8972e]"><Star className="w-3 h-3 mr-1 fill-current" />Destacado</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: event.id, data: { featured: !event.featured } })}>
            {event.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(event)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <AdminTable
        data={events}
        searchFields={["title", "location", "description"]}
        filterOptions={filterOptions}
        renderRow={renderEventRow}
        defaultSort={{ key: "date", direction: "desc" }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Horario</Label>
                <Input
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="10:00 - 12:00"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Ubicación</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Imagen del evento</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL de la imagen"
                  className="flex-1"
                />
                <label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const { file_url } = await contentClient.integrations.Core.UploadFile({ file });
                        setFormData({ ...formData, image: file_url });
                      }
                    }} 
                    className="hidden" 
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>Subir</span>
                  </Button>
                </label>
              </div>
              {formData.image && (
                <div className="mt-2 h-32 rounded-lg overflow-hidden bg-slate-100">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <Label>Enlace de registro</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_upcoming}
                  onCheckedChange={(v) => setFormData({ ...formData, is_upcoming: v })}
                />
                <Label>Evento próximo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                />
                <Label>Destacar en Home</Label>
              </div>
              <div>
                <Label>Asistentes</Label>
                <Input
                  type="number"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEvent ? "Actualizar" : "Crear"} Evento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}