import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Briefcase, GraduationCap, Award, BookOpen, Globe } from "lucide-react";
import { autoTranslate } from "./AutoTranslate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminAbout() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeSection, setActiveSection] = useState("position");
  const [formData, setFormData] = useState({
    section: "bio",
    title: "",
    title_en: "",
    subtitle: "",
    subtitle_en: "",
    description: "",
    description_en: "",
    period: "",
    institution: "",
    is_current: false,
    order: 0
  });

  const queryClient = useQueryClient();

  const { data: aboutItems = [], isLoading } = useQuery({
    queryKey: ['admin-about'],
    queryFn: () => contentClient.entities.AboutContent.list('order')
  });



  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.AboutContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.AboutContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.AboutContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about'] });
    }
  });

  const handleOpenDialog = (item = null, section = activeSection) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        section: item.section || section,
        title: item.title || "",
        title_en: item.title_en || "",
        subtitle: item.subtitle || "",
        subtitle_en: item.subtitle_en || "",
        description: item.description || "",
        description_en: item.description_en || "",
        period: item.period || "",
        institution: item.institution || "",
        is_current: item.is_current || false,
        order: item.order || 0
      });
    } else {
      setEditingItem(null);
      const sectionItems = aboutItems.filter(i => i.section === section);
      setFormData({
        section: section,
        title: "",
        title_en: "",
        subtitle: "",
        subtitle_en: "",
        description: "",
        description_en: "",
        period: "",
        institution: "",
        is_current: false,
        order: sectionItems.length
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let dataToSave = { ...formData };
    
    // Translate fields that don't have English versions
    if (formData.title && !formData.title_en) {
      const translated = await autoTranslate(formData.title);
      if (translated) dataToSave.title_en = translated;
    }
    if (formData.subtitle && !formData.subtitle_en) {
      const translated = await autoTranslate(formData.subtitle);
      if (translated) dataToSave.subtitle_en = translated;
    }
    if (formData.description && !formData.description_en) {
      const translated = await autoTranslate(formData.description);
      if (translated) dataToSave.description_en = translated;
    }
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este elemento?")) {
      deleteMutation.mutate(id);
    }
  };

  const sections = [
    { value: "position", label: "Posiciones", icon: Briefcase },
    { value: "position_international", label: "Internacional", icon: Globe },
    { value: "education", label: "Educación", icon: GraduationCap },
    { value: "continuing_education", label: "Ed. Continua", icon: BookOpen },
    { value: "honor", label: "Honores", icon: Award }
  ];

  const getSectionInfo = (section) => sections.find(s => s.value === section) || sections[0];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <TabsList className="flex-wrap">
            {sections.map((section) => (
              <TabsTrigger key={section.value} value={section.value} className="flex items-center gap-1.5 text-xs">
                <section.icon className="w-3.5 h-3.5" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={() => handleOpenDialog(null, activeSection)} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        {sections.map((sec) => (
          <TabsContent key={sec.value} value={sec.value}>
            <div className="grid gap-4">
              {aboutItems.filter(item => item.section === sec.value).map((item) => (
                <Card key={item.id} className="p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0A2540]/10 flex items-center justify-center">
                        <sec.icon className="w-5 h-5 text-[#0A2540]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#0A2540]">{item.title}</h4>
                          {item.is_current && <Badge className="bg-green-100 text-green-700">Actual</Badge>}
                        </div>
                        {item.subtitle && <p className="text-sm text-slate-600">{item.subtitle}</p>}
                        {item.institution && <p className="text-sm text-slate-500">{item.institution}</p>}
                        {item.period && <p className="text-xs text-slate-400 mt-1">{item.period}</p>}
                        {item.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {aboutItems.filter(item => item.section === sec.value).length === 0 && (
                <Card className="p-12 text-center bg-white">
                  <sec.icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay elementos en esta sección. ¡Agrega el primero!</p>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar" : "Nuevo"} Elemento</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Sección</Label>
                <Select value={formData.section} onValueChange={(v) => setFormData({ ...formData, section: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.value} value={section.value}>{section.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                                    <Label>Título</Label>
                                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                  </div>

                                  <div>
                                    <Label>Subtítulo</Label>
                                    <Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                                  </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Institución</Label>
                  <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} />
                </div>
                <div>
                  <Label>Período</Label>
                  <Input value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} placeholder="2020 - Presente" />
                </div>
              </div>

              <div>
                                    <Label>Descripción</Label>
                                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                  </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_current} onCheckedChange={(v) => setFormData({ ...formData, is_current: v })} />
                  <Label>Posición actual</Label>
                </div>
                <div>
                  <Label>Orden</Label>
                  <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-20" />
                </div>
              </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}