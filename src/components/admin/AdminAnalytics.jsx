import React from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, MessageSquare, Share2, Search, Clock, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalytics() {
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => contentClient.entities.BlogPost.list()
  });

  const { data: analyticsEvents = [] } = useQuery({
    queryKey: ['admin-analytics-events'],
    queryFn: () => contentClient.entities.AnalyticsEvent.list('-created_date', 500)
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => contentClient.entities.Comment.list()
  });

  // Calculate stats
  const totalViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = blogPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = comments.length;
  const totalShares = analyticsEvents.filter(e => e.event_type === 'share').length;

  // Top posts by views
  const topPosts = [...blogPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.title?.substring(0, 30) + '...',
      views: p.views || 0,
      likes: p.likes || 0
    }));

  // Events by type
  const eventsByType = analyticsEvents.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  const eventTypeData = Object.entries(eventsByType).map(([name, value]) => ({
    name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
    value
  }));

  // Daily activity (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = analyticsEvents.filter(e => e.created_date?.startsWith(dateStr));
    last7Days.push({
      date: date.toLocaleDateString('es', { weekday: 'short' }),
      eventos: dayEvents.length
    });
  }

  const COLORS = ['#0A2540', '#D4AF37', '#1e3a5f', '#f4d03f', '#64748b', '#94a3b8'];

  const stats = [
    { label: "Vistas Totales", value: totalViews, icon: Eye, color: "bg-blue-500" },
    { label: "Likes Totales", value: totalLikes, icon: Heart, color: "bg-pink-500" },
    { label: "Comentarios", value: totalComments, icon: MessageSquare, color: "bg-green-500" },
    { label: "Compartidos", value: totalShares, icon: Share2, color: "bg-purple-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 bg-white">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2540]">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="p-6 bg-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            Actividad de los Últimos 7 Días
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="eventos" 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  dot={{ fill: '#0A2540', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Event Types Pie Chart */}
        <Card className="p-6 bg-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            Tipos de Eventos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Posts */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#D4AF37]" />
          Posts Más Vistos
        </h3>
        {topPosts.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPosts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={150} />
                <Tooltip />
                <Bar dataKey="views" fill="#0A2540" radius={[0, 4, 4, 0]} />
                <Bar dataKey="likes" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-12">No hay datos de posts aún</p>
        )}
      </Card>

      {/* Recent Events Table */}
      <Card className="p-6 bg-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          Eventos Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Página/Contenido</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {analyticsEvents.slice(0, 10).map((event) => (
                <tr key={event.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                      {event.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {event.content_title || event.page || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(event.created_date).toLocaleString('es')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analyticsEvents.length === 0 && (
            <p className="text-slate-500 text-center py-8">No hay eventos registrados</p>
          )}
        </div>
      </Card>
    </div>
  );
}