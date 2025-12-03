import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { autoTranslate } from "./AutoTranslate";
import AdminTable from "./AdminTable";
import ReactQuill from "react-quill";

export default function AdminBlogPosts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    category: "Innovación",
    excerpt: "",
    excerpt_en: "",
    content: "",
    content_en: "",
    image: "",
    read_time: "5 min",
    featured: false,
    published: false
  });

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    }
  });

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title || "",
        title_en: post.title_en || "",
        category: post.category || "Innovación",
        excerpt: post.excerpt || "",
        excerpt_en: post.excerpt_en || "",
        content: post.content || "",
        content_en: post.content_en || "",
        image: post.image || "",
        read_time: post.read_time || "5 min",
        featured: post.featured || false,
        published: post.published || false
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        title_en: "",
        category: "Innovación",
        excerpt: "",
        excerpt_en: "",
        content: "",
        content_en: "",
        image: "",
        read_time: "5 min",
        featured: false,
        published: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    
    // Auto-translate in background
    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.excerpt && !formData.excerpt_en) translatePromises.push(autoTranslate(formData.excerpt).then(t => dataToSave.excerpt_en = t));
    if (formData.content && !formData.content_en) translatePromises.push(autoTranslate(formData.content).then(t => dataToSave.content_en = t));
    await Promise.all(translatePromises);
    
    // If publishing a new post, notify subscribers
    const isNewPublish = dataToSave.published && (!editingPost || !editingPost.published);
    
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }

    // Send notifications to subscribers when publishing
    if (isNewPublish) {
      const subscribers = await base44.entities.Subscriber.filter({ active: true });
      for (const sub of subscribers) {
        base44.integrations.Core.SendEmail({
          to: sub.email,
          subject: `Nuevo artículo: ${dataToSave.title}`,
          body: `
<h2>Nuevo artículo publicado</h2>
<h3>${dataToSave.title}</h3>
<p>${dataToSave.excerpt || ''}</p>
<p>Lee el artículo completo en nuestro blog.</p>
          `
        });
      }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este post?")) {
      deleteMutation.mutate(id);
    }
  };

  const togglePublished = (post) => {
    updateMutation.mutate({ id: post.id, data: { published: !post.published } });
  };

  const toggleFeatured = (post) => {
    updateMutation.mutate({ id: post.id, data: { featured: !post.featured } });
  };

  const categories = ["Innovación", "Competitividad", "Sociedad", "Desarrollo", "Tecnología"];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const filterOptions = [
    {
      key: "category",
      label: "Categoría",
      options: categories.map(c => ({ value: c, label: c }))
    },
    {
      key: "published",
      label: "Estado",
      options: [
        { value: true, label: "Publicado" },
        { value: false, label: "Borrador" }
      ]
    }
  ];

  const renderPostRow = (post) => (
    <Card key={post.id} className="p-4 bg-white">
      <div className="flex items-center gap-4">
        {post.image && (
          <img src={post.image} alt={post.title} className="w-20 h-20 object-cover rounded-lg" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[#0A2540] truncate">{post.title}</h3>
            {post.featured && <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] flex-shrink-0" />}
          </div>
          <p className="text-sm text-slate-500 mb-2 line-clamp-1">{post.excerpt}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{post.category}</Badge>
            <Badge className={post.published ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {post.published ? "Publicado" : "Borrador"}
            </Badge>
            <span className="text-xs text-slate-400">{post.read_time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => toggleFeatured(post)}>
            {post.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => togglePublished(post)}>
            {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(post)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700">
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
          Nuevo Post
        </Button>
      </div>

      <AdminTable
        data={posts}
        searchFields={["title", "excerpt", "category"]}
        filterOptions={filterOptions}
        renderRow={renderPostRow}
        defaultSort={{ key: "created_date", direction: "desc" }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Editar Post" : "Nuevo Post"}</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoría</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tiempo de lectura</Label>
                <Input
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>URL de imagen</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Extracto (resumen corto)</Label>
              <Input
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Breve descripción del artículo..."
              />
            </div>

            <div>
              <Label>Contenido</Label>
              <div className="border rounded-md overflow-hidden [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]">
                <ReactQuill
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
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
                <Label>Destacado</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPost ? "Actualizar" : "Crear"} Post
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}