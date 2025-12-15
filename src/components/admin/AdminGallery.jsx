import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Image as ImageIcon, FolderOpen, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CATEGORIES = [
  { value: "conferences", label: "Conferencias" },
  { value: "seminars", label: "Seminarios" },
  { value: "teaching", label: "Docencia" },
  { value: "research", label: "Investigación" },
  { value: "workshops", label: "Talleres" },
  { value: "graduations", label: "Graduaciones" },
  { value: "awards", label: "Premios" },
  { value: "collaborations", label: "Colaboraciones" },
  { value: "events", label: "Eventos" },
  { value: "personal", label: "Personal" }
];

export default function AdminGallery() {
  const [activeTab, setActiveTab] = useState("albums");
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [albumForm, setAlbumForm] = useState({
    title: "", description: "", event_name: "", date: "", location: "", category: "conferences", cover_image: "", order: 0
  });

  const [imageForm, setImageForm] = useState({
    title: "", description: "", album_id: "", category: "conferences", image_url: "", date: "", location: "", order: 0
  });

  const queryClient = useQueryClient();

  const { data: albums = [], isLoading: loadingAlbums } = useQuery({
    queryKey: ['admin-albums'],
    queryFn: () => contentClient.entities.GalleryAlbum.list('order')
  });

  const { data: images = [], isLoading: loadingImages } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => contentClient.entities.GalleryImage.list('order')
  });

  // Album mutations
  const createAlbumMutation = useMutation({
    mutationFn: (data) => contentClient.entities.GalleryAlbum.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-albums'] }); setIsAlbumDialogOpen(false); }
  });

  const updateAlbumMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.GalleryAlbum.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-albums'] }); setIsAlbumDialogOpen(false); }
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: (id) => contentClient.entities.GalleryAlbum.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-albums'] })
  });

  // Image mutations
  const createImageMutation = useMutation({
    mutationFn: (data) => contentClient.entities.GalleryImage.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); setIsImageDialogOpen(false); }
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.GalleryImage.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-gallery'] }); setIsImageDialogOpen(false); }
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id) => contentClient.entities.GalleryImage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
  });

  const handleOpenAlbumDialog = (album = null) => {
    if (album) {
      setEditingAlbum(album);
      setAlbumForm({ title: album.title || "", description: album.description || "", event_name: album.event_name || "", date: album.date || "", location: album.location || "", category: album.category || "conferences", cover_image: album.cover_image || "", order: album.order || 0 });
    } else {
      setEditingAlbum(null);
      setAlbumForm({ title: "", description: "", event_name: "", date: "", location: "", category: "conferences", cover_image: "", order: albums.length });
    }
    setIsAlbumDialogOpen(true);
  };

  const handleOpenImageDialog = (image = null, albumId = null) => {
    if (image) {
      setEditingImage(image);
      setImageForm({ title: image.title || "", description: image.description || "", album_id: image.album_id || "", category: image.category || "conferences", image_url: image.image_url || "", date: image.date || "", location: image.location || "", order: image.order || 0 });
    } else {
      setEditingImage(null);
      setImageForm({ title: "", description: "", album_id: albumId || "", category: "conferences", image_url: "", date: "", location: "", order: images.length });
    }
    setIsImageDialogOpen(true);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await contentClient.integrations.Core.UploadFile({ file });
    if (type === 'album') {
      setAlbumForm({ ...albumForm, cover_image: file_url });
    } else {
      setImageForm({ ...imageForm, image_url: file_url });
    }
    setUploading(false);
  };

  const handleSubmitAlbum = (e) => {
    e.preventDefault();
    if (editingAlbum) {
      updateAlbumMutation.mutate({ id: editingAlbum.id, data: albumForm });
    } else {
      createAlbumMutation.mutate(albumForm);
    }
  };

  const handleSubmitImage = (e) => {
    e.preventDefault();
    if (editingImage) {
      updateImageMutation.mutate({ id: editingImage.id, data: imageForm });
    } else {
      createImageMutation.mutate(imageForm);
    }
  };

  const getAlbumImages = (albumId) => images.filter(img => img.album_id === albumId);

  if (loadingAlbums || loadingImages) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#db2777] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="albums">
            <FolderOpen className="w-4 h-4 mr-2" />
            Álbumes ({albums.length})
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="w-4 h-4 mr-2" />
            Todas las Imágenes ({images.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="albums" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => handleOpenAlbumDialog()} className="bg-[#db2777]">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Álbum
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden bg-white group">
                <div className="relative aspect-video">
                  {album.cover_image ? (
                    <img src={album.cover_image} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <FolderOpen className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setSelectedAlbum(album); setActiveTab('images'); }}>
                      Ver Fotos
                    </Button>
                    <Button size="icon" variant="secondary" onClick={() => handleOpenAlbumDialog(album)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => { if (window.confirm("¿Eliminar álbum?")) deleteAlbumMutation.mutate(album.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{CATEGORIES.find(c => c.value === album.category)?.label}</Badge>
                    <span className="text-xs text-slate-500">{getAlbumImages(album.id).length} fotos</span>
                  </div>
                  <h3 className="font-bold text-[#4a4a4a]">{album.title}</h3>
                  {album.event_name && <p className="text-sm text-[#db2777]">{album.event_name}</p>}
                  {album.location && <p className="text-xs text-slate-500">{album.location}</p>}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            {selectedAlbum && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedAlbum(null)}>← Todos</Button>
                <span className="font-bold">{selectedAlbum.title}</span>
              </div>
            )}
            <Button onClick={() => handleOpenImageDialog(null, selectedAlbum?.id)} className="bg-[#db2777] ml-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Imagen
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(selectedAlbum ? getAlbumImages(selectedAlbum.id) : images).map((image) => {
              const album = albums.find(a => a.id === image.album_id);
              return (
                <Card key={image.id} className="overflow-hidden bg-white group">
                  <div className="relative aspect-square">
                    <img src={image.image_url} alt={image.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => handleOpenImageDialog(image)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => { if (window.confirm("¿Eliminar imagen?")) deleteImageMutation.mutate(image.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{image.title}</h3>
                    {album && <Badge variant="outline" className="mt-1 text-xs">{album.event_name || album.title}</Badge>}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Album Dialog */}
      <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAlbum ? "Editar Álbum" : "Nuevo Álbum"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAlbum} className="space-y-4">
            <div>
              <Label>Título del Álbum</Label>
              <Input value={albumForm.title} onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })} required />
            </div>
            <div>
              <Label>Nombre del Evento</Label>
              <Input value={albumForm.event_name} onChange={(e) => setAlbumForm({ ...albumForm, event_name: e.target.value })} placeholder="Ej: Congreso Internacional 2024" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoría</Label>
                <Select value={albumForm.category} onValueChange={(v) => setAlbumForm({ ...albumForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={albumForm.date} onChange={(e) => setAlbumForm({ ...albumForm, date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input value={albumForm.location} onChange={(e) => setAlbumForm({ ...albumForm, location: e.target.value })} />
            </div>
            <div>
              <Label>Imagen de Portada</Label>
              <div className="flex gap-2">
                <Input value={albumForm.cover_image} onChange={(e) => setAlbumForm({ ...albumForm, cover_image: e.target.value })} placeholder="URL o subir archivo" className="flex-1" />
                <input type="file" id="album-cover" accept="image/*" onChange={(e) => handleImageUpload(e, 'album')} className="hidden" />
                <label htmlFor="album-cover">
                  <Button type="button" variant="outline" asChild disabled={uploading}>
                    <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
                  </Button>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAlbumDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#db2777]">{editingAlbum ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingImage ? "Editar Imagen" : "Nueva Imagen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitImage} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={imageForm.title} onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })} required />
            </div>
            <div>
              <Label>Álbum</Label>
              <Select value={imageForm.album_id} onValueChange={(v) => setImageForm({ ...imageForm, album_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar álbum..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin álbum</SelectItem>
                  {albums.map((album) => (<SelectItem key={album.id} value={album.id}>{album.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Imagen</Label>
              <div className="flex gap-2">
                <Input value={imageForm.image_url} onChange={(e) => setImageForm({ ...imageForm, image_url: e.target.value })} placeholder="URL o subir archivo" className="flex-1" required />
                <input type="file" id="image-upload" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} className="hidden" />
                <label htmlFor="image-upload">
                  <Button type="button" variant="outline" asChild disabled={uploading}>
                    <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
                  </Button>
                </label>
              </div>
              {imageForm.image_url && <img src={imageForm.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={imageForm.description} onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsImageDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#db2777]">{editingImage ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}