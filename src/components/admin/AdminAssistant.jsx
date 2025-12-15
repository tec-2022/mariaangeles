import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Bot, Send, Loader2, Sparkles, Lightbulb, TrendingUp, FileText, Calendar, Mic, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [useInternet, setUseInternet] = useState(false);
  const [cvFileUrl, setCvFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all data for context
  const { data: blogPosts = [] } = useQuery({ queryKey: ['assistant-blogs'], queryFn: () => contentClient.entities.BlogPost.list() });
  const { data: events = [] } = useQuery({ queryKey: ['assistant-events'], queryFn: () => contentClient.entities.Event.list() });
  const { data: publications = [] } = useQuery({ queryKey: ['assistant-pubs'], queryFn: () => contentClient.entities.Publication.list() });
  const { data: episodes = [] } = useQuery({ queryKey: ['assistant-episodes'], queryFn: () => contentClient.entities.PodcastEpisode.list() });
  const { data: analytics = [] } = useQuery({ queryKey: ['assistant-analytics'], queryFn: () => contentClient.entities.AnalyticsEvent.list('-created_date', 500) });
  const { data: comments = [] } = useQuery({ queryKey: ['assistant-comments'], queryFn: () => contentClient.entities.Comment.list() });

  // Fetch CV URL from settings
  const { data: settings = [] } = useQuery({ 
    queryKey: ['assistant-settings'], 
    queryFn: () => contentClient.entities.SiteSettings.filter({ key: 'cv_url' }) 
  });
  const savedCvUrl = settings[0]?.value;

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await contentClient.integrations.Core.UploadFile({ file });
    setCvFileUrl(file_url);
    setUploading(false);
  };

  const quickActions = [
    { icon: TrendingUp, label: "Analizar métricas", prompt: "Analiza las métricas de mi sitio web y dame insights sobre qué contenido funciona mejor y qué debería mejorar." },
    { icon: Lightbulb, label: "Ideas de contenido", prompt: "Basándote en mis publicaciones y el engagement, sugiere 5 ideas de nuevos artículos para el blog que podrían interesar a mi audiencia." },
    { icon: FileText, label: "Optimizar SEO", prompt: "Revisa mis posts del blog y sugiere mejoras de títulos y descripciones para mejorar el SEO." },
    { icon: Calendar, label: "Planificar eventos", prompt: "Sugiere ideas para próximos eventos académicos basándote en mi perfil de investigación y eventos pasados." },
    { icon: Mic, label: "Ideas podcast", prompt: "Sugiere 5 temas para nuevos episodios de podcast basándote en mis áreas de investigación y tendencias actuales." },
    { icon: FileText, label: "Analizar mi CV", prompt: "Analiza mi CV y sugiere contenido que podría agregar a mi sitio web basándote en mi experiencia y publicaciones.", needsCv: true },
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResponse("");
    setSuggestions([]);

    const context = `
Eres un asistente de IA para el panel de administración del sitio web de la Dra. María de los Ángeles Quezada Cisnero, profesora investigadora especializada en usabilidad, autismo, IA en salud y pensamiento computacional.

DATOS ACTUALES DEL SITIO:
- Blog Posts: ${blogPosts.length} artículos (${blogPosts.filter(p => p.published).length} publicados)
- Eventos: ${events.length} eventos
- Publicaciones Académicas: ${publications.length}
- Episodios Podcast: ${episodes.length}
- Comentarios: ${comments.length} (${comments.filter(c => !c.approved).length} pendientes)
- Eventos de Analytics: ${analytics.length} registrados

TOP POSTS POR VISTAS:
${blogPosts.sort((a,b) => (b.views||0)-(a.views||0)).slice(0,5).map(p => `- "${p.title}": ${p.views||0} vistas, ${p.likes||0} likes`).join('\n')}

CATEGORÍAS DE BLOG:
${Object.entries(blogPosts.reduce((acc, p) => { acc[p.category] = (acc[p.category]||0)+1; return acc; }, {})).map(([k,v]) => `- ${k}: ${v} posts`).join('\n')}

TIPOS DE PUBLICACIONES:
${Object.entries(publications.reduce((acc, p) => { acc[p.type] = (acc[p.type]||0)+1; return acc; }, {})).map(([k,v]) => `- ${k}: ${v}`).join('\n')}

Responde en español de manera profesional y útil. Si te piden análisis, sé específico con números. Si te piden ideas, sé creativo pero relevante al perfil académico.
`;

    // Determine if we should use CV file
    const fileToUse = cvFileUrl || savedCvUrl;

    const result = await contentClient.integrations.Core.InvokeLLM({
      prompt: context + "\n\nPREGUNTA DEL ADMINISTRADOR:\n" + prompt,
      add_context_from_internet: useInternet,
      file_urls: fileToUse ? [fileToUse] : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string", description: "Respuesta principal al usuario" },
          suggestions: { type: "array", items: { type: "string" }, description: "Lista de acciones sugeridas o próximos pasos" }
        }
      }
    });

    setResponse(result.response);
    setSuggestions(result.suggestions || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#0A2540]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Asistente IA</h2>
            <p className="text-slate-300 text-sm">Pregúntame sobre tu sitio, métricas o pide sugerencias</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => { setPrompt(action.prompt); }}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch 
              checked={useInternet} 
              onCheckedChange={setUseInternet}
              id="use-internet"
            />
            <Label htmlFor="use-internet" className="text-white text-sm flex items-center gap-1 cursor-pointer">
              <Globe className="w-4 h-4" />
              Buscar en internet
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCvUpload} />
              <span className="flex items-center gap-1 text-sm text-white bg-white/10 px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {cvFileUrl ? 'CV cargado ✓' : 'Subir CV'}
              </span>
            </label>
            {(cvFileUrl || savedCvUrl) && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                CV disponible
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Escribe tu pregunta o solicitud... (puedes pedir búsquedas en internet o análisis de tu CV)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none"
            rows={2}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !prompt.trim()}
            className="bg-[#D4AF37] text-[#0A2540] hover:bg-[#c4a030] px-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </Card>

      {loading && (
        <Card className="p-8 bg-white text-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] mx-auto animate-spin mb-4" />
          <p className="text-slate-600">Analizando datos y generando respuesta...</p>
        </Card>
      )}

      {response && (
        <Card className="p-6 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-wrap text-slate-700">{response}</p>
              
              {suggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-slate-600 mb-2">Acciones sugeridas:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-50">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}