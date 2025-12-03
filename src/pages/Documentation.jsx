import React, { useState } from "react";
import { 
  Book, FileText, Users, Calendar, BookOpen, Mic, Image, Mail, 
  Settings, BarChart, Shield, Globe, Palette, Bell, Search,
  ChevronRight, ChevronDown, ExternalLink, CheckCircle, Download
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (key) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateMarkdown = () => {
    let md = `# Documentación del Sitio Web\n`;
    md += `**Dra. María de los Ángeles Quezada Cisnero - Sitio Web Académico**\n`;
    md += `Versión 1.1 | Generado: ${new Date().toLocaleDateString('es-MX')}\n\n`;
    md += `---\n\n`;

    md += `## Visión General\n\n`;
    md += `Este sitio web es una plataforma académica profesional diseñada para la Dra. María de los Ángeles Quezada Cisnero.\n`;
    md += `Incluye gestión de publicaciones, eventos, blog, podcast, galería y más.\n\n`;
    md += `### Tecnologías Utilizadas\n`;
    md += `- **Frontend:** React, Tailwind CSS, shadcn/ui\n`;
    md += `- **Backend:** Base44 Platform (BaaS)\n`;
    md += `- **Base de Datos:** Entidades gestionadas automáticamente\n`;
    md += `- **Integraciones:** IA para traducciones, generación de contenido y análisis\n`;
    md += `- **Temas:** Usabilidad, Autismo, IA en Salud, Pensamiento Computacional\n\n`;
    md += `### Acceso al Panel de Administración\n`;
    md += `El panel de administración está disponible en \`/Admin\`. Solo usuarios con rol **admin** o **editor** pueden acceder.\n\n`;

    md += `---\n\n## Características Principales\n\n`;
    features.forEach(f => {
      md += `### ${f.title}\n${f.description}\n\n`;
    });

    md += `---\n\n## Páginas Públicas\n\n`;
    publicPages.forEach(page => {
      md += `### ${page.name}\n`;
      md += `**Ruta:** \`${page.path}\`\n\n`;
      md += `${page.description}\n\n`;
      md += `**Funcionalidades:**\n`;
      page.features.forEach(f => md += `- ${f}\n`);
      md += `\n`;
    });

    md += `---\n\n## Panel de Administración\n\n`;
    md += `El panel de administración permite gestionar todo el contenido del sitio. Accede desde \`/Admin\`\n\n`;
    adminModules.forEach(module => {
      md += `### ${module.name}\n`;
      md += `${module.description}\n\n`;
      md += `**Funcionalidades:**\n`;
      module.features.forEach(f => md += `- ${f}\n`);
      md += `\n`;
    });

    md += `---\n\n## Entidades de Datos\n\n`;
    md += `| Entidad | Descripción | Campos Principales |\n`;
    md += `|---------|-------------|--------------------|\n`;
    entities.forEach(e => {
      md += `| ${e.name} | ${e.description} | ${e.fields} |\n`;
    });

    md += `\n---\n\n## Sistema de Roles\n\n`;
    md += `- **Admin:** Acceso completo a todas las funcionalidades\n`;
    md += `- **Editor:** Puede gestionar contenido pero no usuarios ni configuración\n`;
    md += `- **User:** Solo puede ver contenido público\n\n`;

    md += `---\n\n*Documentación generada automáticamente*\n`;

    return md;
  };

  const downloadDocumentation = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Documentación - Sitio Web Dra. María de los Ángeles Quezada Cisnero</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #4a4a4a; border-bottom: 3px solid #db2777; padding-bottom: 10px; }
    h2 { color: #4a4a4a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; page-break-after: avoid; }
    h3 { color: #6b7280; margin-top: 20px; page-break-after: avoid; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { border: none; }
    .badge { background: #db2777; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
    .subtitle { color: #64748b; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f8fafc; color: #4a4a4a; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    ul { padding-left: 20px; }
    li { margin: 5px 0; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .feature-box { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #db2777; }
    .page-break { page-break-before: always; }
    .toc { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .toc ul { list-style: none; padding-left: 0; }
    .toc li { padding: 5px 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">Documentación v1.1</span>
    <h1>Documentación del Sitio Web</h1>
    <p class="subtitle">Dra. María de los Ángeles Quezada Cisnero - Sitio Web Académico</p>
    <p class="subtitle">Generado: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="toc">
    <h3>📋 Tabla de Contenidos</h3>
    <ul>
      <li>1. Visión General</li>
      <li>2. Características Principales</li>
      <li>3. Páginas Públicas</li>
      <li>4. Panel de Administración</li>
      <li>5. Entidades de Datos</li>
      <li>6. Sistema de Roles y Seguridad</li>
    </ul>
  </div>

  <div class="section">
    <h2>1. Visión General</h2>
    <p>Este sitio web es una plataforma académica profesional diseñada para la Dra. María de los Ángeles Quezada Cisnero. Incluye gestión de publicaciones, eventos, blog, podcast, galería y más.</p>
    
    <h3>Tecnologías Utilizadas</h3>
    <ul>
      <li><strong>Frontend:</strong> React, Tailwind CSS, shadcn/ui</li>
      <li><strong>Backend:</strong> Base44 Platform (BaaS)</li>
      <li><strong>Base de Datos:</strong> Entidades gestionadas automáticamente</li>
      <li><strong>Integraciones:</strong> IA para traducciones, generación de contenido y análisis</li>
      <li><strong>Temas:</strong> Usabilidad, Autismo, IA en Salud, Pensamiento Computacional</li>
    </ul>
    
    <h3>Acceso al Panel de Administración</h3>
    <p>El panel de administración está disponible en <code>/Admin</code>. Solo usuarios con rol <strong>admin</strong> o <strong>editor</strong> pueden acceder.</p>
  </div>

  <div class="section">
    <h2>2. Características Principales</h2>
    <div class="feature-grid">
      ${features.map(f => `<div class="feature-box"><strong>${f.title}</strong><br><span style="color:#64748b;font-size:13px;">${f.description}</span></div>`).join('')}
    </div>
  </div>

  <div class="section page-break">
    <h2>3. Páginas Públicas</h2>
    ${publicPages.map(page => `
      <h3>${page.name} <code>${page.path}</code></h3>
      <p>${page.description}</p>
      <p><strong>Funcionalidades:</strong></p>
      <ul>${page.features.map(f => `<li>${f}</li>`).join('')}</ul>
    `).join('')}
  </div>

  <div class="section page-break">
    <h2>4. Panel de Administración</h2>
    <p>El panel de administración permite gestionar todo el contenido del sitio. Accede desde <code>/Admin</code></p>
    ${adminModules.map(module => `
      <h3>${module.name}</h3>
      <p>${module.description}</p>
      <ul>${module.features.map(f => `<li>${f}</li>`).join('')}</ul>
    `).join('')}
  </div>

  <div class="section page-break">
    <h2>5. Entidades de Datos</h2>
    <p>Estas son las entidades (tablas de datos) que almacenan toda la información del sitio.</p>
    <table>
      <thead>
        <tr><th>Entidad</th><th>Descripción</th><th>Campos Principales</th></tr>
      </thead>
      <tbody>
        ${entities.map(e => `<tr><td><code>${e.name}</code></td><td>${e.description}</td><td style="font-size:11px;">${e.fields}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>6. Sistema de Roles y Seguridad</h2>
    <table>
      <thead><tr><th>Rol</th><th>Permisos</th></tr></thead>
      <tbody>
        <tr><td><strong>Admin</strong></td><td>Acceso completo a todas las funcionalidades</td></tr>
        <tr><td><strong>Editor</strong></td><td>Puede gestionar contenido pero no usuarios ni configuración</td></tr>
        <tr><td><strong>User</strong></td><td>Solo puede ver contenido público</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Documentación generada automáticamente</p>
    <p>© ${new Date().getFullYear()} Dra. María de los Ángeles Quezada Cisnero - Todos los derechos reservados</p>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const sections = [
    { id: "overview", title: "Visión General", icon: Book },
    { id: "pages", title: "Páginas Públicas", icon: FileText },
    { id: "admin", title: "Panel de Administración", icon: Settings },
    { id: "entities", title: "Entidades de Datos", icon: BarChart },
    { id: "features", title: "Características", icon: CheckCircle },
  ];

  const publicPages = [
    { 
      name: "Home (Inicio)", 
      path: "/Home",
      description: "Página principal con hero dinámico, estadísticas, eventos destacados, publicaciones recientes y podcast.",
      features: ["Hero con anuncio automático del contenido más reciente", "Sección de estadísticas", "Eventos próximos", "Últimas publicaciones", "Episodios de podcast destacados", "Llamado a la acción"]
    },
    { 
      name: "About (Acerca de)", 
      path: "/About",
      description: "Información de la investigadora: biografía, posiciones, educación, honores y reconocimientos.",
      features: ["Biografía completa", "Posiciones actuales e internacionales", "Formación académica", "Educación continua", "Honores y distinciones"]
    },
    { 
      name: "Publications (Publicaciones)", 
      path: "/Publications",
      description: "Catálogo completo de publicaciones académicas con filtros y búsqueda.",
      features: ["Filtro por tipo de publicación", "Búsqueda por título/autor", "Visualización de DOI, ISBN, ISSN", "Descarga de PDFs", "Indicadores de indexación"]
    },
    { 
      name: "Research (Investigación)", 
      path: "/Research",
      description: "Proyectos de investigación en usabilidad, autismo, IA en salud y pensamiento computacional.",
      features: ["Proyectos actuales y completados", "Líneas de investigación", "Equipo de investigadores", "Carrusel de colaboradores"]
    },
    { 
      name: "Teaching (Docencia)", 
      path: "/Teaching",
      description: "Cursos impartidos en diferentes niveles académicos y tesis dirigidas.",
      features: ["Cursos por nivel (licenciatura, maestría, doctorado)", "Tesis dirigidas", "Estadísticas de estudiantes"]
    },
    { 
      name: "Events (Eventos)", 
      path: "/Events",
      description: "Calendario de eventos académicos: conferencias, seminarios, talleres.",
      features: ["Eventos próximos y pasados", "Filtro por tipo de evento", "Enlaces de registro", "Conteo de asistentes"]
    },
    { 
      name: "Blog", 
      path: "/Blog",
      description: "Artículos y reflexiones sobre tecnología, educación, IA y accesibilidad.",
      features: ["Artículos por categoría", "Sistema de likes", "Comentarios (moderados)", "Suscripción a newsletter", "Compartir en redes"]
    },
    { 
      name: "Podcast", 
      path: "/Podcast",
      description: "Episodios del podcast con enlaces a Spotify, YouTube y Apple Podcasts.",
      features: ["Reproductor de audio", "Enlaces a plataformas", "Información de invitados", "Contador de reproducciones"]
    },
    { 
      name: "Gallery (Galería)", 
      path: "/Gallery",
      description: "Galería fotográfica organizada por álbumes y eventos.",
      features: ["Álbumes por categoría", "Carrusel de imágenes", "Visor de pantalla completa", "Filtros por tipo de evento"]
    },
    { 
      name: "Contact (Contacto)", 
      path: "/Contact",
      description: "Formulario de contacto e información de ubicación.",
      features: ["Formulario de contacto", "Mapa de ubicación", "Redes sociales", "Horario de atención"]
    }
  ];

  const adminModules = [
    {
      name: "Dashboard",
      description: "Panel principal con estadísticas, gráficos y métricas clave del sitio.",
      features: ["Gráficos de distribución de contenido", "Actividad reciente", "Insights generados por IA", "Métricas rápidas (vistas, likes, mensajes)", "Vista general de todos los módulos"]
    },
    {
      name: "Blog Posts",
      description: "Gestión de artículos del blog.",
      features: ["Crear/editar/eliminar artículos", "Editor de contenido enriquecido", "Traducción automática ES↔EN", "Gestión de imágenes", "Publicar/despublicar"]
    },
    {
      name: "Events",
      description: "Administración de eventos académicos.",
      features: ["Crear eventos con fecha, hora, ubicación", "Marcar como destacado", "Gestión de imágenes", "Enlaces de registro"]
    },
    {
      name: "Publications",
      description: "Catálogo de publicaciones académicas.",
      features: ["Múltiples tipos (artículos, libros, conferencias)", "Campos DOI, ISBN, ISSN", "Subida de PDFs", "Índices de indexación"]
    },
    {
      name: "Podcast",
      description: "Gestión de episodios del podcast.",
      features: ["Información de episodios e invitados", "URLs de plataformas (Spotify, YouTube, Apple)", "Marcar como publicado/destacado"]
    },
    {
      name: "Proyectos de Investigación",
      description: "Gestión de proyectos de investigación.",
      features: ["Proyectos actuales y completados", "Período e institución", "Financiamiento"]
    },
    {
      name: "Líneas de Investigación",
      description: "Líneas de investigación editables.",
      features: ["Crear/editar líneas de investigación", "Selección de icono", "Etiquetas bilingües", "Control de visibilidad"]
    },
    {
      name: "Teaching",
      description: "Cursos y docencia.",
      features: ["Cursos por nivel académico", "Período e institución", "Número de estudiantes"]
    },
    {
      name: "Gallery",
      description: "Galería de imágenes.",
      features: ["Crear álbumes", "Subir múltiples imágenes", "Organizar por categoría", "Establecer portadas"]
    },
    {
      name: "About",
      description: "Información personal y profesional.",
      features: ["Posiciones actuales", "Educación y formación", "Honores y reconocimientos"]
    },
    {
      name: "Researchers",
      description: "Equipo de investigación.",
      features: ["Agregar colaboradores", "Información de contacto", "Redes académicas"]
    },
    {
      name: "Certificates",
      description: "Certificados y constancias.",
      features: ["Subir PDFs", "Extracción automática de datos", "Organización por año"]
    },
    {
      name: "Messages",
      description: "Bandeja de mensajes de contacto.",
      features: ["Ver mensajes recibidos", "Marcar como leído/respondido", "Archivar mensajes"]
    },
    {
      name: "Comments",
      description: "Moderación de comentarios.",
      features: ["Aprobar/rechazar comentarios", "Ver comentarios pendientes", "Eliminar spam"]
    },
    {
      name: "Subscribers",
      description: "Lista de suscriptores al newsletter.",
      features: ["Ver suscriptores activos", "Exportar a CSV", "Activar/desactivar suscripciones"]
    },
    {
      name: "Newsletter",
      description: "Envío de newsletters.",
      features: ["Plantillas predefinidas", "Seleccionar contenido reciente", "Vista previa HTML", "Envío masivo"]
    },
    {
      name: "Social Links",
      description: "Redes sociales y perfiles académicos.",
      features: ["LinkedIn, ResearchGate, ORCID, etc.", "Activar/desactivar enlaces", "Ordenar visualización"]
    },
    {
      name: "Users",
      description: "Gestión de usuarios del sistema.",
      features: ["Invitar nuevos usuarios", "Asignar roles (admin, editor)", "Ver usuarios registrados"]
    },
    {
      name: "Analytics",
      description: "Estadísticas de uso del sitio.",
      features: ["Vistas por página", "Contenido más popular", "Actividad por fecha"]
    },
    {
      name: "Profile",
      description: "Perfil de la investigadora principal.",
      features: ["Foto de perfil", "CV en PDF", "Información de contacto", "Biografía bilingüe", "Notificaciones de contacto"]
    },
    {
      name: "Settings",
      description: "Configuración general del sitio.",
      features: ["Visibilidad de páginas", "Branding (logo, colores)", "Favicon personalizado", "Efectos estacionales (Navidad, Halloween, San Valentín, Primavera, Independencia)", "Temas visuales dinámicos"]
    },
    {
      name: "SEO",
      description: "Optimización para buscadores.",
      features: ["Meta títulos y descripciones", "Palabras clave", "Open Graph para redes"]
    },
    {
      name: "AI Assistant",
      description: "Asistente de inteligencia artificial.",
      features: ["Generar contenido", "Traducir textos", "Obtener sugerencias"]
    }
  ];

  const entities = [
    { name: "Publication", description: "Publicaciones académicas (artículos, libros, conferencias)", fields: "title, type, year, authors, journal, DOI, abstract, pdf_url, index" },
    { name: "BlogPost", description: "Artículos del blog", fields: "title, slug, category, excerpt, content, image, featured, published, likes, views" },
    { name: "PodcastEpisode", description: "Episodios del podcast", fields: "title, episode_number, duration, date, guest_name, audio_url, spotify_url, youtube_url" },
    { name: "Event", description: "Eventos académicos", fields: "title, description, date, time, location, type, image, link, is_upcoming, featured" },
    { name: "ResearchProject", description: "Proyectos de investigación", fields: "title, description, status, period, institution, funding, research_line" },
    { name: "ResearchLine", description: "Líneas de investigación", fields: "title, description, icon, tags, order, visible" },
    { name: "Course", description: "Cursos impartidos", fields: "title, description, level, period, institution, students, is_current" },
    { name: "Researcher", description: "Miembros del equipo", fields: "name, title, specialty, institution, photo, email, linkedin, bio, is_principal" },
    { name: "AboutContent", description: "Contenido de la página About", fields: "section, title, subtitle, description, period, institution, is_current, order" },
    { name: "Certificate", description: "Certificados y constancias", fields: "title, type, issuer, date, year, pdf_url, description, visible" },
    { name: "GalleryAlbum", description: "Álbumes de galería", fields: "title, description, event_name, date, location, category, cover_image" },
    { name: "GalleryImage", description: "Imágenes de galería", fields: "title, description, album_id, category, image_url, date, location" },
    { name: "NewsItem", description: "Noticias y anuncios", fields: "title, type, badge_color, date, link, published" },
    { name: "SiteSettings", description: "Configuración del sitio", fields: "key, value, category" },
    { name: "SocialLink", description: "Enlaces a redes sociales", fields: "platform, url, active, order" },
    { name: "ContactMessage", description: "Mensajes de contacto", fields: "name, email, subject, message, read, replied, archived" },
    { name: "Comment", description: "Comentarios en blog", fields: "post_id, name, email, content, approved" },
    { name: "Subscriber", description: "Suscriptores newsletter", fields: "email, active, source" },
    { name: "AnalyticsEvent", description: "Eventos de analítica", fields: "event_type, page, content_id, content_title, session_id" },
    { name: "Institution", description: "Instituciones afiliadas", fields: "name, role, location, status, visible, order" }
  ];

  const features = [
    { 
      title: "Multilenguaje", 
      icon: Globe, 
      description: "Soporte completo para español e inglés con cambio instantáneo de idioma." 
    },
    { 
      title: "Modo Oscuro", 
      icon: Palette, 
      description: "Tema claro y oscuro con transiciones suaves." 
    },
    { 
      title: "Efectos Estacionales", 
      icon: Palette, 
      description: "Decoraciones automáticas para Navidad, Halloween, San Valentín, Primavera e Independencia." 
    },
    { 
      title: "Diseño Responsivo", 
      icon: FileText, 
      description: "Adaptado para móviles, tablets y escritorio." 
    },
    { 
      title: "SEO Optimizado", 
      icon: Search, 
      description: "Meta tags, Open Graph y estructura optimizada para buscadores." 
    },
    { 
      title: "Traducción Automática", 
      icon: Globe, 
      description: "IA integrada para traducir contenido automáticamente." 
    },
    { 
      title: "Newsletter", 
      icon: Mail, 
      description: "Sistema de suscripción y envío de newsletters con plantillas." 
    },
    { 
      title: "Analíticas", 
      icon: BarChart, 
      description: "Seguimiento de vistas, likes y actividad del sitio." 
    },
    { 
      title: "Insights IA", 
      icon: Bell, 
      description: "Recomendaciones automáticas generadas por inteligencia artificial." 
    },
    { 
      title: "Cookies & Privacidad", 
      icon: Shield, 
      description: "Banner de consentimiento de cookies y políticas de privacidad." 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-[#db2777]/10 text-[#db2777] border-[#db2777]/30 mb-4">
            Documentación v1.1
          </Badge>
          <h1 className="text-4xl font-serif font-bold text-[#4a4a4a] mb-4">
            Documentación del Sitio Web
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Guía completa para el cliente sobre las funcionalidades, páginas y administración del sitio web académico de la Dra. María de los Ángeles Quezada Cisnero.
          </p>
          <Button onClick={downloadDocumentation} className="bg-[#db2777] hover:bg-[#db2777]/90">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-[#4a4a4a] mb-4">Contenido</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? "bg-[#db2777] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-[#4a4a4a] mb-4 flex items-center gap-3">
                    <Book className="w-6 h-6 text-[#db2777]" />
                    Visión General
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p>
                      Este sitio web es una plataforma académica profesional diseñada para la Dra. María de los Ángeles Quezada Cisnero. 
                      Incluye gestión de publicaciones, eventos, blog, podcast, galería y más.
                    </p>
                    <h3>Tecnologías Utilizadas</h3>
                    <ul>
                      <li><strong>Frontend:</strong> React, Tailwind CSS, shadcn/ui</li>
                      <li><strong>Backend:</strong> Base44 Platform (BaaS)</li>
                      <li><strong>Base de Datos:</strong> Entidades gestionadas automáticamente</li>
                      <li><strong>Integraciones:</strong> IA para traducciones, generación de contenido y análisis</li>
                      <li><strong>Temas:</strong> Usabilidad, Autismo, IA en Salud, Pensamiento Computacional</li>
                    </ul>
                    <h3>Acceso al Panel de Administración</h3>
                    <p>
                      El panel de administración está disponible en <code>/Admin</code>. 
                      Solo usuarios con rol <strong>admin</strong> o <strong>editor</strong> pueden acceder.
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-bold text-[#4a4a4a] mb-4">Características Principales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-[#db2777]/10 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-5 h-5 text-[#db2777]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#4a4a4a]">{feature.title}</h4>
                          <p className="text-sm text-slate-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Public Pages */}
            {activeSection === "pages" && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-[#4a4a4a] mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#db2777]" />
                  Páginas Públicas
                </h2>
                <div className="space-y-4">
                  {publicPages.map((page, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpand(`page-${idx}`)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">{page.path}</Badge>
                          <span className="font-semibold text-[#4a4a4a]">{page.name}</span>
                        </div>
                        {expandedItems[`page-${idx}`] ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {expandedItems[`page-${idx}`] && (
                        <div className="p-4 border-t">
                          <p className="text-slate-600 mb-3">{page.description}</p>
                          <h4 className="font-semibold text-sm text-[#4a4a4a] mb-2">Funcionalidades:</h4>
                          <ul className="grid md:grid-cols-2 gap-1">
                            {page.features.map((feature, fidx) => (
                              <li key={fidx} className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Admin Panel */}
            {activeSection === "admin" && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-[#4a4a4a] mb-6 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-[#db2777]" />
                  Panel de Administración
                </h2>
                <p className="text-slate-600 mb-6">
                  El panel de administración permite gestionar todo el contenido del sitio. 
                  Accede desde <code className="bg-slate-100 px-2 py-1 rounded">/Admin</code>
                </p>
                <div className="space-y-3">
                  {adminModules.map((module, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpand(`admin-${idx}`)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="font-semibold text-[#4a4a4a]">{module.name}</span>
                        {expandedItems[`admin-${idx}`] ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {expandedItems[`admin-${idx}`] && (
                        <div className="p-4 border-t">
                          <p className="text-slate-600 mb-3">{module.description}</p>
                          <ul className="space-y-1">
                            {module.features.map((feature, fidx) => (
                              <li key={fidx} className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Entities */}
            {activeSection === "entities" && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-[#4a4a4a] mb-6 flex items-center gap-3">
                  <BarChart className="w-6 h-6 text-[#db2777]" />
                  Entidades de Datos
                </h2>
                <p className="text-slate-600 mb-6">
                  Estas son las entidades (tablas de datos) que almacenan toda la información del sitio.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-[#4a4a4a]">Entidad</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4a4a4a]">Descripción</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#4a4a4a]">Campos Principales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entities.map((entity, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="font-mono">{entity.name}</Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{entity.description}</td>
                          <td className="py-3 px-4 text-slate-500 text-xs font-mono">{entity.fields}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Features */}
            {activeSection === "features" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-[#4a4a4a] mb-6 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#db2777]" />
                    Características del Sistema
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🌐 Multilenguaje</h3>
                      <p className="text-slate-600 mb-2">El sitio soporta español e inglés. El usuario puede cambiar el idioma en cualquier momento desde el menú.</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Todos los textos de interfaz están traducidos</li>
                        <li>El contenido (posts, publicaciones, etc.) puede tener versiones en ambos idiomas</li>
                        <li>El administrador puede usar traducción automática con IA</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🎨 Modo Oscuro</h3>
                      <p className="text-slate-600">Tema visual alternativo que reduce la fatiga visual. Se activa desde el ícono de luna/sol en el menú.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">📧 Sistema de Newsletter</h3>
                      <p className="text-slate-600 mb-2">Permite enviar correos masivos a los suscriptores.</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Plantillas predefinidas para diferentes tipos de contenido</li>
                        <li>Selección de contenido reciente (posts, episodios, publicaciones)</li>
                        <li>Vista previa antes de enviar</li>
                        <li>Solo usuarios registrados pueden recibir emails</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🤖 Inteligencia Artificial</h3>
                      <p className="text-slate-600 mb-2">Integración con IA para varias funcionalidades:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Traducción automática de contenido ES↔EN</li>
                        <li>Generación de insights y recomendaciones en el dashboard</li>
                        <li>Asistente para crear contenido</li>
                        <li>Extracción de datos de PDFs (certificados)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">📊 Analíticas</h3>
                      <p className="text-slate-600 mb-2">Seguimiento de actividad del sitio:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Vistas por página</li>
                        <li>Contenido más popular</li>
                        <li>Likes y shares en posts</li>
                        <li>Gráficos de actividad temporal</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🔒 Seguridad y Roles</h3>
                      <p className="text-slate-600 mb-2">Sistema de permisos basado en roles:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li><strong>Admin:</strong> Acceso completo a todas las funcionalidades</li>
                        <li><strong>Editor:</strong> Puede gestionar contenido pero no usuarios ni configuración</li>
                        <li><strong>User:</strong> Solo puede ver contenido público</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🎄 Efectos Estacionales</h3>
                      <p className="text-slate-600 mb-2">El sitio incluye decoraciones temáticas configurables:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li><strong>Navidad:</strong> Copos de nieve, árbol navideño, muñeco de nieve y luces</li>
                        <li><strong>Halloween:</strong> Fantasmas flotantes, calabazas y murciélagos</li>
                        <li><strong>San Valentín:</strong> Corazones flotantes y rosas</li>
                        <li><strong>Primavera:</strong> Flores de cerezo y mariposas</li>
                        <li><strong>Independencia:</strong> Confeti, fuegos artificiales y bandera mexicana</li>
                        <li>Se activan desde Admin → Ajustes → Tema Estacional</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🍪 Consentimiento de Cookies</h3>
                      <p className="text-slate-600 mb-2">Banner de cookies con opciones de privacidad:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Aceptar todas las cookies</li>
                        <li>Aceptar solo las necesarias</li>
                        <li>Configuración personalizada (analíticas, marketing)</li>
                        <li>Cumplimiento con regulaciones de privacidad</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#4a4a4a] mb-3">🔗 Burbuja Social</h3>
                      <p className="text-slate-600 mb-2">Acceso rápido a redes sociales:</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Botón flotante con panel expandible</li>
                        <li>Enlaces a LinkedIn, ResearchGate, ORCID, Google Scholar, etc.</li>
                        <li>Iconos personalizados por plataforma</li>
                        <li>Configurable desde Admin → Redes Sociales</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-[#4a4a4a] text-white">
                  <h3 className="text-lg font-semibold mb-3">📞 Soporte</h3>
                  <p className="text-slate-300 mb-4">
                    Para cualquier duda o soporte técnico, contacta al desarrollador.
                  </p>
                  <p className="text-sm text-slate-400">
                    Documentación generada automáticamente • Versión 1.0 • {new Date().toLocaleDateString('es-MX')}
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}