import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FlaskConical } from "lucide-react";
import { autoTranslate } from "./AutoTranslate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminResearch() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    status: "current",
    period: "",
    institution: "",
    funding: "",
    research_line: ""
  });

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-research'],
    queryFn: () => base44.entities.ResearchProject.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ResearchProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ResearchProject.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ResearchProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research'] });
    }
  });

  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || "",
        title_en: project.title_en || "",
        description: project.description || "",
        description_en: project.description_en || "",
        status: project.status || "current",
        period: project.period || "",
        institution: project.institution || "",
        funding: project.funding || "",
        research_line: project.research_line || ""
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        title_en: "",
        description: "",
        description_en: "",
        status: "current",
        period: "",
        institution: "",
        funding: "",
        research_line: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    
    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.description && !formData.description_en) translatePromises.push(autoTranslate(formData.description).then(t => dataToSave.description_en = t));
    await Promise.all(translatePromises);
    
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este proyecto?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const currentProjects = projects.filter(p => p.status === 'current');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">{projects.length} proyectos en total</p>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-green-500" />
            Proyectos Actuales ({currentProjects.length})
          </h3>
          <div className="grid gap-4">
            {currentProjects.map((project) => (
              <Card key={project.id} className="p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700">En Curso</Badge>
                      {project.period && <span className="text-sm text-slate-500">{project.period}</span>}
                    </div>
                    <h4 className="font-bold text-[#0A2540]">{project.title}</h4>
                    {project.description && <p className="text-sm text-slate-600 mt-1">{project.description}</p>}
                    {project.institution && <p className="text-xs text-slate-500 mt-2">{project.institution}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(project)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-slate-400" />
            Proyectos Completados ({completedProjects.length})
          </h3>
          <div className="grid gap-4">
            {completedProjects.map((project) => (
              <Card key={project.id} className="p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Completado</Badge>
                      {project.period && <span className="text-sm text-slate-500">{project.period}</span>}
                    </div>
                    <h4 className="font-bold text-[#0A2540]">{project.title}</h4>
                    {project.institution && <p className="text-xs text-slate-500 mt-2">{project.institution}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(project)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">En Curso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Período</Label>
                <Input value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} placeholder="2023 - Presente" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Institución</Label>
                <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} />
              </div>
              <div>
                <Label>Financiamiento</Label>
                <Input value={formData.funding} onChange={(e) => setFormData({ ...formData, funding: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Línea de Investigación</Label>
              <Input value={formData.research_line} onChange={(e) => setFormData({ ...formData, research_line: e.target.value })} />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}