import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Palette, Upload, Loader2, Save, Sparkles, TreePine, Heart, Sun, Ghost, Cake, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState({});
  const [uploading, setUploading] = useState(false);
  const [branding, setBranding] = useState({
    logo_initials: "MQ",
    primary_color: "#0A2540",
    accent_color: "#D4AF37",
    favicon_url: "",
    seasonal_theme: "none"
  });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => base44.entities.SiteSettings.list()
  });

  useEffect(() => {
    const settingsMap = {};
    const newBranding = { ...branding };
    settings.forEach(s => {
      settingsMap[s.key] = s;
      if (s.key in newBranding) {
        newBranding[s.key] = s.value;
      }
    });
    setLocalSettings(settingsMap);
    setBranding(newBranding);
  }, [settings]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SiteSettings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SiteSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });

  const saveBrandingSetting = async (key, value) => {
    const existing = settings.find(s => s.key === key);
    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, data: { value } });
    } else {
      await createMutation.mutateAsync({ key, value, category: 'branding' });
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBranding({ ...branding, favicon_url: file_url });
    await saveBrandingSetting('favicon_url', file_url);
    setUploading(false);
  };

  const seasonalThemes = [
    { id: "none", name: "Sin tema", icon: Star, colors: { primary: "#0A2540", accent: "#D4AF37" }, description: "Tema por defecto" },
    { id: "christmas", name: "Navidad", icon: TreePine, colors: { primary: "#1a472a", accent: "#c41e3a" }, description: "Dic - Ene" },
    { id: "valentines", name: "San Valentín", icon: Heart, colors: { primary: "#8b0a50", accent: "#ff69b4" }, description: "Febrero" },
    { id: "spring", name: "Primavera", icon: Sun, colors: { primary: "#2e7d32", accent: "#ffb300" }, description: "Mar - May" },
    { id: "halloween", name: "Halloween", icon: Ghost, colors: { primary: "#1a1a2e", accent: "#ff6600" }, description: "Octubre" },
    { id: "independence", name: "Fiestas Patrias", icon: Cake, colors: { primary: "#006847", accent: "#ce1126" }, description: "Septiembre" },
  ];

  const pageSettings = [
    { key: "show_home", label: "Mostrar Inicio", defaultValue: "true" },
    { key: "show_about", label: "Mostrar Acerca de Mí", defaultValue: "true" },
    { key: "show_events", label: "Mostrar Eventos", defaultValue: "true" },
    { key: "show_publications", label: "Mostrar Publicaciones", defaultValue: "true" },
    { key: "show_research", label: "Mostrar Investigación", defaultValue: "true" },
    { key: "show_teaching", label: "Mostrar Docencia", defaultValue: "true" },
    { key: "show_blog", label: "Mostrar Blog", defaultValue: "true" },
    { key: "show_podcast", label: "Mostrar Podcast", defaultValue: "true" },
    { key: "show_gallery", label: "Mostrar Galería", defaultValue: "true" },
    { key: "show_contact", label: "Mostrar Contacto", defaultValue: "true" }
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Branding */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#D4AF37]" />
          Branding y Tema
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo Initials */}
          <div>
            <Label>Iniciales del Logo</Label>
            <div className="flex items-center gap-3 mt-2">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-white text-lg"
                style={{ background: `linear-gradient(135deg, ${branding.primary_color}, ${branding.accent_color})` }}
              >
                {branding.logo_initials}
              </div>
              <Input
                value={branding.logo_initials}
                onChange={(e) => setBranding({ ...branding, logo_initials: e.target.value.slice(0, 3) })}
                placeholder="RZ"
                className="w-24"
                maxLength={3}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => saveBrandingSetting('logo_initials', branding.logo_initials)}
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Máximo 3 caracteres</p>
          </div>

          {/* Favicon */}
          <div>
            <Label>Favicon</Label>
            <div className="flex items-center gap-3 mt-2">
              {branding.favicon_url ? (
                <img src={branding.favicon_url} alt="Favicon" className="w-12 h-12 rounded-lg object-contain border" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border">
                  <Upload className="w-5 h-5" />
                </div>
              )}
              <input
                type="file"
                id="favicon-upload"
                accept="image/*,.ico"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <label htmlFor="favicon-upload">
                <Button asChild disabled={uploading} variant="outline" className="cursor-pointer">
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">ICO, PNG o SVG recomendado</p>
          </div>

          {/* Primary Color */}
          <div>
            <Label>Color Primario</Label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                value={branding.primary_color}
                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <Input
                value={branding.primary_color}
                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                placeholder="#0A2540"
                className="w-28 font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => saveBrandingSetting('primary_color', branding.primary_color)}
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Color principal del sitio</p>
          </div>

          {/* Accent Color */}
          <div>
            <Label>Color de Acento</Label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                value={branding.accent_color}
                onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <Input
                value={branding.accent_color}
                onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                placeholder="#D4AF37"
                className="w-28 font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => saveBrandingSetting('accent_color', branding.accent_color)}
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Color dorado/secundario</p>
          </div>
        </div>
      </Card>

      {/* Temas de Temporada */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          Temas de Temporada
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Aplica un tema especial según la época del año. Los colores cambiarán automáticamente en todo el sitio.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {seasonalThemes.map((theme) => {
            const isActive = branding.seasonal_theme === theme.id;
            const ThemeIcon = theme.icon;
            
            return (
              <button
                key={theme.id}
                onClick={async () => {
                  setBranding({ ...branding, seasonal_theme: theme.id });
                  await saveBrandingSetting('seasonal_theme', theme.id);
                  // También guardar los colores del tema
                  if (theme.id !== 'none') {
                    setBranding(prev => ({
                      ...prev,
                      seasonal_theme: theme.id,
                      primary_color: theme.colors.primary,
                      accent_color: theme.colors.accent
                    }));
                    await saveBrandingSetting('primary_color', theme.colors.primary);
                    await saveBrandingSetting('accent_color', theme.colors.accent);
                  }
                }}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  isActive 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <Badge className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-xs">
                    Activo
                  </Badge>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  >
                    <ThemeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A2540]">{theme.name}</p>
                    <p className="text-xs text-slate-500">{theme.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Color primario"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Color de acento"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Visibilidad de Páginas */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#D4AF37]" />
          Visibilidad de Páginas
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Activa o desactiva las páginas que deseas mostrar en el menú de navegación.
        </p>
        
        <div className="grid md:grid-cols-2 gap-2">
          {pageSettings.map((pageSetting) => {
            const existingSetting = settings.find(s => s.key === pageSetting.key);
            const currentValue = localSettings[pageSetting.key]?.value ?? existingSetting?.value ?? pageSetting.defaultValue;
            const isEnabled = currentValue === 'true' || currentValue === true;
            
            return (
              <div key={pageSetting.key} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  {isEnabled ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  <Label className="text-sm font-medium">{pageSetting.label}</Label>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => {
                    const newValue = checked ? 'true' : 'false';
                    if (existingSetting) {
                      updateMutation.mutate({ id: existingSetting.id, data: { value: newValue } });
                    } else {
                      createMutation.mutate({
                        key: pageSetting.key,
                        value: newValue,
                        category: 'pages'
                      });
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}