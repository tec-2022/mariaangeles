import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, Play, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { autoTranslate } from "./AutoTranslate";
import AdminTable from "./AdminTable";

export default function AdminPodcast() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    episode_number: 1,
    duration: "",
    date: "",
    guest_name: "",
    guest_title: "",
    audio_url: "",
    image: "",
    spotify_url: "",
    apple_url: "",
    youtube_url: "",
    featured: false,
    published: false
  });

  const queryClient = useQueryClient();

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['admin-episodes'],
    queryFn: () => contentClient.entities.PodcastEpisode.list('-episode_number')
  });

  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.PodcastEpisode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-episodes'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.PodcastEpisode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-episodes'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.PodcastEpisode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-episodes'] });
    }
  });

  const handleOpenDialog = (episode = null) => {
    if (episode) {
      setEditingEpisode(episode);
      setFormData({
        title: episode.title || "",
        title_en: episode.title_en || "",
        description: episode.description || "",
        description_en: episode.description_en || "",
        episode_number: episode.episode_number || 1,
        duration: episode.duration || "",
        date: episode.date || "",
        guest_name: episode.guest_name || "",
        guest_title: episode.guest_title || "",
        audio_url: episode.audio_url || "",
        image: episode.image || "",
        spotify_url: episode.spotify_url || "",
        apple_url: episode.apple_url || "",
        youtube_url: episode.youtube_url || "",
        featured: episode.featured || false,
        published: episode.published || false
      });
    } else {
      setEditingEpisode(null);
      const nextEpisode = episodes.length > 0 ? Math.max(...episodes.map(e => e.episode_number || 0)) + 1 : 1;
      setFormData({
        title: "",
        title_en: "",
        description: "",
        description_en: "",
        episode_number: nextEpisode,
        duration: "",
        date: "",
        guest_name: "",
        guest_title: "",
        audio_url: "",
        image: "",
        spotify_url: "",
        apple_url: "",
        youtube_url: "",
        featured: false,
        published: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEpisode(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    
    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.description && !formData.description_en) translatePromises.push(autoTranslate(formData.description).then(t => dataToSave.description_en = t));
    await Promise.all(translatePromises);
    
    if (editingEpisode) {
      updateMutation.mutate({ id: editingEpisode.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este episodio?")) {
      deleteMutation.mutate(id);
    }
  };

  const togglePublished = (episode) => {
    updateMutation.mutate({ id: episode.id, data: { published: !episode.published } });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const filterOptions = [
    {
      key: "published",
      label: "Estado",
      options: [
        { value: true, label: "Publicado" },
        { value: false, label: "Borrador" }
      ]
    }
  ];

  const renderEpisodeRow = (episode) => (
    <Card key={episode.id} className="p-4 bg-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] flex items-center justify-center flex-shrink-0">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">Ep. {episode.episode_number}</Badge>
            <span className="text-sm text-slate-500">{episode.duration}</span>
          </div>
          <h3 className="font-bold text-[#0A2540] truncate">{episode.title}</h3>
          {episode.guest_name && (
            <p className="text-sm text-slate-500">Con: {episode.guest_name}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Badge className={episode.published ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {episode.published ? "Publicado" : "Borrador"}
            </Badge>
            {episode.featured && <Badge className="bg-[#D4AF37]/20 text-[#b8972e]"><Star className="w-3 h-3 mr-1 fill-current" />Destacado</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: episode.id, data: { featured: !episode.featured } })}>
            {episode.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => togglePublished(episode)}>
            {episode.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(episode)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(episode.id)} className="text-red-500 hover:text-red-700">
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
          Nuevo Episodio
        </Button>
      </div>

      <AdminTable
        data={episodes}
        searchFields={["title", "guest_name", "description"]}
        filterOptions={filterOptions}
        renderRow={renderEpisodeRow}
        defaultSort={{ key: "episode_number", direction: "desc" }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEpisode ? "Editar Episodio" : "Nuevo Episodio"}</DialogTitle>
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
                <Label>Número de episodio</Label>
                <Input
                  type="number"
                  value={formData.episode_number}
                  onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <Label>Duración</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="45 min"
                  required
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre del invitado</Label>
                <Input
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Título del invitado</Label>
                <Input
                  value={formData.guest_title}
                  onChange={(e) => setFormData({ ...formData, guest_title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>URL del audio</Label>
                <Input
                  value={formData.audio_url}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                />
              </div>
              <div>
                <Label>URL de imagen</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Spotify URL</Label>
                <Input
                  value={formData.spotify_url}
                  onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Apple Podcasts URL</Label>
                <Input
                  value={formData.apple_url}
                  onChange={(e) => setFormData({ ...formData, apple_url: e.target.value })}
                />
              </div>
              <div>
                <Label>YouTube URL</Label>
                <Input
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                />
                <Label>Publicado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                />
                <Label>Destacar en Home</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingEpisode ? "Actualizar" : "Crear"} Episodio
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}