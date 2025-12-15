import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Send, Users, Loader2, CheckCircle, AlertCircle,
  FileText, Eye, LayoutTemplate, ChevronRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TEMPLATES = [
  { id: 'new_post', name: 'Nuevo artículo', icon: '📝', entity: 'blog' },
  { id: 'new_publication', name: 'Nueva publicación', icon: '📚', entity: 'publication' },
  { id: 'new_episode', name: 'Nuevo episodio', icon: '🎙️', entity: 'podcast' },
  { id: 'event', name: 'Invitación a evento', icon: '📅', entity: 'event' },
  { id: 'custom', name: 'Personalizado', icon: '✏️', entity: null }
];

export default function AdminNewsletter() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0, errors: [] });
  const [showPreview, setShowPreview] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: () => contentClient.entities.Subscriber.filter({ active: true })
  });

  const { data: users = [] } = useQuery({
    queryKey: ['newsletter-users'],
    queryFn: () => contentClient.entities.User.list()
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['newsletter-blogs'],
    queryFn: () => contentClient.entities.BlogPost.filter({ published: true }, '-created_date', 20)
  });

  const { data: publications = [] } = useQuery({
    queryKey: ['newsletter-pubs'],
    queryFn: () => contentClient.entities.Publication.list('-year', 20)
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ['newsletter-episodes'],
    queryFn: () => contentClient.entities.PodcastEpisode.filter({ published: true }, '-date', 20)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['newsletter-events'],
    queryFn: () => contentClient.entities.Event.filter({ is_upcoming: true }, '-date', 20)
  });

  const getContentList = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template?.entity) return [];
    
    switch (template.entity) {
      case 'blog': return blogPosts.map(p => ({ id: p.id, title: p.title, data: p }));
      case 'publication': return publications.map(p => ({ id: p.id, title: p.title, data: p }));
      case 'podcast': return episodes.map(e => ({ id: e.id, title: `Ep. ${e.episode_number}: ${e.title}`, data: e }));
      case 'event': return events.map(e => ({ id: e.id, title: e.title, data: e }));
      default: return [];
    }
  };

  const generateEmailHTML = (title, preheader, mainContent, buttonText, buttonUrl, footerText, unsubscribeUrl) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0A2540 0%,#1e3a5f 100%);padding:32px;text-align:center;">
      <div style="display:inline-block;background:linear-gradient(135deg,#db2777,#ec4899);width:60px;height:60px;border-radius:16px;line-height:60px;font-size:24px;font-weight:bold;color:#ffffff;font-family:Georgia,serif;">MQ</div>
      <h1 style="color:#ffffff;margin:16px 0 0;font-size:24px;font-weight:600;">Dra. María de los Ángeles Quezada</h1>
      <p style="color:#ec4899;margin:4px 0 0;font-size:14px;">Profesora Investigadora</p>
    </div>
    
    <!-- Content -->
    <div style="padding:32px;">
      <h2 style="color:#0A2540;font-size:22px;margin:0 0 20px;border-left:4px solid #D4AF37;padding-left:16px;">${title}</h2>
      <div style="color:#475569;font-size:15px;line-height:1.7;">
        ${mainContent}
      </div>
      ${buttonUrl ? `
      <div style="text-align:center;margin:32px 0;">
        <a href="${buttonUrl}" style="display:inline-block;background:linear-gradient(135deg,#0A2540,#1e3a5f);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">${buttonText}</a>
      </div>` : ''}
      <p style="color:#64748b;font-size:14px;margin-top:24px;padding-top:24px;border-top:1px solid #e2e8f0;">${footerText}</p>
    </div>
    
    <!-- Footer -->
    <div style="background:#f1f5f9;padding:24px;text-align:center;">
      <p style="color:#64748b;font-size:13px;margin:0;">Dra. María de los Ángeles Quezada · Instituto Tecnológico de Tijuana, B.C., México</p>
      <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">© ${new Date().getFullYear()} Todos los derechos reservados</p>
      <p style="margin:16px 0 0;"><a href="${unsubscribeUrl}" style="color:#94a3b8;font-size:11px;text-decoration:underline;">Cancelar suscripción</a></p>
    </div>
  </div>
</body>
</html>`;
  };

  const applyTemplate = (item) => {
    setSelectedItem(item);
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    const data = item.data;
    const siteUrl = window.location.origin;

    const unsubscribeUrl = `${siteUrl}/Unsubscribe`;
    
    switch (template?.entity) {
      case 'blog':
        setSubject(`Nuevo artículo: ${data.title}`);
        setContent(generateEmailHTML(
          data.title,
          'Nuevo artículo publicado',
          `<p>¡Hola!</p>
          <p>Acabo de publicar un nuevo artículo en el blog que creo que te interesará:</p>
          <p style="font-size:18px;font-weight:600;color:#0A2540;">${data.title}</p>
          ${data.excerpt ? `<p style="color:#64748b;font-style:italic;">${data.excerpt}</p>` : ''}`,
          'Leer artículo completo',
          `${siteUrl}/BlogPost?id=${data.id}`,
          '¡Espero que lo disfrutes!<br>Saludos,<br><strong>Dra. María de los Ángeles Quezada</strong>',
          unsubscribeUrl
        ));
        break;
      case 'publication':
        setSubject(`Nueva publicación: ${data.title}`);
        setContent(generateEmailHTML(
          data.title,
          'Nueva publicación académica',
          `<p>Estimado(a) colega,</p>
          <p>Me complace compartir mi más reciente publicación académica:</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:16px 0;">
            <p style="font-size:17px;font-weight:600;color:#0A2540;margin:0 0 12px;">${data.title}</p>
            ${data.journal ? `<p style="margin:4px 0;"><strong>Publicado en:</strong> ${data.journal}</p>` : ''}
            <p style="margin:4px 0;"><strong>Año:</strong> ${data.year}</p>
            ${data.authors ? `<p style="margin:4px 0;"><strong>Autores:</strong> ${data.authors}</p>` : ''}
            ${data.doi ? `<p style="margin:4px 0;"><strong>DOI:</strong> ${data.doi}</p>` : ''}
          </div>
          ${data.abstract ? `<p><strong>Resumen:</strong></p><p style="color:#64748b;">${data.abstract}</p>` : ''}`,
          data.pdf_url ? 'Ver documento' : null,
          data.pdf_url || null,
          'Agradezco tu interés en mi trabajo.<br>Atentamente,<br><strong>Dra. María de los Ángeles Quezada</strong>',
          unsubscribeUrl
        ));
        break;
      case 'podcast':
        setSubject(`Nuevo episodio: ${data.title}`);
        setContent(generateEmailHTML(
          `Episodio ${data.episode_number}: ${data.title}`,
          'Nuevo episodio de podcast',
          `<p>¡Hola!</p>
          <p>Ya está disponible un nuevo episodio del podcast:</p>
          <div style="background:linear-gradient(135deg,#fef3c7,#fef9c3);padding:20px;border-radius:8px;margin:16px 0;text-align:center;">
            <p style="font-size:32px;margin:0;">🎙️</p>
            <p style="font-size:18px;font-weight:600;color:#0A2540;margin:8px 0;">${data.title}</p>
            ${data.duration ? `<p style="color:#64748b;margin:0;">Duración: ${data.duration}</p>` : ''}
          </div>
          ${data.description ? `<p>${data.description}</p>` : ''}
          ${data.guest_name ? `<p><strong>Invitado:</strong> ${data.guest_name}${data.guest_title ? ` - ${data.guest_title}` : ''}</p>` : ''}
          <p style="margin-top:20px;"><strong>Escúchalo en:</strong></p>
          <p>
            ${data.spotify_url ? `<a href="${data.spotify_url}" style="color:#1DB954;text-decoration:none;margin-right:16px;">🎵 Spotify</a>` : ''}
            ${data.youtube_url ? `<a href="${data.youtube_url}" style="color:#FF0000;text-decoration:none;margin-right:16px;">▶️ YouTube</a>` : ''}
            ${data.apple_url ? `<a href="${data.apple_url}" style="color:#A855F7;text-decoration:none;">🎧 Apple Podcasts</a>` : ''}
          </p>`,
          null,
          null,
          '¡No te lo pierdas!<br>Saludos,<br><strong>Dra. María de los Ángeles Quezada</strong>',
          unsubscribeUrl
        ));
        break;
      case 'event':
        const eventDate = data.date ? new Date(data.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
        setSubject(`Te invito: ${data.title}`);
        setContent(generateEmailHTML(
          data.title,
          'Invitación a evento',
          `<p>¡Hola!</p>
          <p>Te invito cordialmente a participar en:</p>
          <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:16px 0;border-left:4px solid #D4AF37;">
            <p style="font-size:18px;font-weight:600;color:#0A2540;margin:0 0 16px;">📅 ${data.title}</p>
            <table style="width:100%;font-size:14px;">
              <tr><td style="padding:4px 0;color:#64748b;width:80px;"><strong>Fecha:</strong></td><td>${eventDate}</td></tr>
              ${data.time ? `<tr><td style="padding:4px 0;color:#64748b;"><strong>Hora:</strong></td><td>${data.time}</td></tr>` : ''}
              <tr><td style="padding:4px 0;color:#64748b;"><strong>Lugar:</strong></td><td>${data.location || 'Por confirmar'}</td></tr>
            </table>
          </div>
          ${data.description ? `<p>${data.description}</p>` : ''}`,
          data.link ? 'Registrarse' : null,
          data.link || null,
          '¡Espero verte ahí!<br>Saludos,<br><strong>Dra. María de los Ángeles Quezada</strong>',
          unsubscribeUrl
        ));
        break;
    }
  };

  // Only subscribers who are also registered users can receive emails
  const eligibleSubscribers = subscribers.filter(sub => 
    users.some(user => user.email === sub.email)
  );

  const sendNewsletter = async () => {
    if (!subject || !content || eligibleSubscribers.length === 0) return;
    
    setSending(true);
    setProgress({ sent: 0, total: eligibleSubscribers.length, errors: [] });
    setLastResult(null);

    const errors = [];
    let sent = 0;

    for (const subscriber of eligibleSubscribers) {
      try {
        await contentClient.integrations.Core.SendEmail({
          to: subscriber.email,
          subject: subject,
          body: content
        });
        sent++;
        setProgress(prev => ({ ...prev, sent }));
      } catch (err) {
        errors.push({ email: subscriber.email, error: err.message });
      }
    }

    setLastResult({ sent, errors });
    setSending(false);
    
    if (sent > 0 && errors.length === 0) {
      setSubject("");
      setContent("");
    }
  };

  // Use the generated HTML content directly for preview
  const previewHtml = content || `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: linear-gradient(135deg, #4a4a4a, #6b7280); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Dra. María de los Ángeles Quezada</h1>
    <p style="color: #ec4899; margin: 10px 0 0;">Newsletter</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
    <p style="color: #64748b;">Selecciona una plantilla y contenido para ver la vista previa...</p>
  </div>
</div>`;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0A2540]">{subscribers.length}</div>
              <div className="text-sm text-slate-500">Suscriptores totales</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0A2540]">{eligibleSubscribers.length}</div>
              <div className="text-sm text-slate-500">Pueden recibir emails</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0A2540]">{subscribers.length - eligibleSubscribers.length}</div>
              <div className="text-sm text-slate-500">Sin cuenta (no reciben)</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Info banner */}
      {subscribers.length > eligibleSubscribers.length && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Nota:</strong> Solo los suscriptores que también tengan cuenta de usuario en la app pueden recibir emails. 
              {subscribers.length - eligibleSubscribers.length} suscriptor(es) no recibirán el newsletter porque no están registrados como usuarios.
            </div>
          </div>
        </Card>
      )}

      {/* Templates */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <LayoutTemplate className="w-6 h-6 text-[#D4AF37]" />
          <h2 className="text-xl font-bold text-[#0A2540]">1. Selecciona plantilla</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id);
                setSelectedItem(null);
                if (template.id === 'custom') {
                  setSubject('');
                  setContent('');
                }
              }}
              className={`p-4 rounded-lg border-2 text-center transition-all hover:border-[#D4AF37] hover:bg-amber-50 ${
                selectedTemplate === template.id 
                  ? 'border-[#D4AF37] bg-amber-50' 
                  : 'border-slate-200'
              }`}
            >
              <div className="text-2xl mb-2">{template.icon}</div>
              <div className="text-xs font-medium text-slate-700">{template.name}</div>
            </button>
          ))}
        </div>

        {/* Content Selector */}
        {selectedTemplate && selectedTemplate !== 'custom' && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3 mb-4">
              <ChevronRight className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-semibold text-[#0A2540]">2. Selecciona el contenido</h3>
            </div>
            <Select
              value={selectedItem?.id || ''}
              onValueChange={(value) => {
                const item = getContentList().find(i => i.id === value);
                if (item) applyTemplate(item);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un elemento..." />
              </SelectTrigger>
              <SelectContent>
                {getContentList().length === 0 ? (
                  <SelectItem value="_empty" disabled>No hay contenido disponible</SelectItem>
                ) : (
                  getContentList().map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* Compose Newsletter */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-[#D4AF37]" />
          <h2 className="text-xl font-bold text-[#0A2540]">3. Personaliza y envía</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asunto</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del correo..."
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contenido HTML 
              {selectedItem && <span className="text-green-600 ml-2">✓ Generado automáticamente</span>}
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Selecciona una plantilla y contenido, o escribe HTML personalizado..."
              rows={6}
              disabled={sending}
              className="font-mono text-xs"
            />
          </div>

          {/* Progress */}
          {sending && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-800">Enviando newsletter...</span>
              </div>
              <div className="text-sm text-blue-600">
                {progress.sent} de {progress.total} enviados
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {lastResult && (
            <div className={`p-4 rounded-lg ${lastResult.errors.length === 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {lastResult.errors.length === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className={lastResult.errors.length === 0 ? 'text-green-800' : 'text-amber-800'}>
                  {lastResult.sent} correo(s) enviado(s) exitosamente
                  {lastResult.errors.length > 0 && `, ${lastResult.errors.length} error(es)`}
                </span>
              </div>
              {lastResult.errors.length > 0 && (
                <div className="text-sm text-amber-700 mt-2">
                  Errores: {lastResult.errors.map(e => e.email).join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={sending}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista previa
            </Button>
            <Button
              onClick={sendNewsletter}
              disabled={sending || !subject || !content || eligibleSubscribers.length === 0}
              className="bg-[#0A2540] hover:bg-[#0A2540]/90"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar a {eligibleSubscribers.length} suscriptor(es)
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vista previa del newsletter</DialogTitle>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}