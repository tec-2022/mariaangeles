import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GraduationCap, Users } from "lucide-react";
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

export default function AdminCourses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    level: "masters",
    period: "",
    institution: "",
    students: 0,
    is_current: true
  });

  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => contentClient.entities.Course.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contentClient.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentClient.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    }
  });

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title || "",
        title_en: course.title_en || "",
        description: course.description || "",
        description_en: course.description_en || "",
        level: course.level || "masters",
        period: course.period || "",
        institution: course.institution || "",
        students: course.students || 0,
        is_current: course.is_current !== false
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: "",
        title_en: "",
        description: "",
        description_en: "",
        level: "masters",
        period: "",
        institution: "",
        students: 0,
        is_current: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    
    const translatePromises = [];
    if (formData.title && !formData.title_en) translatePromises.push(autoTranslate(formData.title).then(t => dataToSave.title_en = t));
    if (formData.description && !formData.description_en) translatePromises.push(autoTranslate(formData.description).then(t => dataToSave.description_en = t));
    await Promise.all(translatePromises);
    
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este curso?")) {
      deleteMutation.mutate(id);
    }
  };

  const levels = [
    { value: "undergraduate", label: "Licenciatura" },
    { value: "masters", label: "Maestría" },
    { value: "doctorate", label: "Doctorado" },
    { value: "postgraduate", label: "Posgrado" }
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">{courses.length} cursos en total</p>
        <Button onClick={() => handleOpenDialog()} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="p-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{levels.find(l => l.value === course.level)?.label}</Badge>
                  {course.period && <span className="text-sm text-slate-500">{course.period}</span>}
                  <Badge className={course.is_current ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                    {course.is_current ? "Actual" : "Pasado"}
                  </Badge>
                </div>
                <h4 className="font-bold text-[#0A2540]">{course.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  {course.institution && <span>{course.institution}</span>}
                  {course.students > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students} estudiantes
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(course)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {courses.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <p className="text-slate-500">No hay cursos aún. ¡Crea el primero!</p>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Nivel</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Período</Label>
                <Input value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} placeholder="2024-1" />
              </div>
              <div>
                <Label>Estudiantes</Label>
                <Input type="number" value={formData.students} onChange={(e) => setFormData({ ...formData, students: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div>
              <Label>Institución</Label>
              <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formData.is_current} onCheckedChange={(v) => setFormData({ ...formData, is_current: v })} />
              <Label>Curso actual</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" className="bg-[#0A2540]" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCourse ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}