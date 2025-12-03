import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, FileText, Calendar, BookOpen, Mic, Image, 
  Settings, MessageSquare, LogOut, Menu, X,
  FlaskConical, GraduationCap, User, Share2, 
  Mail, Bot, Users, Search, Lightbulb, Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Admin components - lazy loaded
import AdminBlogPosts from "../components/admin/AdminBlogPosts";
import AdminEvents from "../components/admin/AdminEvents";
import AdminPublications from "../components/admin/AdminPublications";
import AdminPodcast from "../components/admin/AdminPodcast";
import AdminGallery from "../components/admin/AdminGallery";
import AdminComments from "../components/admin/AdminComments";
import AdminSettings from "../components/admin/AdminSettings";
// AdminAnalytics removed - analytics included in Dashboard
import AdminResearch from "../components/admin/AdminResearch";
import AdminResearchLines from "../components/admin/AdminResearchLines";
import AdminCourses from "../components/admin/AdminCourses";
import AdminThesis from "../components/admin/AdminThesis";
import AdminResearchers from "../components/admin/AdminResearchers";
// AdminNews removed - news managed via NewsItem entity in About section
import AdminAbout from "../components/admin/AdminAbout";
import AdminProfile from "../components/admin/AdminProfile";
import AdminSocialLinks from "../components/admin/AdminSocialLinks";
import AdminCertificates from "../components/admin/AdminCertificates";
import AdminMessages from "../components/admin/AdminMessages";
import AdminAssistant from "../components/admin/AdminAssistant";
import DashboardCharts from "../components/admin/DashboardCharts";
import AdminUsers from "../components/admin/AdminUsers";
import AdminSEO from "../components/admin/AdminSEO";
import AdminSubscribers from "../components/admin/AdminSubscribers";
import AdminNewsletter from "../components/admin/AdminNewsletter";
import AccessDenied from "../components/admin/AccessDenied";
import AdminDocumentation from "../components/admin/AdminDocumentation";

export default function Admin() {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const currentUser = await base44.auth.me();
        // Allow admin and editor roles
        if (currentUser.role === 'admin' || currentUser.role === 'editor') {
          setUser(currentUser);
          setAuthState('authenticated');
        } else {
          // User is logged in but doesn't have permission
          setUser(currentUser);
          setAuthState('denied');
        }
      } else {
        // Not logged in - redirect to login
        base44.auth.redirectToLogin(window.location.href);
        setAuthState('unauthenticated');
      }
    } catch (error) {
      base44.auth.redirectToLogin(window.location.href);
      setAuthState('unauthenticated');
    }
  };

  // Single query for badges
  const { data: badgeCounts = { unreadMessages: 0, pendingComments: 0 } } = useQuery({
    queryKey: ['admin-badge-counts'],
    queryFn: async () => {
      const [comments, messages] = await Promise.all([
        base44.entities.Comment.list(),
        base44.entities.ContactMessage.list()
      ]);
      return {
        unreadMessages: messages.filter(m => !m.read && !m.archived).length,
        pendingComments: comments.filter(c => !c.approved).length
      };
    },
    enabled: authState === 'authenticated',
    refetchInterval: 30000
  });

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#4a4a4a]">
        <div className="animate-spin w-8 h-8 border-4 border-[#db2777] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (authState === 'denied') {
    return <AccessDenied />;
  }

  if (authState !== 'authenticated') return null;

  // Consolidated menu - flat structure, no scroll needed
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
    { id: "assistant", label: "Asistente IA", icon: Bot, group: "main" },
    { id: "profile", label: "Mi Perfil", icon: User, group: "main" },
    { id: "about", label: "Acerca de mí", icon: FileText, group: "content" },
    { id: "blog", label: "Blog", icon: FileText, group: "content" },
    { id: "publications", label: "Publicaciones", icon: BookOpen, group: "content" },
    { id: "research", label: "Proyectos Inv.", icon: FlaskConical, group: "content" },
    { id: "research-lines", label: "Líneas Inv.", icon: Lightbulb, group: "content" },
    { id: "researchers", label: "Grupo Inv.", icon: Users, group: "content" },
    { id: "courses", label: "Cursos", icon: GraduationCap, group: "content" },
    { id: "thesis", label: "Tesis", icon: GraduationCap, group: "content" },
    { id: "events", label: "Eventos", icon: Calendar, group: "media" },
    { id: "podcast", label: "Podcast", icon: Mic, group: "media" },
    { id: "gallery", label: "Galería", icon: Image, group: "media" },
    { id: "messages", label: "Mensajes", icon: Mail, badge: badgeCounts.unreadMessages, group: "engage" },
    { id: "comments", label: "Comentarios", icon: MessageSquare, badge: badgeCounts.pendingComments, group: "engage" },
    { id: "subscribers", label: "Suscriptores", icon: Users, group: "engage" },
          { id: "newsletter", label: "Newsletter", icon: Mail, group: "engage" },
    { id: "social", label: "Redes Sociales", icon: Share2, group: "config" },
    { id: "users", label: "Usuarios", icon: Users, group: "config" },
    { id: "seo", label: "SEO", icon: Search, group: "config" },
    { id: "settings", label: "Ajustes", icon: Settings, group: "config" },
    { id: "docs", label: "Documentación", icon: Book, group: "config" },
  ];

  const groups = [
    { id: "main", label: "Principal" },
    { id: "content", label: "Contenido" },
    { id: "media", label: "Media" },
    { id: "engage", label: "Engagement" },
    { id: "config", label: "Config" },
  ];

  const renderContent = () => {
    const components = {
      dashboard: DashboardCharts,
      assistant: AdminAssistant,
      profile: AdminProfile,
      about: AdminAbout,
      blog: AdminBlogPosts,
      publications: AdminPublications,
      research: AdminResearch,
      "research-lines": AdminResearchLines,
      researchers: AdminResearchers,
      courses: AdminCourses,
      thesis: AdminThesis,
      events: AdminEvents,
      podcast: AdminPodcast,
      gallery: AdminGallery,
      messages: AdminMessages,
      comments: AdminComments,
      subscribers: AdminSubscribers,
            newsletter: AdminNewsletter,
      social: AdminSocialLinks,
      users: AdminUsers,
      seo: AdminSEO,
      settings: AdminSettings,
      docs: AdminDocumentation,
    };
    const Component = components[activeSection];
    return Component ? <Component /> : null;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-100 flex">
        {/* Sidebar - Fixed height, no scroll */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-[#4a4a4a] text-white transition-all duration-300 fixed h-screen z-50 flex flex-col`}>
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center font-serif font-bold text-white text-sm">
                  MQ
                </div>
                <span className="font-bold text-sm">Admin</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center font-serif font-bold text-white text-sm mx-auto">
                MQ
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10 h-8 w-8"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation - Compact */}
          <nav className="flex-1 p-2 space-y-1">
            {groups.map((group) => (
              <div key={group.id}>
                {sidebarOpen && (
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mt-2 first:mt-0">
                    {group.label}
                  </p>
                )}
                {menuItems.filter(item => item.group === group.id).map((item) => (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all ${
                          activeSection === item.id 
                            ? 'bg-[#db2777] text-white' 
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {sidebarOpen && (
                          <>
                            <span className="text-xs font-medium flex-1 text-left truncate">{item.label}</span>
                            {item.badge > 0 && (
                              <Badge className="bg-red-500 text-white text-[10px] px-1 py-0 h-4 min-w-4">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                        {!sidebarOpen && item.badge > 0 && (
                          <span className="absolute right-1 top-0 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </button>
                    </TooltipTrigger>
                    {!sidebarOpen && (
                      <TooltipContent side="right">
                        {item.label}
                        {item.badge > 0 && ` (${item.badge})`}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t border-white/10 flex-shrink-0">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => base44.auth.logout('/Admin')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-300 hover:bg-white/10 transition-all"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="text-xs font-medium">Salir</span>}
                </button>
              </TooltipTrigger>
              {!sidebarOpen && <TooltipContent side="right">Cerrar Sesión</TooltipContent>}
            </Tooltip>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-56' : 'ml-16'} transition-all duration-300`}>
          {/* Header */}
          <header className="bg-white shadow-sm px-6 py-3 sticky top-0 z-40">
            <h1 className="text-xl font-bold text-[#4a4a4a]">
              {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </header>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}