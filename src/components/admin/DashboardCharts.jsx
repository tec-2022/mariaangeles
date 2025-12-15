import React, { useState, useEffect } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, TrendingUp, Eye, FileText, Calendar, Mic, BookOpen, Users, MessageSquare, Mail, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Paleta de colores femeninos y elegantes
const COLORS = ['#ec4899', '#f472b6', '#db2777', '#be185d', '#a855f7', '#c084fc', '#f9a8d4', '#fda4af'];

export default function DashboardCharts() {
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const { data: blogPosts = [] } = useQuery({ queryKey: ['charts-blogs'], queryFn: () => contentClient.entities.BlogPost.list() });
  const { data: events = [] } = useQuery({ queryKey: ['charts-events'], queryFn: () => contentClient.entities.Event.list() });
  const { data: publications = [] } = useQuery({ queryKey: ['charts-pubs'], queryFn: () => contentClient.entities.Publication.list() });
  const { data: episodes = [] } = useQuery({ queryKey: ['charts-episodes'], queryFn: () => contentClient.entities.PodcastEpisode.list() });
  const { data: analytics = [] } = useQuery({ queryKey: ['charts-analytics'], queryFn: () => contentClient.entities.AnalyticsEvent.list('-created_date', 5000) });
  const { data: messages = [] } = useQuery({ queryKey: ['charts-messages'], queryFn: () => contentClient.entities.ContactMessage.list() });
  const { data: comments = [] } = useQuery({ queryKey: ['charts-comments'], queryFn: () => contentClient.entities.Comment.list() });
  const { data: subscribers = [] } = useQuery({ queryKey: ['charts-subs'], queryFn: () => contentClient.entities.Subscriber.list() });

  // Content distribution data
  const contentData = [
    { name: 'Blog Posts', value: blogPosts.length, icon: FileText },
    { name: 'Eventos', value: events.length, icon: Calendar },
    { name: 'Publicaciones', value: publications.length, icon: BookOpen },
    { name: 'Podcast', value: episodes.length, icon: Mic },
  ].filter(d => d.value > 0);

  // Blog categories
  const categoryData = Object.entries(
    blogPosts.reduce((acc, p) => { acc[p.category || 'Sin categoría'] = (acc[p.category || 'Sin categoría'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Publication types
  const pubTypeData = Object.entries(
    publications.reduce((acc, p) => { acc[p.type || 'Otro'] = (acc[p.type || 'Otro'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Page views by page - from database analytics
  const pageViewsData = Object.entries(
    analytics.filter(e => e.event_type === 'page_view' && e.page)
      .reduce((acc, e) => { 
        const pageName = e.page.replace('/', '') || 'Home';
        acc[pageName] = (acc[pageName] || 0) + 1; 
        return acc; 
      }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, views: value }));

  // Engagement metrics from analytics
  const engagementData = {
    likes: analytics.filter(e => e.event_type === 'engagement' && e.value?.includes('"type":"like"')).length,
    comments: analytics.filter(e => e.event_type === 'engagement' && e.value?.includes('"type":"comment"')).length,
    shares: analytics.filter(e => e.event_type === 'share').length,
    searches: analytics.filter(e => e.event_type === 'search').length,
    contentViews: analytics.filter(e => e.event_type === 'content_view').length,
    clicks: analytics.filter(e => e.event_type === 'click').length
  };

  // Traffic sources from referrer
  const trafficSourcesData = Object.entries(
    analytics.reduce((acc, e) => {
      const ref = e.referrer || 'direct';
      let source = 'Directo';
      if (ref.includes('google')) source = 'Google';
      else if (ref.includes('facebook')) source = 'Facebook';
      else if (ref.includes('twitter') || ref.includes('x.com')) source = 'Twitter/X';
      else if (ref.includes('linkedin')) source = 'LinkedIn';
      else if (ref !== 'direct' && ref !== '') source = 'Otros';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Activity last 7 days - from database analytics
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayAnalytics = analytics.filter(e => e.created_date?.startsWith(dateStr));
    last7Days.push({
      date: date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }),
      visitas: dayAnalytics.filter(e => e.event_type === 'page_view').length,
      interacciones: dayAnalytics.filter(e => ['engagement', 'share', 'click', 'content_view'].includes(e.event_type)).length
    });
  }

  // Unique sessions count
  const uniqueSessions = [...new Set(analytics.map(a => a.session_id).filter(Boolean))].length;

  // Device breakdown from user agents
  const deviceData = analytics.reduce((acc, e) => {
    const ua = e.user_agent || '';
    if (/mobile/i.test(ua) && !/tablet|ipad/i.test(ua)) acc.mobile++;
    else if (/tablet|ipad/i.test(ua)) acc.tablet++;
    else acc.desktop++;
    return acc;
  }, { desktop: 0, mobile: 0, tablet: 0 });
  const deviceChartData = Object.entries(deviceData).filter(([,v]) => v > 0).map(([name, value]) => ({ 
    name: name === 'desktop' ? 'Escritorio' : name === 'mobile' ? 'Móvil' : 'Tablet', 
    value 
  }));

  // Generate AI insights
  useEffect(() => {
    const generateInsights = async () => {
      if (blogPosts.length === 0 && analytics.length === 0) return;
      
      setLoadingInsights(true);
      
      const topPost = blogPosts.sort((a, b) => (b.views || 0) - (a.views || 0))[0];
      const topCategory = categoryData.sort((a, b) => b.value - a.value)[0];
      const totalViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = blogPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

      const result = await contentClient.integrations.Core.InvokeLLM({
        prompt: `Eres un analista de datos para el sitio web de un investigador académico. Analiza estos datos y da 3 insights breves y accionables:

DATOS:
- ${blogPosts.length} posts de blog (${blogPosts.filter(p => p.published).length} publicados)
- ${totalViews} vistas totales, ${totalLikes} likes
- Post más visto: "${topPost?.title}" con ${topPost?.views || 0} vistas
- Categoría más popular: ${topCategory?.name} (${topCategory?.value} posts)
- ${events.length} eventos, ${publications.length} publicaciones académicas, ${episodes.length} episodios podcast
- ${analytics.length} eventos de analytics registrados

Da exactamente 3 insights cortos (máximo 2 líneas cada uno) con recomendaciones específicas. Enfócate en:
1. Qué contenido funciona mejor
2. Oportunidades de mejora
3. Una idea creativa para aumentar engagement`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string", enum: ["success", "warning", "idea"] }
                }
              }
            }
          }
        }
      });

      setAiInsights(result.insights);
      setLoadingInsights(false);
    };

    if (blogPosts.length > 0 || analytics.length > 0) {
      generateInsights();
    }
  }, [blogPosts.length, analytics.length]);

  // Quick stats calculations
  const totalViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = blogPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const unreadMessages = messages.filter(m => !m.read && !m.archived).length;
  const pendingComments = comments.filter(c => !c.approved).length;
  const publishedPosts = blogPosts.filter(p => p.published).length;
  const upcomingEvents = events.filter(e => e.is_upcoming).length;

  // Total page views from analytics
  const totalPageViews = analytics.filter(e => e.event_type === 'page_view').length;

  const quickStats = [
    { label: 'Visitas Web', value: totalPageViews, icon: Eye, color: 'text-pink-600 bg-gradient-to-br from-pink-50 to-pink-100', accent: 'border-l-4 border-pink-400' },
    { label: 'Sesiones', value: uniqueSessions, icon: Users, color: 'text-fuchsia-600 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100', accent: 'border-l-4 border-fuchsia-400' },
    { label: 'Contenido Visto', value: engagementData.contentViews, icon: FileText, color: 'text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100', accent: 'border-l-4 border-purple-400' },
    { label: 'Interacciones', value: engagementData.likes + engagementData.comments + engagementData.shares, icon: Heart, color: 'text-rose-600 bg-gradient-to-br from-rose-50 to-rose-100', accent: 'border-l-4 border-rose-400' },
    { label: 'Suscriptores', value: subscribers.filter(s => s.active).length, icon: Users, color: 'text-violet-600 bg-gradient-to-br from-violet-50 to-violet-100', accent: 'border-l-4 border-violet-400' },
    { label: 'Mensajes', value: unreadMessages, icon: Mail, color: unreadMessages > 0 ? 'text-red-500 bg-gradient-to-br from-red-50 to-red-100' : 'text-pink-400 bg-gradient-to-br from-pink-50 to-slate-50', accent: unreadMessages > 0 ? 'border-l-4 border-red-400' : 'border-l-4 border-pink-300' },
    { label: 'Búsquedas', value: engagementData.searches, icon: Eye, color: 'text-amber-500 bg-gradient-to-br from-amber-50 to-orange-50', accent: 'border-l-4 border-amber-400' },
    { label: 'Compartidos', value: engagementData.shares, icon: TrendingUp, color: 'text-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50', accent: 'border-l-4 border-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👩‍🏫</span>
            <h2 className="text-2xl font-bold">¡Bienvenida, Dra. Quezada!</h2>
          </div>
          <p className="text-pink-100 text-sm">Panel de administración de tu sitio académico</p>
        </div>
        <div className="absolute top-4 right-4 text-6xl opacity-20">✨</div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {quickStats.map((stat, idx) => (
          <Card key={idx} className={`p-4 bg-white text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl ${stat.accent}`}>
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">{stat.value}</div>
            <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Distribution */}
        <Card className="p-6 bg-gradient-to-br from-white to-pink-50/50 rounded-xl border border-pink-100 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            Distribución de Contenido
          </h3>
          {contentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={contentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {contentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">Sin datos</p>
          )}
        </Card>

        {/* Blog Categories */}
        <Card className="p-6 bg-gradient-to-br from-white to-fuchsia-50/50 rounded-xl border border-fuchsia-100 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>
            Categorías del Blog
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">Sin datos</p>
          )}
        </Card>

        {/* Traffic Sources */}
        <Card className="p-6 bg-gradient-to-br from-white to-purple-50/50 rounded-xl border border-purple-100 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Fuentes de Tráfico
          </h3>
          {trafficSourcesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={trafficSourcesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {trafficSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">Sin datos de tráfico</p>
          )}
        </Card>
      </div>

      {/* Devices & More Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Devices */}
        <Card className="p-6 bg-gradient-to-br from-white to-indigo-50/50 rounded-xl border border-indigo-100 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Dispositivos
          </h3>
          {deviceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">Sin datos</p>
          )}
        </Card>

        {/* Engagement Types */}
        <Card className="p-6 bg-gradient-to-br from-white to-rose-50/50 rounded-xl border border-rose-100 hover:shadow-lg transition-shadow col-span-2">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Tipos de Interacción
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-600">{engagementData.likes}</div>
              <div className="text-xs text-slate-500">Likes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{engagementData.comments}</div>
              <div className="text-xs text-slate-500">Comentarios</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{engagementData.shares}</div>
              <div className="text-xs text-slate-500">Compartidos</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <Eye className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">{engagementData.contentViews}</div>
              <div className="text-xs text-slate-500">Vistas Contenido</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Page Views - Use blog views if no analytics */}
        <Card className="p-6 bg-gradient-to-br from-white to-rose-50/50 rounded-xl border border-rose-100 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            Contenido Más Visto
          </h3>
          {pageViewsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pageViewsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#db2777" radius={[0, 4, 4, 0]} name="Vistas" />
              </BarChart>
            </ResponsiveContainer>
          ) : blogPosts.some(p => p.views > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={blogPosts.filter(p => p.views > 0).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(p => ({ name: p.title?.substring(0, 25) + '...', views: p.views || 0 }))} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#db2777" radius={[0, 4, 4, 0]} name="Vistas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Las vistas se registrarán cuando los usuarios visiten el sitio</p>
            </div>
          )}
        </Card>

        {/* Activity Trend */}
        <Card className="p-6 bg-gradient-to-br from-white to-violet-50/50 rounded-xl border border-violet-100 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-[#4a4a4a] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-400 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Actividad Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last7Days}>
              <defs>
                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899"/>
                  <stop offset="100%" stopColor="#a855f7"/>
                </linearGradient>
                <linearGradient id="lineGradient2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #f9a8d4',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="visitas" 
                stroke="url(#lineGradient)" 
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 5, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#db2777', stroke: '#fff', strokeWidth: 3 }}
                name="Visitas"
              />
              <Line 
                type="monotone" 
                dataKey="interacciones" 
                stroke="url(#lineGradient2)" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
                name="Interacciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Insights - At the bottom */}
      <Card className="p-6 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Insights de IA ✨</h3>
              <p className="text-xs text-pink-100">Análisis inteligente de tu contenido</p>
            </div>
          </div>
          {loadingInsights ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-pink-200" />
              <span className="text-pink-100">Analizando datos...</span>
            </div>
          ) : aiInsights ? (
            <div className="grid md:grid-cols-3 gap-4">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl backdrop-blur-sm ${
                  insight.type === 'success' ? 'bg-emerald-400/20 border border-emerald-300/30' : 
                  insight.type === 'warning' ? 'bg-amber-400/20 border border-amber-300/30' : 'bg-white/20 border border-white/30'
                }`}>
                  <p className="font-semibold text-sm mb-1">{insight.title}</p>
                  <p className="text-xs text-pink-100">{insight.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-pink-200 py-4">No hay suficientes datos para generar insights</p>
          )}
        </div>
      </Card>
    </div>
  );
}