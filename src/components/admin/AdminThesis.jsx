import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminThesis() {
  const [formData, setFormData] = useState({
    // In Progress
    thesis_doctorate_progress: "0",
    thesis_doctorate_progress_show: true,
    thesis_masters_progress: "0",
    thesis_masters_progress_show: true,
    thesis_undergrad_progress: "0",
    thesis_undergrad_progress_show: true,
    // Graduated
    thesis_doctorate_graduated: "0",
    thesis_doctorate_graduated_show: true,
    thesis_masters_graduated: "0",
    thesis_masters_graduated_show: true,
    thesis_undergrad_graduated: "0",
    thesis_undergrad_graduated_show: true,
    // Section visibility
    thesis_section_show: true
  });
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['admin-thesis-settings'],
    queryFn: () => base44.entities.SiteSettings.filter({ category: 'stats' })
  });

  useEffect(() => {
    if (settings.length > 0) {
      const newData = { ...formData };
      settings.forEach(s => {
        if (s.key in newData) {
          // Handle boolean values for _show fields
          if (s.key.endsWith('_show')) {
            newData[s.key] = s.value === 'true';
          } else {
            newData[s.key] = s.value;
          }
        }
      });
      setFormData(newData);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const promises = Object.entries(data).map(async ([key, value]) => {
        const existing = settings.find(s => s.key === key);
        const valueStr = String(value);
        if (existing) {
          return base44.entities.SiteSettings.update(existing.id, { value: valueStr });
        } else {
          return base44.entities.SiteSettings.create({ key, value: valueStr, category: 'stats' });
        }
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-thesis-settings'] });
      setSaving(false);
    }
  });

  const handleSave = () => {
    setSaving(true);
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const levels = [
    { key: "doctorate", label: "Doctorado" },
    { key: "masters", label: "Maestría" },
    { key: "undergrad", label: "Licenciatura" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0A2540]/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#0A2540]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0A2540]">Dirección de Tesis</h3>
            <p className="text-sm text-slate-500">Configura las estadísticas de tesis dirigidas</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-[#0A2540]" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {/* Section visibility toggle */}
      <Card className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-[#0A2540]">Mostrar sección en Docencia</h4>
            <p className="text-sm text-slate-500">Activa o desactiva toda la sección de Dirección de Tesis</p>
          </div>
          <Switch 
            checked={formData.thesis_section_show} 
            onCheckedChange={(v) => setFormData({ ...formData, thesis_section_show: v })} 
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* In Progress */}
        <Card className="p-6 bg-white">
          <h4 className="font-bold text-[#0A2540] mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            En Proceso
          </h4>
          <div className="space-y-4">
            {levels.map((level) => {
              const countKey = `thesis_${level.key}_progress`;
              const showKey = `thesis_${level.key}_progress_show`;
              return (
                <div key={level.key} className="flex items-center gap-4">
                  <Switch 
                    checked={formData[showKey]} 
                    onCheckedChange={(v) => setFormData({ ...formData, [showKey]: v })} 
                  />
                  <Label className="flex-1">{level.label}</Label>
                  <Input 
                    type="number" 
                    value={formData[countKey]} 
                    onChange={(e) => setFormData({ ...formData, [countKey]: e.target.value })}
                    className="w-20 text-center"
                    min="0"
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Graduated */}
        <Card className="p-6 bg-white">
          <h4 className="font-bold text-[#0A2540] mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Graduados
          </h4>
          <div className="space-y-4">
            {levels.map((level) => {
              const countKey = `thesis_${level.key}_graduated`;
              const showKey = `thesis_${level.key}_graduated_show`;
              return (
                <div key={level.key} className="flex items-center gap-4">
                  <Switch 
                    checked={formData[showKey]} 
                    onCheckedChange={(v) => setFormData({ ...formData, [showKey]: v })} 
                  />
                  <Label className="flex-1">{level.label}</Label>
                  <Input 
                    type="number" 
                    value={formData[countKey]} 
                    onChange={(e) => setFormData({ ...formData, [countKey]: e.target.value })}
                    className="w-20 text-center"
                    min="0"
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Nota:</strong> Solo se mostrarán en la página de Docencia los niveles que tengan el switch activado y un valor mayor a 0.
        </p>
      </Card>
    </div>
  );
}