import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Save, User, FileText, Camera, Loader2, Mail, Phone, MapPin, Bell, BookOpen, GraduationCap, Award, FileCheck, Building, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProfile() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({ photo: false, cv: false });
  const [formData, setFormData] = useState({
    profile_photo: "",
    cv_url: "",
    full_name: "Dra. María de los Ángeles Quezada Cisnero",
    title: "Profesora Investigadora",
    bio_es: "",
    bio_en: "",
    email: "",
    phone: "",
    address: "",
    contact_notification_email: "",
    contact_cc_email: ""
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => base44.entities.SiteSettings.list()
  });

  // Fetch stats from database
  const { data: publications = [] } = useQuery({
    queryKey: ['stats-publications'],
    queryFn: () => base44.entities.Publication.list()
  });

  const { data: theses = [] } = useQuery({
    queryKey: ['stats-theses'],
    queryFn: async () => {
      const pubs = await base44.entities.Publication.filter({ type: 'Tesis Dirigida' });
      return pubs;
    }
  });

  const { data: awards = [] } = useQuery({
    queryKey: ['stats-awards'],
    queryFn: () => base44.entities.AboutContent.filter({ section: 'honor' })
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['stats-certificates'],
    queryFn: () => base44.entities.Certificate.list()
  });

  const { data: institutions = [], isLoading: loadingInstitutions } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: () => base44.entities.Institution.list('order')
  });

  const [institutionForm, setInstitutionForm] = useState({
    name: "", role: "", role_en: "", location: "", status: "collaborator", visible: true, order: 0
  });
  const [editingInstitution, setEditingInstitution] = useState(null);

  const institutionMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.Institution.update(data.id, data);
      }
      return base44.entities.Institution.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setInstitutionForm({ name: "", role: "", role_en: "", location: "", status: "collaborator", visible: true, order: 0 });
      setEditingInstitution(null);
    }
  });

  const deleteInstitutionMutation = useMutation({
    mutationFn: (id) => base44.entities.Institution.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-institutions'] })
  });

  const toggleVisibility = async (inst) => {
    await base44.entities.Institution.update(inst.id, { visible: !inst.visible });
    queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
  };

  const stats = {
    publications: publications.length,
    theses: theses.length,
    awards: awards.length,
    certificates: certificates.length
  };

  useEffect(() => {
    const newFormData = { ...formData };
    settings.forEach(s => {
      if (s.key in newFormData) {
        newFormData[s.key] = s.value;
      }
    });
    setFormData(newFormData);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async ({ key, value, category }) => {
      const existing = settings.find(s => s.key === key);
      if (existing) {
        return base44.entities.SiteSettings.update(existing.id, { value });
      } else {
        return base44.entities.SiteSettings.create({ key, value, category: category || "profile" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
    }
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ ...uploading, [type]: true });
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const key = type === 'photo' ? 'profile_photo' : 'cv_url';
    setFormData({ ...formData, [key]: file_url });
    await saveMutation.mutateAsync({ key, value: file_url, category: "profile" });
    
    setUploading({ ...uploading, [type]: false });
  };

  const handleSave = async (key) => {
    await saveMutation.mutateAsync({ 
      key, 
      value: formData[key], 
      category: ["email", "phone", "address"].includes(key) ? "contact" : "profile" 
    });
  };

  const handleSaveAll = async () => {
    const keysToSave = Object.keys(formData).filter(k => formData[k]);
    for (const key of keysToSave) {
      const category = ["email", "phone", "address"].includes(key) ? "contact" : "profile";
      await saveMutation.mutateAsync({ key, value: formData[key], category });
    }
    alert("¡Perfil guardado correctamente!");
  };

  return (
    <div className="space-y-6">
      {/* Photo and CV Upload */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#db2777]" />
            Foto de Perfil
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-[#db2777]/20">
              {formData.profile_photo ? (
                <img src={formData.profile_photo} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-slate-300" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'photo')}
                className="hidden"
              />
              <label htmlFor="photo-upload">
                <Button asChild disabled={uploading.photo} className="bg-[#db2777] cursor-pointer">
                  <span>
                    {uploading.photo ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subiendo...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Subir Foto</>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-slate-500 mt-2">JPG, PNG. Máx 5MB</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#db2777]" />
            Curriculum Vitae (CV)
          </h3>
          <div className="space-y-4">
            {formData.cv_url && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV subido correctamente
                </p>
                <a href={formData.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline">
                  Ver CV actual
                </a>
              </div>
            )}
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'cv')}
              className="hidden"
            />
            <label htmlFor="cv-upload">
              <Button asChild disabled={uploading.cv} variant="outline" className="cursor-pointer w-full">
                <span>
                  {uploading.cv ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> {formData.cv_url ? 'Cambiar CV' : 'Subir CV'}</>
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-slate-500">PDF recomendado. Máx 10MB</p>
          </div>
        </Card>
      </div>

      {/* Personal Info */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#db2777]" />
          Información Personal
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Nombre Completo</Label>
            <Input 
              value={formData.full_name} 
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Dra. María de los Ángeles Quezada"
            />
          </div>
          <div>
            <Label>Título / Cargo</Label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Profesora Investigadora"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+52 664 123 4567"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Dirección / Ubicación</Label>
            <Input 
              value={formData.address} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Instituto Tecnológico de Tijuana, B.C., México"
            />
          </div>
        </div>
      </Card>

      {/* Biography */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6">Biografía</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Biografía (Español)</Label>
            <Textarea 
              value={formData.bio_es} 
              onChange={(e) => setFormData({ ...formData, bio_es: e.target.value })}
              placeholder="Escribe tu biografía en español..."
              rows={5}
            />
          </div>
          <div>
            <Label>Biography (English)</Label>
            <Textarea 
              value={formData.bio_en} 
              onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
              placeholder="Write your biography in English..."
              rows={5}
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#db2777]" />
          Notificaciones de Contacto
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Configura los correos que recibirán notificaciones cuando alguien envíe un mensaje desde el formulario de contacto.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Email principal para notificaciones</Label>
            <Input 
              type="email"
              value={formData.contact_notification_email} 
              onChange={(e) => setFormData({ ...formData, contact_notification_email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
            <p className="text-xs text-slate-400 mt-1">Recibe las notificaciones de contacto</p>
          </div>
          <div>
            <Label>Email copia (CC)</Label>
            <Input 
              type="email"
              value={formData.contact_cc_email} 
              onChange={(e) => setFormData({ ...formData, contact_cc_email: e.target.value })}
              placeholder="otro@ejemplo.com"
            />
            <p className="text-xs text-slate-400 mt-1">Recibe copia de las notificaciones</p>
          </div>
        </div>
      </Card>

      {/* Institutions */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#db2777]" />
          Instituciones Afiliadas
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Gestiona las instituciones que aparecen en la página de Contacto.
        </p>

        {/* Form */}
        <div className="grid md:grid-cols-6 gap-3 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="md:col-span-2">
            <Label className="text-xs">Nombre de institución</Label>
            <Input 
              value={institutionForm.name}
              onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
              placeholder="Universidad..."
            />
          </div>
          <div>
            <Label className="text-xs">Rol (ES)</Label>
            <Input 
              value={institutionForm.role}
              onChange={(e) => setInstitutionForm({ ...institutionForm, role: e.target.value })}
              placeholder="Profesor..."
            />
          </div>
          <div>
            <Label className="text-xs">Role (EN)</Label>
            <Input 
              value={institutionForm.role_en}
              onChange={(e) => setInstitutionForm({ ...institutionForm, role_en: e.target.value })}
              placeholder="Professor..."
            />
          </div>
          <div>
            <Label className="text-xs">Ubicación</Label>
            <Input 
              value={institutionForm.location}
              onChange={(e) => setInstitutionForm({ ...institutionForm, location: e.target.value })}
              placeholder="Ciudad, País"
            />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={institutionForm.status} onValueChange={(v) => setInstitutionForm({ ...institutionForm, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="visiting">Visitante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => institutionMutation.mutate(editingInstitution ? { ...institutionForm, id: editingInstitution } : institutionForm)}
            disabled={!institutionForm.name || !institutionForm.role || institutionMutation.isPending}
            className="bg-[#db2777]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingInstitution ? 'Actualizar' : 'Agregar'} Institución
          </Button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {institutions.map((inst) => (
            <div key={inst.id} className={`flex items-center justify-between p-4 rounded-lg border ${inst.visible ? 'bg-white' : 'bg-slate-100 opacity-60'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {inst.status === 'principal' ? 'Principal' : inst.status === 'visiting' ? 'Visitante' : 'Colaborador'}
                  </Badge>
                  {!inst.visible && <Badge variant="secondary" className="text-xs">Oculto</Badge>}
                </div>
                <p className="font-medium text-[#4a4a4a]">{inst.name}</p>
                <p className="text-sm text-slate-600">{inst.role} · {inst.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleVisibility(inst)}
                  title={inst.visible ? 'Ocultar' : 'Mostrar'}
                >
                  {inst.visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setInstitutionForm({ name: inst.name, role: inst.role, role_en: inst.role_en || "", location: inst.location || "", status: inst.status, visible: inst.visible, order: inst.order || 0 });
                    setEditingInstitution(inst.id);
                  }}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { if (confirm('¿Eliminar esta institución?')) deleteInstitutionMutation.mutate(inst.id); }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {institutions.length === 0 && (
            <p className="text-center text-slate-400 py-4">No hay instituciones registradas</p>
          )}
        </div>
      </Card>

      {/* Auto Stats */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#db2777]" />
          Estadísticas (Calculadas Automáticamente)
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Estas estadísticas se calculan automáticamente desde la base de datos.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <BookOpen className="w-6 h-6 text-[#4a4a4a] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#4a4a4a]">{stats.publications}</p>
            <p className="text-xs text-slate-500">Publicaciones</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <GraduationCap className="w-6 h-6 text-[#4a4a4a] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#4a4a4a]">{stats.theses}</p>
            <p className="text-xs text-slate-500">Tesis Dirigidas</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <Award className="w-6 h-6 text-[#4a4a4a] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#4a4a4a]">{stats.awards}</p>
            <p className="text-xs text-slate-500">Honores/Premios</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <FileCheck className="w-6 h-6 text-[#4a4a4a] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#4a4a4a]">{stats.certificates}</p>
            <p className="text-xs text-slate-500">Certificados</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} className="bg-[#db2777]" disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Todo
        </Button>
      </div>
    </div>
  );
}