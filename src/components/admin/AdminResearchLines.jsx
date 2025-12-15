import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Globe, TrendingUp, Lightbulb, Target, BookOpen, Award, Users, Building } from "lucide-react";
import { autoTranslate } from "./AutoTranslate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const iconMap = {
  Globe, TrendingUp, Lightbulb, Target, BookOpen, Award, Users, Building
};

export default function AdminResearchLines() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    icon: "Lightbulb",
    tags: "",
    tags_en: "",
    order: 0,
    visible: true
  });

  const queryClient = useQueryClient();

  const { data: lines = [], isLoading } = useQuery({
    queryKey: ['admin-research-lines'],
    queryFn: () => contentClient.entities.ResearchLine.list('order')
  });

  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.ResearchLine.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-lines'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.ResearchLine.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-lines'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.ResearchLine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-lines'] });
    }
  });

  const handleOpenDialog = (line = null) => {
    if (line) {
      setEditingLine(line);
      setFormData({
        title: line.title || "",
        title_en: line.title_en || "",
        description: line.description || "",
        description_en: line.description_en || "",
        icon: line.icon || "Lightbulb",
        tags: line.tags || "",
        tags_en: line.tags_en || "",
        order: line.order || 0,
        visible: line.visible !== false
      });
    } else {
      setEditingLine(null);
      setFormData({
        title: "",
        title_en: "",
        description: "",
        description_en: "",
        icon: "Lightbulb",
        tags: "",
        tags_en: "",
        order: lines.length,
        visible: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLine(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    
    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.description && !formData.description_en) translatePromises.push(autoTranslate(formData.description).then(t => dataToSave.description_en = t));
    if (formData.tags && !formData.tags_en) translatePromises.push(autoTranslate(formData.tags).then(t => dataToSave.tags_en = t));
    await Promise.all(translatePromises);
    
    if (editingLine) {
      updateMutation.mutate({ id: editingLine.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta línea de investigación?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleVisibility = (line) => {
    updateMutation.mutate({ id: line.id, data: { ...line, visible: !line.visible } });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">{lines.length} líneas de investigación</p>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Línea
        </Button>
      </div>

      <div className="space-y-3">
        {lines.map((line) => {
          const IconComponent = iconMap[line.icon] || Lightbulb;
          return (
            <Card key={line.id} className={`p-4 bg-white ${!line.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-slate-300 cursor-move" />
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                  <IconComponent className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0A2540]">{line.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-1">{line.description}</p>
                  {line.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {line.tags.split(',').slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag.trim()}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(line)}>
                    {line.visible ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(line)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(line.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLine ? "Editar Línea de Investigación" : "Nueva Línea de Investigación"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título (Español)</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label>Title (English)</Label>
                <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="Auto-traducido" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icono</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Globe">🌐 Globe</SelectItem>
                    <SelectItem value="TrendingUp">📈 TrendingUp</SelectItem>
                    <SelectItem value="Lightbulb">💡 Lightbulb</SelectItem>
                    <SelectItem value="Target">🎯 Target</SelectItem>
                    <SelectItem value="BookOpen">📖 BookOpen</SelectItem>
                    <SelectItem value="Award">🏆 Award</SelectItem>
                    <SelectItem value="Users">👥 Users</SelectItem>
                    <SelectItem value="Building">🏛️ Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orden</Label>
                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Descripción (Español)</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Description (English)</Label>
                <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={3} placeholder="Auto-traducido" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Etiquetas (Español, separadas por coma)</Label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Economía, Innovación, Desarrollo" />
              </div>
              <div>
                <Label>Tags (English)</Label>
                <Input value={formData.tags_en} onChange={(e) => setFormData({ ...formData, tags_en: e.target.value })} placeholder="Auto-traducido" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formData.visible} onCheckedChange={(v) => setFormData({ ...formData, visible: v })} />
              <Label>Visible en la página</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingLine ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}