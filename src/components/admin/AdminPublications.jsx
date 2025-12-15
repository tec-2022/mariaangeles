import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminTable from "./AdminTable";
import { autoTranslateData } from "./AutoTranslate";

export default function AdminPublications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    type: "Artículo Indexado",
    index: "N/A",
    year: new Date().getFullYear().toString(),
    authors: "",
    journal: "",
    volume: "",
    pages: "",
    doi: "",
    isbn: "",
    location: "",
    abstract: "",
    abstract_en: "",
    pdf_url: ""
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const queryClient = useQueryClient();

  const { data: publications = [], isLoading } = useQuery({
    queryKey: ['admin-publications'],
    queryFn: () => contentClient.entities.Publication.list('-year')
  });

  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.Publication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.Publication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.Publication.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
    }
  });

  const handleOpenDialog = (pub = null) => {
    if (pub) {
      setEditingPub(pub);
      setFormData({
        title: pub.title || "",
        title_en: pub.title_en || "",
        type: pub.type || "Artículo Indexado",
        index: pub.index || "N/A",
        year: pub.year || new Date().getFullYear().toString(),
        authors: pub.authors || "",
        journal: pub.journal || "",
        volume: pub.volume || "",
        pages: pub.pages || "",
        doi: pub.doi || "",
        isbn: pub.isbn || "",
        location: pub.location || "",
        abstract: pub.abstract || "",
        abstract_en: pub.abstract_en || "",
        pdf_url: pub.pdf_url || ""
      });
    } else {
      setEditingPub(null);
      setFormData({
        title: "",
        title_en: "",
        type: "Artículo Indexado",
        index: "N/A",
        year: new Date().getFullYear().toString(),
        authors: "",
        journal: "",
        volume: "",
        pages: "",
        doi: "",
        isbn: "",
        location: "",
        abstract: "",
        abstract_en: "",
        pdf_url: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPub(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsTranslating(true);
    
    try {
      // Auto-translate title and abstract to English
      const dataToSave = await autoTranslateData(formData, ['title', 'abstract']);
      
      if (editingPub) {
        updateMutation.mutate({ id: editingPub.id, data: dataToSave });
      } else {
        createMutation.mutate(dataToSave);
      }
    } catch (error) {
      // If translation fails, save without translation
      if (editingPub) {
        updateMutation.mutate({ id: editingPub.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta publicación?")) {
      deleteMutation.mutate(id);
    }
  };

  const pubTypes = [
    { value: "Artículo Indexado", label: "Artículo Indexado (JCR, Scopus)" },
    { value: "Artículo Arbitrado", label: "Artículo Arbitrado" },
    { value: "Artículo Divulgación", label: "Artículo de Divulgación" },
    { value: "Conferencia", label: "Conferencia / Ponencia" },
    { value: "Libro", label: "Libro" },
    { value: "Capítulo de Libro", label: "Capítulo de Libro" },
    { value: "Memoria de Congreso", label: "Memoria de Congreso" },
    { value: "Tesis Dirigida", label: "Tesis Dirigida" },
    { value: "Reporte Técnico", label: "Reporte Técnico" },
    { value: "Working Paper", label: "Working Paper" },
    { value: "Nota Editorial", label: "Nota Editorial" }
  ];

  const indexOptions = [
    { value: "Scopus", label: "Scopus" },
    { value: "Web of Science", label: "Web of Science" },
    { value: "JCR", label: "JCR" },
    { value: "SciELO", label: "SciELO" },
    { value: "Latindex", label: "Latindex" },
    { value: "Redalyc", label: "Redalyc" },
    { value: "Otro", label: "Otro" },
    { value: "N/A", label: "N/A" }
  ];



  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const filterOptions = [
    {
      key: "type",
      label: "Tipo",
      options: pubTypes.map(t => ({ value: t.value, label: t.label }))
    },
    {
      key: "index",
      label: "Índice",
      options: indexOptions
    },

  ];

  const renderPubRow = (pub) => (
    <Card key={pub.id} className="p-4 bg-white">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{pub.type}</Badge>
            <span className="text-sm text-slate-500 font-medium">{pub.year}</span>
          </div>
          <h3 className="font-bold text-[#0A2540] mb-1 truncate">{pub.title}</h3>
          {pub.authors && <p className="text-sm text-slate-600 mb-1 truncate">{pub.authors}</p>}
          <p className="text-sm text-slate-500 italic truncate">{pub.journal}</p>
          {pub.doi && (
            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#D4AF37] flex items-center gap-1 mt-2">
              <ExternalLink className="w-3 h-3" />
              DOI: {pub.doi}
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pub)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(pub.id)} className="text-red-500 hover:text-red-700">
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
          Nueva Publicación
        </Button>
      </div>

      <AdminTable
        data={publications}
        searchFields={["title", "authors", "journal"]}
        filterOptions={filterOptions}
        renderRow={renderPubRow}
        defaultSort={{ key: "year", direction: "desc" }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPub ? "Editar Publicación" : "Nueva Publicación"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título (Español)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="flex items-center gap-1">
                  Title (English) <Languages className="w-3 h-3 text-slate-400" />
                </Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Auto-translated if empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo de Publicación</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pubTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Índice</Label>
                <Select value={formData.index || "N/A"} onValueChange={(v) => setFormData({ ...formData, index: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {indexOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Año</Label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Autores</Label>
              <Input
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="Zarate, R., González, M."
              />
            </div>

            <div>
              <Label>Revista/Editorial</Label>
              <Input
                value={formData.journal}
                onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Volumen</Label>
                <Input
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                />
              </div>
              <div>
                <Label>Páginas</Label>
                <Input
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                />
              </div>
              <div>
                <Label>Ubicación</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>DOI</Label>
                <Input
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                />
              </div>
              <div>
                <Label>ISBN</Label>
                <Input
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Resumen (Español)</Label>
                <Textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label className="flex items-center gap-1">
                  Abstract (English) <Languages className="w-3 h-3 text-slate-400" />
                </Label>
                <Textarea
                  value={formData.abstract_en}
                  onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })}
                  rows={3}
                  placeholder="Auto-translated if empty"
                />
              </div>
            </div>

            <div>
              <Label>URL del PDF</Label>
              <Input
                value={formData.pdf_url}
                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending || isTranslating}>
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traduciendo...
                  </>
                ) : (
                  <>{editingPub ? "Actualizar" : "Crear"} Publicación</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}