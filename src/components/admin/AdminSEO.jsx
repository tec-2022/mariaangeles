import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Globe, FileText, CheckCircle2, AlertCircle, 
  ExternalLink, Copy, Download, Lightbulb, TrendingUp,
  Settings, Link2, Image, Code
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";

export default function AdminSEO() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(null);
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { data: seoSettings = [], isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: () => contentClient.entities.SiteSettings.filter({ category: 'seo' })
  });

  const saveMutation = useMutation({
    mutationFn: async (settings) => {
      for (const setting of settings) {
        const existing = seoSettings.find(s => s.key === setting.key);
        if (existing) {
          await contentClient.entities.SiteSettings.update(existing.id, setting);
        } else {
          await contentClient.entities.SiteSettings.create({ ...setting, category: 'seo' });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['seo-settings'])
  });

  const getSetting = (key) => seoSettings.find(s => s.key === key)?.value || '';

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (seoSettings.length > 0) {
      const data = {};
      seoSettings.forEach(s => { data[s.key] = s.value; });
      setFormData(data);
    }
  }, [seoSettings]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const settings = Object.entries(formData).map(([key, value]) => ({ key, value, category: 'seo' }));
    saveMutation.mutate(settings);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${formData.site_url || 'https://tudominio.com'}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${formData.site_url || 'https://tudominio.com'}/About</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${formData.site_url || 'https://tudominio.com'}/Publications</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${formData.site_url || 'https://tudominio.com'}/Research</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${formData.site_url || 'https://tudominio.com'}/Blog</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${formData.site_url || 'https://tudominio.com'}/Contact</loc>
    <priority>0.7</priority>
  </url>
</urlset>`;

  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${formData.site_url || 'https://tudominio.com'}/sitemap.xml`;

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const seoChecklist = [
    { id: 1, label: isEn ? 'Site title configured' : 'Título del sitio configurado', done: !!formData.site_title },
    { id: 2, label: isEn ? 'Meta description configured' : 'Meta descripción configurada', done: !!formData.meta_description },
    { id: 3, label: isEn ? 'Keywords defined' : 'Palabras clave definidas', done: !!formData.keywords },
    { id: 4, label: isEn ? 'Site URL configured' : 'URL del sitio configurada', done: !!formData.site_url },
    { id: 5, label: isEn ? 'Google Search Console verified' : 'Google Search Console verificado', done: formData.google_verification === 'verified' },
    { id: 6, label: isEn ? 'Open Graph configured' : 'Open Graph configurado', done: !!formData.og_image },
  ];

  const completedCount = seoChecklist.filter(item => item.done).length;
  const seoScore = Math.round((completedCount / seoChecklist.length) * 100);

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con Score */}
      <Card className="bg-gradient-to-r from-[#0A2540] to-[#1e3a5f] text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Search className="w-6 h-6" />
                {isEn ? 'SEO Configuration' : 'Configuración SEO'}
              </CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                {isEn ? 'Optimize your site to appear in top Google results' : 'Optimiza tu sitio para aparecer en los primeros resultados de Google'}
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${seoScore >= 80 ? 'text-green-400' : seoScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {seoScore}%
              </div>
              <div className="text-xs text-slate-400">{isEn ? 'SEO Score' : 'Puntuación SEO'}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="basic" className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            {isEn ? 'Basic Settings' : 'Configuración Básica'}
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white">
            <Globe className="w-4 h-4 mr-2" />
            Open Graph
          </TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white">
            <Code className="w-4 h-4 mr-2" />
            {isEn ? 'Technical Files' : 'Archivos Técnicos'}
          </TabsTrigger>
          <TabsTrigger value="guide" className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white">
            <Lightbulb className="w-4 h-4 mr-2" />
            {isEn ? 'SEO Guide' : 'Guía SEO'}
          </TabsTrigger>
        </TabsList>

        {/* Configuración Básica */}
        <TabsContent value="basic">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{isEn ? 'Main Meta Tags' : 'Meta Tags Principales'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{isEn ? 'Site URL' : 'URL del Sitio'}</Label>
                    <Input 
                      placeholder="https://yourdomain.com"
                      value={formData.site_url || ''}
                      onChange={(e) => handleChange('site_url', e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">{isEn ? 'Your custom domain (without / at the end)' : 'Tu dominio personalizado (sin / al final)'}</p>
                  </div>

                  <div>
                    <Label>{isEn ? 'Site Title (Title Tag)' : 'Título del Sitio (Title Tag)'}</Label>
                    <Input 
                      placeholder={isEn ? "Dra. María de los Ángeles Quezada - Computer Science Researcher" : "Dra. María de los Ángeles Quezada - Investigadora en Ciencias de la Computación"}
                      value={formData.site_title || ''}
                      onChange={(e) => handleChange('site_title', e.target.value)}
                      maxLength={60}
                    />
                    <p className="text-xs text-slate-500 mt-1">{(formData.site_title || '').length}/60 {isEn ? 'characters (recommended 50-60)' : 'caracteres (recomendado 50-60)'}</p>
                  </div>

                  <div>
                    <Label>{isEn ? 'Meta Description' : 'Meta Descripción'}</Label>
                    <Textarea 
                      placeholder={isEn ? "Researcher specialized in usability for users with autism, human-computer interaction, and AI applied to healthcare..." : "Investigadora especializada en usabilidad para usuarios con autismo, interacción humano-computadora e IA aplicada a la salud..."}
                      value={formData.meta_description || ''}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-slate-500 mt-1">{(formData.meta_description || '').length}/160 {isEn ? 'characters (recommended 150-160)' : 'caracteres (recomendado 150-160)'}</p>
                  </div>

                  <div>
                    <Label>{isEn ? 'Keywords' : 'Palabras Clave'}</Label>
                    <Textarea 
                      placeholder={isEn ? "usability, autism, human-computer interaction, artificial intelligence, healthcare, computational thinking, academic research" : "usabilidad, autismo, interacción humano-computadora, inteligencia artificial, salud, pensamiento computacional, investigación académica"}
                      value={formData.keywords || ''}
                      onChange={(e) => handleChange('keywords', e.target.value)}
                      rows={2}
                    />
                    <p className="text-xs text-slate-500 mt-1">{isEn ? 'Separated by commas (5-10 main keywords)' : 'Separadas por comas (5-10 palabras clave principales)'}</p>
                  </div>

                  <div>
                    <Label>{isEn ? 'Google Search Console - Verification Code' : 'Google Search Console - Código de Verificación'}</Label>
                    <Input 
                      placeholder="google-site-verification=XXXXXXXXXXXXX"
                      value={formData.google_verification_code || ''}
                      onChange={(e) => handleChange('google_verification_code', e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">{isEn ? 'Copy the verification code from Google Search Console' : 'Copia el código de verificación de Google Search Console'}</p>
                  </div>

                  <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-[#D4AF37] hover:bg-[#b8972e] text-[#0A2540]">
                    {saveMutation.isPending ? (isEn ? 'Saving...' : 'Guardando...') : (isEn ? 'Save Settings' : 'Guardar Configuración')}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Checklist */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {isEn ? 'SEO Checklist' : 'Checklist SEO'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seoChecklist.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                        <span className={item.done ? 'text-slate-600' : 'text-slate-400'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Open Graph */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isEn ? 'Open Graph (Social Media)' : 'Open Graph (Redes Sociales)'}</CardTitle>
              <CardDescription>
                {isEn ? 'Configure how your site looks when shared on Facebook, Twitter, LinkedIn, etc.' : 'Configura cómo se ve tu sitio cuando se comparte en Facebook, Twitter, LinkedIn, etc.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{isEn ? 'Social Media Title' : 'Título para Redes Sociales'}</Label>
                <Input 
                  placeholder={isEn ? "Dra. María de los Ángeles Quezada | Academic Researcher" : "Dra. María de los Ángeles Quezada | Investigadora Académica"}
                  value={formData.og_title || ''}
                  onChange={(e) => handleChange('og_title', e.target.value)}
                />
              </div>

              <div>
                <Label>{isEn ? 'Social Media Description' : 'Descripción para Redes Sociales'}</Label>
                <Textarea 
                  placeholder={isEn ? "Researcher specialized in usability, human-computer interaction and AI in healthcare..." : "Investigadora especializada en usabilidad, interacción humano-computadora e IA en salud..."}
                  value={formData.og_description || ''}
                  onChange={(e) => handleChange('og_description', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>{isEn ? 'Share Image (URL)' : 'Imagen para Compartir (URL)'}</Label>
                <Input 
                  placeholder="https://yourdomain.com/share-image.jpg"
                  value={formData.og_image || ''}
                  onChange={(e) => handleChange('og_image', e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">{isEn ? 'Recommended size: 1200x630 pixels' : 'Tamaño recomendado: 1200x630 píxeles'}</p>
              </div>

              <div>
                <Label>Twitter Handle</Label>
                <Input 
                  placeholder="@robertzarate"
                  value={formData.twitter_handle || ''}
                  onChange={(e) => handleChange('twitter_handle', e.target.value)}
                />
              </div>

              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-[#D4AF37] hover:bg-[#b8972e] text-[#0A2540]">
                {saveMutation.isPending ? (isEn ? 'Saving...' : 'Guardando...') : (isEn ? 'Save Settings' : 'Guardar Configuración')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archivos Técnicos */}
        <TabsContent value="technical">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  sitemap.xml
                </CardTitle>
                <CardDescription>
                  {isEn ? 'File that tells Google which pages to index' : 'Archivo que le dice a Google qué páginas indexar'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                  {sitemapContent}
                </pre>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(sitemapContent, 'sitemap')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied === 'sitemap' ? (isEn ? 'Copied!' : '¡Copiado!') : (isEn ? 'Copy' : 'Copiar')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadFile(sitemapContent, 'sitemap.xml')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isEn ? 'Download' : 'Descargar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  robots.txt
                </CardTitle>
                <CardDescription>
                  {isEn ? 'File that controls what search engines can crawl' : 'Archivo que controla qué pueden rastrear los buscadores'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                  {robotsContent}
                </pre>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(robotsContent, 'robots')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied === 'robots' ? (isEn ? 'Copied!' : '¡Copiado!') : (isEn ? 'Copy' : 'Copiar')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadFile(robotsContent, 'robots.txt')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isEn ? 'Download' : 'Descargar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guía SEO */}
        <TabsContent value="guide">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  {isEn ? 'Steps to Rank on Google' : 'Pasos para Posicionarte en Google'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h4 className="font-semibold text-[#0A2540]">{isEn ? '1. Connect Your Domain' : '1. Conecta tu Dominio'}</h4>
                  <p className="text-sm text-slate-600">{isEn ? 'Set up a custom domain (e.g., robertzarate.com) instead of the default temporary domain.' : 'Configura un dominio personalizado (ej: robertzarate.com) en lugar del dominio temporal por defecto.'}</p>
                </div>

                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h4 className="font-semibold text-[#0A2540]">{isEn ? '2. Verify on Google Search Console' : '2. Verifica en Google Search Console'}</h4>
                  <p className="text-sm text-slate-600">
                    {isEn ? 'Go to' : 'Ve a'} <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">search.google.com/search-console <ExternalLink className="w-3 h-3" /></a> {isEn ? 'and add your site.' : 'y agrega tu sitio.'}
                  </p>
                </div>

                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h4 className="font-semibold text-[#0A2540]">{isEn ? '3. Submit Your Sitemap' : '3. Envía tu Sitemap'}</h4>
                  <p className="text-sm text-slate-600">{isEn ? 'In Search Console, go to "Sitemaps" and submit your sitemap.xml URL' : 'En Search Console, ve a "Sitemaps" y envía la URL de tu sitemap.xml'}</p>
                </div>

                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h4 className="font-semibold text-[#0A2540]">{isEn ? '4. Create Frequent Content' : '4. Crea Contenido Frecuente'}</h4>
                  <p className="text-sm text-slate-600">{isEn ? 'Publish blog posts regularly with relevant keywords.' : 'Publica artículos en el blog regularmente con palabras clave relevantes.'}</p>
                </div>

                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h4 className="font-semibold text-[#0A2540]">{isEn ? '5. Get External Links' : '5. Consigue Enlaces Externos'}</h4>
                  <p className="text-sm text-slate-600">{isEn ? 'Have other academic websites, universities, or publications link to your site.' : 'Que otras webs académicas, universidades o publicaciones enlacen a tu sitio.'}</p>
                </div>

                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h4 className="font-semibold text-[#0A2540]">6. Google My Business</h4>
                  <p className="text-sm text-slate-600">
                    {isEn ? 'If you have a physical location, create a profile at' : 'Si tienes ubicación física, crea un perfil en'} <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">business.google.com <ExternalLink className="w-3 h-3" /></a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {isEn ? 'Keyword Tips' : 'Consejos de Palabras Clave'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  {isEn ? 'For an academic researcher, these are recommended keywords:' : 'Para un investigador académico, estas son palabras clave recomendadas:'}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {(isEn ? [
                    'Dra. María de los Ángeles Quezada',
                    'usability researcher',
                    'autism applications Mexico',
                    'human-computer interaction',
                    'AI in healthcare',
                    'ITT researcher',
                    'academic publications',
                    'computational thinking'
                  ] : [
                    'Dra. María de los Ángeles Quezada',
                    'investigadora usabilidad',
                    'aplicaciones autismo México',
                    'interacción humano-computadora',
                    'IA en salud',
                    'investigadora ITT',
                    'publicaciones académicas',
                    'pensamiento computacional'
                  ]).map(keyword => (
                    <Badge key={keyword} variant="outline" className="bg-slate-50">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {isEn ? 'Important' : 'Importante'}
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {isEn ? 'SEO ranking takes time (weeks or months). Be consistent with content and optimization.' : 'El posicionamiento SEO toma tiempo (semanas o meses). Sé constante con el contenido y la optimización.'}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">{isEn ? 'Useful Links' : 'Enlaces Útiles'}</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>
                      <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        Google Search Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        Google Analytics <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        Google My Business <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}