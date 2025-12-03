import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../shared/LanguageContext";

export default function HeroSection() {
  const { t, language } = useLanguage();
  
  // Fetch latest content for announcement
  const { data: latestNews = [] } = useQuery({
    queryKey: ['hero-news'],
    queryFn: () => base44.entities.NewsItem.filter({ published: true }, '-date', 1)
  });

  const { data: latestPost = [] } = useQuery({
    queryKey: ['hero-post'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date', 1)
  });

  const { data: latestEpisode = [] } = useQuery({
    queryKey: ['hero-episode'],
    queryFn: () => base44.entities.PodcastEpisode.filter({ published: true }, '-date', 1)
  });

  const { data: latestPublication = [] } = useQuery({
    queryKey: ['hero-publication'],
    queryFn: () => base44.entities.Publication.list('-created_date', 1)
  });

  const { data: latestEvent = [] } = useQuery({
    queryKey: ['hero-event'],
    queryFn: () => base44.entities.Event.filter({ is_upcoming: true }, '-created_date', 1)
  });

  // Get the most recent item for announcement
  const getAnnouncement = () => {
    const items = [
      latestNews[0] && { 
        date: new Date(latestNews[0].date || latestNews[0].created_date),
        text: language === 'en' && latestNews[0].title_en ? latestNews[0].title_en : latestNews[0].title,
        type: 'news',
        link: 'Blog',
        btnText: language === 'es' ? 'Ver Noticias' : 'View News'
      },
      latestPost[0] && {
        date: new Date(latestPost[0].created_date),
        text: language === 'en' && latestPost[0].title_en ? latestPost[0].title_en : latestPost[0].title,
        type: 'blog',
        link: 'Blog',
        btnText: language === 'es' ? 'Leer Artículo' : 'Read Article'
      },
      latestEpisode[0] && {
        date: new Date(latestEpisode[0].date || latestEpisode[0].created_date),
        text: `🎙️ ${language === 'en' && latestEpisode[0].title_en ? latestEpisode[0].title_en : latestEpisode[0].title}`,
        type: 'podcast',
        link: 'Podcast',
        btnText: language === 'es' ? 'Escuchar Episodio' : 'Listen Episode'
      },
      latestPublication[0] && {
        date: new Date(latestPublication[0].created_date),
        text: `📚 ${language === 'en' && latestPublication[0].title_en ? latestPublication[0].title_en : latestPublication[0].title}`,
        type: 'publication',
        link: 'Publications',
        btnText: language === 'es' ? 'Ver Publicación' : 'View Publication'
      },
      latestEvent[0] && {
        date: new Date(latestEvent[0].created_date),
        text: `📅 ${language === 'en' && latestEvent[0].title_en ? latestEvent[0].title_en : latestEvent[0].title}`,
        type: 'event',
        link: 'Events',
        btnText: language === 'es' ? 'Ver Evento' : 'View Event'
      }
    ].filter(Boolean);

    if (items.length === 0) {
      return { text: t('home.announcement'), isNew: false, link: 'Publications', btnText: t('common.viewPublications') };
    }

    // Sort by date and get the most recent
    items.sort((a, b) => b.date - a.date);
    const newest = items[0];
    const isNew = (Date.now() - newest.date.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 days

    return { text: newest.text, isNew, link: newest.link, btnText: newest.btnText };
  };

  const announcement = getAnnouncement();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a]">
      {/* Optimized background - CSS only, no heavy animations */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[#ec4899]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-pink-400/8 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ec4899%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Announcement badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards] max-w-[90%] md:max-w-lg overflow-hidden"
          >
            {announcement.isNew ? (
              <Sparkles className="w-4 h-4 text-[#ec4899] flex-shrink-0" />
            ) : (
              <Bell className="w-4 h-4 text-[#ec4899] flex-shrink-0" />
            )}
            <div className="overflow-hidden">
              <span className="text-white text-sm font-medium whitespace-nowrap inline-block animate-[marquee_8s_linear_infinite] hover:pause">
                {announcement.isNew && <span className="text-[#ec4899] mr-1">{language === 'es' ? '¡Nuevo!' : 'New!'}</span>}
                {announcement.text}
                <span className="mx-8">•</span>
                {announcement.isNew && <span className="text-[#ec4899] mr-1">{language === 'es' ? '¡Nuevo!' : 'New!'}</span>}
                {announcement.text}
              </span>
            </div>
          </div>

          {/* Main heading with optimized animation */}
          <h1 
            className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight opacity-0 animate-[fadeInUp_0.8s_ease-out_0.1s_forwards]"
          >
            {t('home.heroTitle')}
          </h1>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]"
          >
            {t('home.heroSubtitle')}
          </p>

          {/* CTA buttons */}
          <div 
            className="flex flex-wrap justify-center gap-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]"
          >
            <Link to={createPageUrl(announcement.link)}>
              <Button className="px-8 h-12 bg-[#db2777] hover:bg-[#be185d] text-white transition-all duration-300 hover:shadow-2xl hover:shadow-[#db2777]/30 shadow-xl group">
                {announcement.btnText}
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" className="px-8 h-12 border-white/30 text-white hover:text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm bg-white/5 transition-all duration-300">
                {t('common.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator - simplified */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-60 hover:opacity-100 transition-opacity">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full p-1 animate-[bounce_2s_ease-in-out_infinite]">
          <div className="w-1.5 h-3 bg-white/60 rounded-full mx-auto animate-[scrollDown_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDown {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}