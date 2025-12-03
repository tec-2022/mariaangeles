import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const SOCIAL_PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "fa-brands fa-linkedin-in", color: "bg-sky-100 text-sky-700" },
  { value: "researchgate", label: "ResearchGate", icon: "ai ai-researchgate", color: "bg-teal-100 text-teal-700" },
  { value: "google_scholar", label: "Google Scholar", icon: "ai ai-google-scholar", color: "bg-blue-100 text-blue-700" },
  { value: "orcid", label: "ORCID", icon: "ai ai-orcid", color: "bg-green-100 text-green-700" },
  { value: "academia", label: "Academia.edu", icon: "ai ai-academia", color: "bg-amber-100 text-amber-700" },
  { value: "scopus", label: "Scopus", icon: "ai ai-scopus", color: "bg-orange-100 text-orange-700" },
  { value: "web_of_science", label: "Web of Science", icon: "ai ai-clarivate", color: "bg-purple-100 text-purple-700" },
  { value: "youtube", label: "YouTube", icon: "fa-brands fa-youtube", color: "bg-red-100 text-red-700" },
  { value: "twitter", label: "Twitter/X", icon: "fa-brands fa-x-twitter", color: "bg-slate-100 text-slate-700" },
  { value: "facebook", label: "Facebook", icon: "fa-brands fa-facebook-f", color: "bg-blue-100 text-blue-700" },
  { value: "instagram", label: "Instagram", icon: "fa-brands fa-instagram", color: "bg-pink-100 text-pink-700" }
];

export default function AdminSocialLinks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    active: true,
    order: 0
  });

  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['admin-social-links'],
    queryFn: () => base44.entities.SocialLink.list('order')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialLink.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-links'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SocialLink.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-links'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-links'] });
    }
  });

  const handleOpenDialog = (link = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        platform: link.platform || "",
        url: link.url || "",
        active: link.active !== false,
        order: link.order || 0
      });
    } else {
      setEditingLink(null);
      setFormData({
        platform: "",
        url: "",
        active: true,
        order: links.length
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLink) {
      updateMutation.mutate({ id: editingLink.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta red social?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActive = (link) => {
    updateMutation.mutate({ id: link.id, data: { active: !link.active } });
  };

  const getPlatformInfo = (platform) => {
    return SOCIAL_PLATFORMS.find(p => p.value === platform) || { label: platform, icon: "fa-solid fa-link", color: "bg-slate-100 text-slate-700" };
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-600">{links.length} redes sociales configuradas</p>
          <p className="text-xs text-slate-500">Solo se mostrarán las que estén activas</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Red Social
        </Button>
      </div>

      <div className="grid gap-3">
        {links.map((link) => {
          const platform = getPlatformInfo(link.platform);
          return (
            <Card key={link.id} className={`p-4 bg-white ${!link.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
                <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center`}>
                  <i className={`${platform.icon} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#0A2540]">{platform.label}</h3>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-[#D4AF37] truncate block">
                    {link.url}
                  </a>
                </div>
                <Badge className={link.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>
                  {link.active ? "Activo" : "Inactivo"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(link)}>
                    {link.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(link)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {links.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <p className="text-slate-500">No hay redes sociales configuradas. ¡Agrega la primera!</p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Editar Red Social" : "Agregar Red Social"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Red Social</Label>
              <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar red social..." />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        <i className={`${platform.icon} text-sm`}></i>
                        {platform.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>URL del perfil</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingLink ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}