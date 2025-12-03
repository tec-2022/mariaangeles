import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, Upload, Mail, Linkedin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { autoTranslate } from "./AutoTranslate";

export default function AdminResearchers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResearcher, setEditingResearcher] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    title_en: "",
    specialty: "",
    specialty_en: "",
    institution: "",
    photo: "",
    email: "",
    linkedin: "",
    researchgate: "",
    google_scholar: "",
    bio: "",
    bio_en: "",
    is_principal: false,
    order: 0
  });

  const queryClient = useQueryClient();

  const { data: researchers = [], isLoading } = useQuery({
    queryKey: ['admin-researchers'],
    queryFn: () => base44.entities.Researcher.list('order')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Researcher.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-researchers'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Researcher.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-researchers'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Researcher.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-researchers'] });
    }
  });

  const handleOpenDialog = (researcher = null) => {
    if (researcher) {
      setEditingResearcher(researcher);
      setFormData({
        name: researcher.name || "",
        title: researcher.title || "",
        title_en: researcher.title_en || "",
        specialty: researcher.specialty || "",
        specialty_en: researcher.specialty_en || "",
        institution: researcher.institution || "",
        photo: researcher.photo || "",
        email: researcher.email || "",
        linkedin: researcher.linkedin || "",
        researchgate: researcher.researchgate || "",
        google_scholar: researcher.google_scholar || "",
        bio: researcher.bio || "",
        bio_en: researcher.bio_en || "",
        is_principal: researcher.is_principal || false,
        order: researcher.order || 0
      });
    } else {
      setEditingResearcher(null);
      setFormData({
        name: "",
        title: "",
        title_en: "",
        specialty: "",
        specialty_en: "",
        institution: "",
        photo: "",
        email: "",
        linkedin: "",
        researchgate: "",
        google_scholar: "",
        bio: "",
        bio_en: "",
        is_principal: false,
        order: researchers.length
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingResearcher(null);
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo: file_url });
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };

    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.specialty && !formData.specialty_en) translatePromises.push(autoTranslate(formData.specialty).then(t => dataToSave.specialty_en = t));
    if (formData.bio && !formData.bio_en) translatePromises.push(autoTranslate(formData.bio).then(t => dataToSave.bio_en = t));
    await Promise.all(translatePromises);

    if (editingResearcher) {
      updateMutation.mutate({ id: editingResearcher.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este investigador?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">Gestiona los miembros del grupo de investigación</p>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Investigador
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {researchers.map((researcher) => (
          <Card key={researcher.id} className="bg-white overflow-hidden">
            <div className="h-48 overflow-hidden bg-slate-100">
              {researcher.photo ? (
                <img src={researcher.photo} alt={researcher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  Sin foto
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {researcher.is_principal && (
                  <Badge className="bg-[#D4AF37] text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Principal
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-[#0A2540]">{researcher.name}</h3>
              <p className="text-sm text-[#D4AF37]">{researcher.title}</p>
              {researcher.institution && (
                <p className="text-xs text-slate-500 mt-1">{researcher.institution}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {researcher.email && <Mail className="w-4 h-4 text-slate-400" />}
                {researcher.linkedin && <Linkedin className="w-4 h-4 text-slate-400" />}
                {researcher.researchgate && <ExternalLink className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(researcher)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(researcher.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {researchers.length === 0 && (
          <Card className="col-span-full p-12 text-center bg-white">
            <p className="text-slate-500">No hay investigadores. ¡Agrega el primero!</p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingResearcher ? "Editar Investigador" : "Nuevo Investigador"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Foto
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label>Foto del investigador</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="URL de la imagen"
                    className="flex-1"
                  />
                  <label>
                    <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                    <Button type="button" variant="outline" disabled={uploading} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "..." : "Subir"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label>Nombre completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Cargo/Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Profesor Investigador"
                required
              />
            </div>

            <div>
              <Label>Especialidad</Label>
              <Input
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ej: Desarrollo Regional"
              />
            </div>

            <div>
              <Label>Institución</Label>
              <Input
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ResearchGate URL</Label>
                <Input
                  value={formData.researchgate}
                  onChange={(e) => setFormData({ ...formData, researchgate: e.target.value })}
                />
              </div>
              <div>
                <Label>Google Scholar URL</Label>
                <Input
                  value={formData.google_scholar}
                  onChange={(e) => setFormData({ ...formData, google_scholar: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Biografía corta</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_principal}
                  onCheckedChange={(v) => setFormData({ ...formData, is_principal: v })}
                />
                <Label>Investigador Principal</Label>
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingResearcher ? "Actualizar" : "Crear"} Investigador
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}